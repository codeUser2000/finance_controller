import { Account, Goal } from '../models/index.js';

function owned(req) {
  return { user_id: req.user.id, is_active: true };
}

function includes() {
  return [
    {
      model: Account,
      as: 'Account',
      attributes: ['id', 'name', 'type', 'balance', 'currency'],
    },
  ];
}

function serializeGoal(goal) {
  const json = goal.toJSON();
  if (json.Account) {
    json.current_amount = json.Account.balance;
  }
  return json;
}

async function findOwnedAccount(req, accountId) {
  if (!accountId) return null;
  return Account.findOne({
    where: { id: accountId, user_id: req.user.id, is_active: true },
  });
}

function validateGoal(body, { partial = false } = {}) {
  if (!partial || body.title !== undefined) {
    if (!body.title || !String(body.title).trim()) {
      return 'title is required';
    }
  }

  const hasAccount = body.account_id !== undefined && body.account_id !== null && body.account_id !== '';

  if (!hasAccount && (!partial || body.current_amount !== undefined)) {
    const current = Number(body.current_amount);
    if (Number.isNaN(current) || current < 0) {
      return 'current_amount must be greater than or equal to 0';
    }
  }

  if (!partial || body.target_amount !== undefined) {
    const target = Number(body.target_amount);
    if (Number.isNaN(target) || target <= 0) {
      return 'target_amount must be greater than 0';
    }
  }

  return null;
}

async function toGoalPayload(req, body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.title !== undefined) {
    payload.title = String(body.title).trim();
  }
  if (!partial || body.target_amount !== undefined) {
    payload.target_amount = body.target_amount;
  }
  if (!partial || body.account_id !== undefined) {
    payload.account_id = body.account_id || null;
  }

  const accountId =
    body.account_id !== undefined ? body.account_id || null : undefined;

  if (accountId) {
    const account = await findOwnedAccount(req, accountId);
    if (!account) {
      throw Object.assign(new Error('account_id must belong to an active account'), { status: 400 });
    }
    payload.account_id = account.id;
    payload.current_amount = account.balance;
  } else if (accountId === null) {
    payload.account_id = null;
    if (!partial || body.current_amount !== undefined) {
      payload.current_amount =
        body.current_amount === undefined || body.current_amount === '' ? 0 : body.current_amount;
    }
  } else if (!partial || body.current_amount !== undefined) {
    payload.current_amount =
      body.current_amount === undefined || body.current_amount === '' ? 0 : body.current_amount;
  }

  return payload;
}

export async function list(req, res) {
  try {
    const goals = await Goal.findAll({
      where: owned(req),
      include: includes(),
      order: [['title', 'ASC']],
    });
    res.json({ success: true, data: goals.map(serializeGoal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, ...owned(req) },
      include: includes(),
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    res.json({ success: true, data: serializeGoal(goal) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function create(req, res) {
  try {
    const error = validateGoal(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const payload = await toGoalPayload(req, req.body);
    const goal = await Goal.create({
      ...payload,
      user_id: req.user.id,
    });
    await goal.reload({ include: includes() });
    res.status(201).json({ success: true, data: serializeGoal(goal) });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
}

export async function update(req, res) {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, ...owned(req) },
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const error = validateGoal(req.body, { partial: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const payload = await toGoalPayload(req, req.body, { partial: true });
    await goal.update(payload);
    await goal.reload({ include: includes() });
    res.json({ success: true, data: serializeGoal(goal) });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
}

export async function remove(req, res) {
  try {
    const goal = await Goal.findOne({
      where: { id: req.params.id, ...owned(req) },
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    await goal.update({ is_active: false });
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
