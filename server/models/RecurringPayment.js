const mongoose = require('mongoose');

const recurringPaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    budgetCategory: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    nextDueDate: {
        type: Date,
        required: true
    },
    reminderDays: {
        type: Number,
        default: 3 // Days before due date to send reminder
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'other'],
        default: 'bank_transfer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastProcessed: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RecurringPayment', recurringPaymentSchema);
