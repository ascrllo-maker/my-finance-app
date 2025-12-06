const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/expenses
// @desc    Get all expenses with filters
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { category, budgetCategory, startDate, endDate, limit = 50, page = 1 } = req.query;

        const query = { user: req.user._id };

        if (category) query.category = category;
        if (budgetCategory) query.budgetCategory = budgetCategory;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Expense.countDocuments(query);

        res.json({
            expenses,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/expenses
// @desc    Add new expense
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { description, amount, category, budgetCategory, date, paymentMethod, notes } = req.body;

        // Create expense
        const expense = await Expense.create({
            user: req.user._id,
            description,
            amount,
            category,
            budgetCategory,
            date: date || new Date(),
            paymentMethod,
            notes
        });

        // Update budget spending
        const expenseDate = new Date(expense.date);
        const budget = await Budget.findOne({
            user: req.user._id,
            month: expenseDate.getMonth() + 1,
            year: expenseDate.getFullYear()
        });

        if (budget) {
            const budgetCat = budget.categories.find(c => c.name === budgetCategory);
            if (budgetCat) {
                budgetCat.spent += amount;
                await budget.save();
            }
        }

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const oldAmount = expense.amount;
        const oldBudgetCategory = expense.budgetCategory;

        // Update expense fields
        Object.assign(expense, req.body);
        await expense.save();

        // Update budget if amount or category changed
        if (oldAmount !== expense.amount || oldBudgetCategory !== expense.budgetCategory) {
            const expenseDate = new Date(expense.date);
            const budget = await Budget.findOne({
                user: req.user._id,
                month: expenseDate.getMonth() + 1,
                year: expenseDate.getFullYear()
            });

            if (budget) {
                // Subtract old amount from old category
                const oldCat = budget.categories.find(c => c.name === oldBudgetCategory);
                if (oldCat) {
                    oldCat.spent -= oldAmount;
                }

                // Add new amount to new category
                const newCat = budget.categories.find(c => c.name === expense.budgetCategory);
                if (newCat) {
                    newCat.spent += expense.amount;
                }

                await budget.save();
            }
        }

        res.json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update budget spending
        const expenseDate = new Date(expense.date);
        const budget = await Budget.findOne({
            user: req.user._id,
            month: expenseDate.getMonth() + 1,
            year: expenseDate.getFullYear()
        });

        if (budget) {
            const budgetCat = budget.categories.find(c => c.name === expense.budgetCategory);
            if (budgetCat) {
                budgetCat.spent -= expense.amount;
                await budget.save();
            }
        }

        await expense.deleteOne();

        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/expenses/summary
// @desc    Get spending summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const queryMonth = month ? parseInt(month) : now.getMonth() + 1;
        const queryYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(queryYear, queryMonth - 1, 1);
        const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

        const summary = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);

        const totalSpent = summary.reduce((acc, cat) => acc + cat.total, 0);

        res.json({
            byCategory: summary,
            totalSpent,
            month: queryMonth,
            year: queryYear
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
