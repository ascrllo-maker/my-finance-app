const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
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
        required: [true, 'Category is required']
    },
    budgetCategory: {
        type: String,
        required: [true, 'Budget category is required']
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'e_wallet', 'other'],
        default: 'cash'
    },
    notes: {
        type: String,
        trim: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RecurringPayment'
    }
}, {
    timestamps: true
});

// Index for efficient queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, budgetCategory: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
