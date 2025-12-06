const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Category = require('../models/Category');
const { protect, generateToken } = require('../middleware/auth.middleware');

// Default categories to create for new users
const defaultCategories = [
    // Budget categories
    { name: 'Bills & Utilities', icon: 'receipt', color: '#EF4444', type: 'budget' },
    { name: 'Personal Savings', icon: 'piggy-bank', color: '#10B981', type: 'budget' },
    { name: 'Wants', icon: 'shopping-bag', color: '#8B5CF6', type: 'budget' },
    // Expense categories
    { name: 'Food & Groceries', icon: 'utensils', color: '#F59E0B', type: 'expense' },
    { name: 'Transportation', icon: 'car', color: '#3B82F6', type: 'expense' },
    { name: 'Entertainment', icon: 'film', color: '#EC4899', type: 'expense' },
    { name: 'Shopping', icon: 'shopping-cart', color: '#8B5CF6', type: 'expense' },
    { name: 'Health', icon: 'heart', color: '#EF4444', type: 'expense' },
    { name: 'Education', icon: 'book', color: '#6366F1', type: 'expense' },
    { name: 'Subscriptions', icon: 'repeat', color: '#14B8A6', type: 'expense' },
    { name: 'Other', icon: 'more-horizontal', color: '#6B7280', type: 'expense' }
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Create default categories for the user
        const categories = defaultCategories.map(cat => ({
            ...cat,
            user: user._id,
            isDefault: true
        }));
        await Category.insertMany(categories);

        // Generate token and respond
        const token = generateToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            monthlyIncome: user.monthlyIncome,
            currency: user.currency,
            theme: user.theme,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token and respond
        const token = generateToken(user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            monthlyIncome: user.monthlyIncome,
            currency: user.currency,
            theme: user.theme,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        monthlyIncome: req.user.monthlyIncome,
        currency: req.user.currency,
        theme: req.user.theme
    });
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, monthlyIncome, currency, theme } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.name = name || user.name;
            user.monthlyIncome = monthlyIncome !== undefined ? monthlyIncome : user.monthlyIncome;
            user.currency = currency || user.currency;
            user.theme = theme || user.theme;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                monthlyIncome: updatedUser.monthlyIncome,
                currency: updatedUser.currency,
                theme: updatedUser.theme
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
