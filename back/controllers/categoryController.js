import { Category } from '../models/index.js';

const CATEGORY_TYPES = ['expense', 'income'];

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

  return payload;
}

export async function list(req, res) {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, is_active: true },
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

    const category = await Category.create(toCategoryPayload(req.body));
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function update(req, res) {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, is_active: true },
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
      where: { id: req.params.id, is_active: true },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.update({ is_active: false });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
