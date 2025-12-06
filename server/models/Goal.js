const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: String
});

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Goal name is required'],
        trim: true
    },
    targetAmount: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date
    },
    icon: {
        type: String,
        default: 'target'
    },
    color: {
        type: String,
        default: '#10B981'
    },
    contributions: [contributionSchema],
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for progress percentage
goalSchema.virtual('progress').get(function () {
    if (this.targetAmount === 0) return 0;
    return Math.min((this.currentAmount / this.targetAmount) * 100, 100);
});

goalSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Goal', goalSchema);
