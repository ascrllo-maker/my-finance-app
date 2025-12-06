const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/reports/monthly
// @desc    Get monthly report
// @access  Private
router.get('/monthly', protect, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const queryMonth = month ? parseInt(month) : now.getMonth() + 1;
        const queryYear = year ? parseInt(year) : now.getFullYear();

        const startDate = new Date(queryYear, queryMonth - 1, 1);
        const endDate = new Date(queryYear, queryMonth, 0, 23, 59, 59);

        // Get budget
        const budget = await Budget.findOne({
            user: req.user._id,
            month: queryMonth,
            year: queryYear
        });

        // Get expenses by category
        const expensesByCategory = await Expense.aggregate([
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
            { $sort: { total: -1 } }
        ]);

        // Get expenses by budget category
        const expensesByBudgetCategory = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$budgetCategory',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Get daily spending for the month
        const dailySpending = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: '$date' },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        const totalSpent = expensesByCategory.reduce((acc, cat) => acc + cat.total, 0);
        const totalBudget = budget ? budget.totalIncome : 0;

        res.json({
            month: queryMonth,
            year: queryYear,
            budget,
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            expensesByCategory,
            expensesByBudgetCategory,
            dailySpending,
            budgetUtilization: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reports/yearly
// @desc    Get yearly summary
// @access  Private
router.get('/yearly', protect, async (req, res) => {
    try {
        const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59);

        // Monthly spending breakdown
        const monthlySpending = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: '$date' },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Category breakdown for the year
        const yearlyByCategory = await Expense.aggregate([
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
            { $sort: { total: -1 } }
        ]);

        const totalSpent = monthlySpending.reduce((acc, m) => acc + m.total, 0);
        const avgMonthlySpending = monthlySpending.length > 0 ? totalSpent / monthlySpending.length : 0;

        res.json({
            year,
            totalSpent,
            avgMonthlySpending,
            monthlySpending,
            yearlyByCategory
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reports/trends
// @desc    Get spending trends
// @access  Private
router.get('/trends', protect, async (req, res) => {
    try {
        const months = parseInt(req.query.months) || 6;
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

        // Monthly totals
        const monthlyTotals = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Category trends
        const categoryTrends = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        category: '$category'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            monthlyTotals,
            categoryTrends
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/reports/dashboard
// @desc    Get dashboard summary data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        // Current month budget
        const budget = await Budget.findOne({
            user: req.user._id,
            month: currentMonth,
            year: currentYear
        });

        // Total spent this month
        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    user: req.user._id,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const totalSpent = monthlyExpenses[0]?.total || 0;

        // Recent transactions
        const recentTransactions = await Expense.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(5);

        // Active goals
        const goals = await Goal.find({
            user: req.user._id,
            isCompleted: false
        }).limit(3);

        // Budget warnings
        const warnings = [];
        if (budget) {
            budget.categories.forEach(cat => {
                const percentage = (cat.spent / cat.allocatedAmount) * 100;
                if (percentage >= 100) {
                    warnings.push({
                        type: 'danger',
                        category: cat.name,
                        message: `Budget exceeded for ${cat.name}`,
                        percentage: percentage.toFixed(1)
                    });
                } else if (percentage >= 80) {
                    warnings.push({
                        type: 'warning',
                        category: cat.name,
                        message: `Approaching limit for ${cat.name}`,
                        percentage: percentage.toFixed(1)
                    });
                }
            });
        }

        res.json({
            budget,
            totalBudget: budget?.totalIncome || 0,
            totalSpent,
            remaining: (budget?.totalIncome || 0) - totalSpent,
            recentTransactions,
            goals,
            warnings
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
