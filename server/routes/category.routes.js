const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect } = require('../middleware/auth.middleware');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { type } = req.query;
        const query = { user: req.user._id };
        if (type) query.type = type;

        const categories = await Category.find(query).sort({ isDefault: -1, name: 1 });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;

        // Check if category already exists
        const exists = await Category.findOne({
            user: req.user._id,
            name,
            type
        });

        if (exists) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        const category = await Category.create({
            user: req.user._id,
            name,
            icon,
            color,
            type,
            isDefault: false
        });

        res.status(201).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, icon, color } = req.body;

        category.name = name || category.name;
        category.icon = icon || category.icon;
        category.color = color || category.color;

        await category.save();

        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (category.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (category.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default categories' });
        }

        await category.deleteOne();

        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
