import { Account } from '../models/index.js';

const ACCOUNT_TYPES = ['cash', 'card', 'bank', 'savings'];

function validateAccount(body, { partial = false } = {}) {
  if (!partial || body.name !== undefined) {
    if (!body.name || !String(body.name).trim()) {
      return 'name is required';
    }
  }

  if (!partial || body.type !== undefined) {
    if (!body.type) {
      return 'type is required';
    }
    if (!ACCOUNT_TYPES.includes(body.type)) {
      return 'type must be cash, card, bank, or savings';
    }
  }

  if (body.balance !== undefined && body.balance !== null && body.balance !== '') {
    if (Number.isNaN(Number(body.balance))) {
      return 'balance must be numeric';
    }
  }

  return null;
}

function toAccountPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.name !== undefined) {
    payload.name = String(body.name).trim();
  }
  if (!partial || body.type !== undefined) {
    payload.type = body.type;
  }
  if (!partial || body.balance !== undefined) {
    payload.balance = body.balance === undefined || body.balance === '' ? 0 : body.balance;
  }
  if (!partial || body.currency !== undefined) {
    payload.currency = body.currency || 'AMD';
  }

  return payload;
}

export async function list(req, res) {
  try {
    const accounts = await Account.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, is_active: true },
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function create(req, res) {
  try {
    const error = validateAccount(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const account = await Account.create(toAccountPayload(req.body));
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function update(req, res) {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, is_active: true },
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const error = validateAccount(req.body, { partial: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await account.update(toAccountPayload(req.body, { partial: true }));
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function remove(req, res) {
  try {
    const account = await Account.findOne({
      where: { id: req.params.id, is_active: true },
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await account.update({ is_active: false });
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
