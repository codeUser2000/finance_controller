import { BudgetItem, Category } from '../models/index.js';

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

function validateBudget(body, { partial = false } = {}) {
  if (!partial || body.category_id !== undefined) {
    if (body.category_id === undefined || body.category_id === null || body.category_id === '') {
      return 'category_id is required';
    }
  }

  if (!partial || body.month !== undefined) {
    const month = parsePositiveInt(body.month);
    if (month === null || month < 1 || month > 12) {
      return 'month must be between 1 and 12';
    }
  }

  if (!partial || body.year !== undefined) {
    const year = parsePositiveInt(body.year);
    if (year === null || year < 1) {
      return 'year is required';
    }
  }

  if (!partial || body.amount !== undefined) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount < 0) {
      return 'amount must be greater than or equal to 0';
    }
  }

  if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
    return 'is_active must be a boolean';
  }

  return null;
}

function toBudgetPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.category_id !== undefined) {
    payload.category_id = body.category_id;
  }
  if (!partial || body.month !== undefined) {
    payload.month = Number(body.month);
  }
  if (!partial || body.year !== undefined) {
    payload.year = Number(body.year);
  }
  if (!partial || body.amount !== undefined) {
    payload.amount = body.amount;
  }
  if (!partial || body.is_active !== undefined) {
    payload.is_active = body.is_active;
  }

  return payload;
}

function uniqueConstraintMessage(error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    return 'A budget already exists for this category, month, and year';
  }
  return error.message;
}

function categoryInclude(req) {
  return {
    model: Category,
    as: 'Category',
    where: { user_id: req.user.id },
    required: true,
  };
}

async function findOwnedCategory(req, categoryId) {
  return Category.findOne({
    where: { id: categoryId, user_id: req.user.id, is_active: true },
  });
}

export async function list(req, res) {
  try {
    const where = {};
    if (req.query.month !== undefined) {
      const month = parsePositiveInt(req.query.month);
      if (month === null || month < 1 || month > 12) {
        return res.status(400).json({ success: false, message: 'month must be between 1 and 12' });
      }
      where.month = month;
    }
    if (req.query.year !== undefined) {
      const year = parsePositiveInt(req.query.year);
      if (year === null) {
        return res.status(400).json({ success: false, message: 'year must be a valid integer' });
      }
      where.year = year;
    }

    const budgets = await BudgetItem.findAll({
      where,
      include: [categoryInclude(req)],
      order: [['year', 'DESC'], ['month', 'DESC'], ['id', 'ASC']],
    });

    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getById(req, res) {
  try {
    const budget = await BudgetItem.findByPk(req.params.id, {
      include: [categoryInclude(req)],
    });

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function create(req, res) {
  try {
    const error = validateBudget(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const category = await findOwnedCategory(req, req.body.category_id);
    if (!category) {
      return res.status(400).json({ success: false, message: 'category_id must belong to an active category' });
    }

    const budget = await BudgetItem.create(toBudgetPayload(req.body));
    await budget.reload({ include: [categoryInclude(req)] });
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    const status = error.name === 'SequelizeUniqueConstraintError' ? 400 : 500;
    res.status(status).json({ success: false, message: uniqueConstraintMessage(error) });
  }
}

export async function update(req, res) {
  try {
    const budget = await BudgetItem.findByPk(req.params.id, {
      include: [categoryInclude(req)],
    });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    const error = validateBudget(req.body, { partial: true });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    if (req.body.category_id !== undefined) {
      const category = await findOwnedCategory(req, req.body.category_id);
      if (!category) {
        return res.status(400).json({ success: false, message: 'category_id must belong to an active category' });
      }
    }

    await budget.update(toBudgetPayload(req.body, { partial: true }));
    await budget.reload({ include: [categoryInclude(req)] });
    res.json({ success: true, data: budget });
  } catch (error) {
    const status = error.name === 'SequelizeUniqueConstraintError' ? 400 : 500;
    res.status(status).json({ success: false, message: uniqueConstraintMessage(error) });
  }
}

export async function remove(req, res) {
  try {
    const budget = await BudgetItem.findByPk(req.params.id, {
      include: [categoryInclude(req)],
    });
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    await budget.destroy();
    res.json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
