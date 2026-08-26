import { BudgetItem, Category, Transaction, sequelize } from '../models/index.js';

const CATEGORY_TYPES = ['expense', 'income'];

function owned(req) {
  return { user_id: req.user.id };
}

function validateCategory(body, { partial = false } = {}) {
  if (!partial || body.name !== undefined) {
    if (!body.name || !String(body.name).trim()) {
      return 'name is required';
    }
  }

  if (!partial || body.type !== undefined) {
    if (!body.type) {
      return 'type is required';
    }
    if (!CATEGORY_TYPES.includes(body.type)) {
      return 'type must be expense or income';
    }
  }

  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    return 'is_active must be a boolean';
  }

  return null;
}

function toCategoryPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.name !== undefined) {
    payload.name = String(body.name).trim();
  }
  if (!partial || body.icon !== undefined) {
    payload.icon = body.icon ?? null;
  }
  if (!partial || body.color !== undefined) {
    payload.color = body.color ?? null;
  }
  if (!partial || body.type !== undefined) {
    payload.type = body.type;
  }
  if (!partial || body.is_active !== undefined) {
    payload.is_active = body.is_active;
  }

  return payload;
}

export async function list(req, res) {
  try {
    const categories = await Category.findAll({
      where: owned(req),
      order: [
        ['is_active', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, ...owned(req) },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function create(req, res) {
  try {
    const error = validateCategory(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const category = await Category.create({
      ...toCategoryPayload(req.body),
      user_id: req.user.id,
      is_active: true,
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function update(req, res) {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, ...owned(req) },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const error = validateCategory(req.body, { partial: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    await category.update(toCategoryPayload(req.body, { partial: true }));
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function remove(req, res) {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, ...owned(req) },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await sequelize.transaction(async (t) => {
      await Transaction.update(
        { category_id: null },
        { where: { category_id: category.id, user_id: req.user.id }, transaction: t },
      );
      await BudgetItem.destroy({
        where: { category_id: category.id },
        transaction: t,
      });
      await category.destroy({ transaction: t });
    });

    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
