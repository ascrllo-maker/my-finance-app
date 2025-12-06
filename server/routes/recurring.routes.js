const express = require('express');
const router = express.Router();
const RecurringPayment = require('../models/RecurringPayment');
const { protect } = require('../middleware/auth.middleware');

// Helper to calculate next due date
const calculateNextDueDate = (currentDate, frequency) => {
    const date = new Date(currentDate);
    switch (frequency) {
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'biweekly':
            date.setDate(date.getDate() + 14);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
        case 'quarterly':
            date.setMonth(date.getMonth() + 3);
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    return date;
};

// @route   GET /api/recurring
// @desc    Get all recurring payments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const payments = await RecurringPayment.find({ user: req.user._id })
            .sort({ nextDueDate: 1 });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/recurring/upcoming
// @desc    Get upcoming payments (due within X days)
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const payments = await RecurringPayment.find({
            user: req.user._id,
            isActive: true,
            nextDueDate: { $gte: now, $lte: futureDate }
        }).sort({ nextDueDate: 1 });

        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/recurring
// @desc    Create recurring payment
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { description, amount, category, budgetCategory, frequency, startDate, reminderDays, paymentMethod } = req.body;

        const nextDueDate = startDate ? new Date(startDate) : new Date();

        const payment = await RecurringPayment.create({
            user: req.user._id,
            description,
            amount,
            category,
            budgetCategory,
            frequency,
            startDate: nextDueDate,
            nextDueDate,
            reminderDays,
            paymentMethod
        });

        res.status(201).json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/recurring/:id
// @desc    Update recurring payment
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const payment = await RecurringPayment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(payment, req.body);
        await payment.save();

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/recurring/:id
// @desc    Delete recurring payment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const payment = await RecurringPayment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await payment.deleteOne();

        res.json({ message: 'Recurring payment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/recurring/:id/process
// @desc    Mark payment as processed and update next due date
// @access  Private
router.post('/:id/process', protect, async (req, res) => {
    try {
        const payment = await RecurringPayment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        if (payment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        payment.lastProcessed = new Date();
        payment.nextDueDate = calculateNextDueDate(payment.nextDueDate, payment.frequency);
        await payment.save();

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
