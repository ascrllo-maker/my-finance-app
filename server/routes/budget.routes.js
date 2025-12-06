const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/budget
// @desc    Get current month's budget
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const now = new Date();
        const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();

        const budget = await Budget.findOne({
            user: req.user._id,
            month,
            year
        });

        if (!budget) {
            return res.json(null);
        }

        res.json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/budget
// @desc    Create or update budget
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { month, year, totalIncome, categories } = req.body;

        // Calculate allocated amounts based on percentages
        const processedCategories = categories.map(cat => ({
            ...cat,
            allocatedAmount: (cat.percentage / 100) * totalIncome,
            spent: cat.spent || 0
        }));

        // Check if budget exists for this month/year
        let budget = await Budget.findOne({
            user: req.user._id,
            month,
            year
        });

        if (budget) {
            // Update existing budget
            budget.totalIncome = totalIncome;
            budget.categories = processedCategories;
            await budget.save();
        } else {
            // Create new budget
            budget = await Budget.create({
                user: req.user._id,
                month,
                year,
                totalIncome,
                categories: processedCategories
            });
        }

        res.json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/budget/:id/category/:categoryName/spend
// @desc    Update spending for a category
// @access  Private
router.put('/:id/category/:categoryName/spend', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const category = budget.categories.find(
            c => c.name === decodeURIComponent(req.params.categoryName)
        );

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        category.spent += amount;
        await budget.save();

        res.json(budget);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/budget/history
// @desc    Get budget history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id })
            .sort({ year: -1, month: -1 })
            .limit(12);

        res.json(budgets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
