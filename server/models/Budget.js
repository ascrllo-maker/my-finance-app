const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    allocatedAmount: {
        type: Number,
        default: 0
    },
    spent: {
        type: Number,
        default: 0
    },
    icon: {
        type: String,
        default: 'wallet'
    },
    color: {
        type: String,
        default: '#4F46E5'
    },
    showOnDashboard: {
        type: Boolean,
        default: true
    }
});

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    totalIncome: {
        type: Number,
        required: true
    },
    categories: [budgetCategorySchema]
}, {
    timestamps: true
});

// Compound index for unique budget per user per month/year
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
