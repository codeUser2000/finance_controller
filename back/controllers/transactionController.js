import { Op } from 'sequelize';
import { Account, Category, Transaction, sequelize } from '../models/index.js';

const TRANSACTION_TYPES = ['expense', 'income', 'transfer'];

function parseInteger(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

function monthRange(month, year) {
  const lastDay = new Date(year, month, 0).getDate();
  const pad = (value) => String(value).padStart(2, '0');
  return {
    start: `${year}-${pad(month)}-01`,
    end: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
}

function balanceDelta(type, amount) {
  const value = Number(amount);
  return type === 'income' ? value : -value;
}

function validateTransaction(body, { partial = false } = {}) {
  if (!partial || body.type !== undefined) {
    if (!TRANSACTION_TYPES.includes(body.type)) {
      return 'type must be expense, income, or transfer';
    }
  }

  if (!partial || body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return 'amount must be greater than 0';
    }
  }

  if (!partial || body.account_id !== undefined) {
    if (!body.account_id) {
      return 'account_id is required';
    }
  }

  if (!partial || body.occurred_at !== undefined) {
    if (!body.occurred_at || Number.isNaN(Date.parse(body.occurred_at))) {
      return 'occurred_at must be a valid date';
    }
  }

  const type = body.type;
  if ((type === 'expense' || (!partial && type === 'expense')) && !body.category_id) {
    return 'category_id is required for expenses';
  }

  return null;
}

function toPayload(body, userId, { partial = false } = {}) {
  const payload = {};
  if (!partial || body.type !== undefined) payload.type = body.type;
  if (!partial || body.amount !== undefined) payload.amount = body.amount;
  if (!partial || body.category_id !== undefined) {
    payload.category_id = body.category_id || null;
  }
  if (!partial || body.account_id !== undefined) payload.account_id = body.account_id;
  if (!partial || body.note !== undefined) payload.note = body.note?.trim() || null;
  if (!partial || body.occurred_at !== undefined) payload.occurred_at = body.occurred_at;
  if (!partial) payload.user_id = userId;
  return payload;
}

function includes() {
  return [
    { model: Category, as: 'Category' },
    { model: Account, as: 'Account' },
  ];
}

async function assertAccount(req, accountId, transaction) {
  return Account.findOne({
    where: { id: accountId, user_id: req.user.id, is_active: true },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}

async function assertCategory(req, categoryId) {
  if (!categoryId) return true;
  const category = await Category.findOne({
    where: { id: categoryId, user_id: req.user.id, is_active: true },
  });
  return Boolean(category);
}

async function findOwnedTransaction(req, id) {
  return Transaction.findOne({
    where: { id, user_id: req.user.id },
    include: includes(),
  });
}

export async function list(req, res) {
  try {
    const where = { user_id: req.user.id };
    const month = req.query.month !== undefined ? parseInteger(req.query.month) : null;
    const year = req.query.year !== undefined ? parseInteger(req.query.year) : null;

    if (req.query.month !== undefined && (month === null || month < 1 || month > 12)) {
      return res.status(400).json({ success: false, message: 'month must be between 1 and 12' });
    }
    if (req.query.year !== undefined && (year === null || year < 1)) {
      return res.status(400).json({ success: false, message: 'year must be a valid integer' });
    }
    if ((month && !year) || (year && !month)) {
      return res.status(400).json({ success: false, message: 'month and year are both required' });
    }
    if (month && year) {
      const { start, end } = monthRange(month, year);
      where.occurred_at = { [Op.between]: [start, end] };
    }
    if (req.query.type) {
      if (!TRANSACTION_TYPES.includes(req.query.type)) {
        return res.status(400).json({ success: false, message: 'type must be expense, income, or transfer' });
      }
      where.type = req.query.type;
    }

    const transactions = await Transaction.findAll({
      where,
      include: includes(),
      order: [['occurred_at', 'DESC'], ['id', 'DESC']],
    });

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const transaction = await findOwnedTransaction(req, req.params.id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function create(req, res) {
  try {
    const error = validateTransaction(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }
    if (!(await assertCategory(req, req.body.category_id))) {
      return res.status(400).json({ success: false, message: 'category_id must belong to an active category' });
    }

    const created = await sequelize.transaction(async (t) => {
      const account = await assertAccount(req, req.body.account_id, t);
      if (!account) {
        throw Object.assign(new Error('account_id must belong to an active account'), { status: 400 });
      }

      const transaction = await Transaction.create(toPayload(req.body, req.user.id), { transaction: t });
      await account.increment('balance', {
        by: balanceDelta(req.body.type, req.body.amount),
        transaction: t,
      });
      return transaction;
    });

    await created.reload({ include: includes() });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
}

export async function update(req, res) {
  try {
    const existing = await Transaction.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const error = validateTransaction({ ...existing.toJSON(), ...req.body }, { partial: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const next = { ...existing.toJSON(), ...toPayload(req.body, req.user.id, { partial: true }) };
    if (next.type === 'expense' && !next.category_id) {
      return res.status(400).json({ success: false, message: 'category_id is required for expenses' });
    }
    if (!(await assertCategory(req, next.category_id))) {
      return res.status(400).json({ success: false, message: 'category_id must belong to an active category' });
    }

    await sequelize.transaction(async (t) => {
      const oldAccount = await Account.findOne({
        where: { id: existing.account_id, user_id: req.user.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (oldAccount) {
        await oldAccount.increment('balance', {
          by: -balanceDelta(existing.type, existing.amount),
          transaction: t,
        });
      }

      const nextAccount = await assertAccount(req, next.account_id, t);
      if (!nextAccount) {
        throw Object.assign(new Error('account_id must belong to an active account'), { status: 400 });
      }

      await existing.update(toPayload(req.body, req.user.id, { partial: true }), { transaction: t });
      await nextAccount.increment('balance', {
        by: balanceDelta(next.type, next.amount),
        transaction: t,
      });
    });

    await existing.reload({ include: includes() });
    res.json({ success: true, data: existing });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
}

export async function remove(req, res) {
  try {
    const existing = await Transaction.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await sequelize.transaction(async (t) => {
      const account = await Account.findOne({
        where: { id: existing.account_id, user_id: req.user.id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (account) {
        await account.increment('balance', {
          by: -balanceDelta(existing.type, existing.amount),
          transaction: t,
        });
      }
      await existing.destroy({ transaction: t });
    });

    res.json({ success: true, data: existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
