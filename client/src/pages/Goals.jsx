import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { goalService } from '../services/financeService';
import { formatCurrency, formatDate, calculatePercentage } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import ProgressBar from '../components/ui/ProgressBar';
import { Plus, Target, Trash2, Edit2, PiggyBank, TrendingUp, Calendar } from 'lucide-react';
import './Goals.css';

const Goals = () => {
    const { success, error } = useNotification();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showContributeModal, setShowContributeModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [contributionAmount, setContributionAmount] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        deadline: '',
        color: '#10B981'
    });

    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await goalService.getAll();
            setGoals(data);
        } catch (err) {
            console.error('Failed to load goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: '',
            deadline: '',
            color: '#10B981'
        });
        setEditingGoal(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount.toString(),
            deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '',
            color: goal.color
        });
        setShowModal(true);
    };

    const openContributeModal = (goal) => {
        setSelectedGoal(goal);
        setContributionAmount('');
        setShowContributeModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.targetAmount) {
            error('Please fill in required fields');
            return;
        }

        try {
            if (editingGoal) {
                await goalService.update(editingGoal._id, {
                    ...formData,
                    targetAmount: parseFloat(formData.targetAmount)
                });
                success('Goal updated successfully!');
            } else {
                await goalService.create({
                    ...formData,
                    targetAmount: parseFloat(formData.targetAmount)
                });
                success('Goal created successfully!');
            }

            setShowModal(false);
            resetForm();
            loadGoals();
        } catch (err) {
            error('Failed to save goal');
        }
    };

    const handleContribute = async () => {
        if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
            error('Please enter a valid amount');
            return;
        }

        try {
            await goalService.contribute(selectedGoal._id, parseFloat(contributionAmount));
            success('Contribution added successfully!');
            setShowContributeModal(false);
            loadGoals();
        } catch (err) {
            error('Failed to add contribution');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;

        try {
            await goalService.delete(id);
            success('Goal deleted successfully!');
            loadGoals();
        } catch (err) {
            error('Failed to delete goal');
        }
    };

    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

    if (loading) {
        return (
            <div className="goals-loading">
                <div className="loading-spinner" />
                <p>Loading goals...</p>
            </div>
        );
    }

    return (
        <div className="goals-page">
            <div className="page-header">
                <div>
                    <h2>Financial Goals</h2>
                    <p>Track your savings and reach your targets</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={openAddModal}>
                    Add Goal
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="goals-summary animate-fadeInUp">
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                        <PiggyBank size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total Saved</span>
                        <span className="summary-value">{formatCurrency(totalSaved)}</span>
                    </div>
                </Card>
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)' }}>
                        <Target size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Total Target</span>
                        <span className="summary-value">{formatCurrency(totalTarget)}</span>
                    </div>
                </Card>
                <Card className="summary-card">
                    <div className="summary-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="summary-content">
                        <span className="summary-label">Overall Progress</span>
                        <span className="summary-value">{calculatePercentage(totalSaved, totalTarget).toFixed(0)}%</span>
                    </div>
                </Card>
            </div>

            {/* Goals Grid */}
            <div className="goals-grid">
                {goals.length > 0 ? (
                    goals.map((goal) => {
                        const progress = calculatePercentage(goal.currentAmount, goal.targetAmount);
                        return (
                            <Card key={goal._id} className="goal-card animate-fadeInUp" hoverable>
                                <div className="goal-header">
                                    <div className="goal-icon" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                                        <Target size={24} />
                                    </div>
                                    <div className="goal-actions">
                                        <button className="action-btn" onClick={() => openEditModal(goal)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn action-btn-danger" onClick={() => handleDelete(goal._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="goal-name">{goal.name}</h3>

                                <div className="goal-progress">
                                    <ProgressBar
                                        value={goal.currentAmount}
                                        max={goal.targetAmount}
                                        color={goal.color}
                                        showLabel={false}
                                        showPercentage={false}
                                        size="md"
                                    />
                                    <div className="progress-labels">
                                        <span>{formatCurrency(goal.currentAmount)}</span>
                                        <span className="progress-percent">{progress.toFixed(0)}%</span>
                                        <span>{formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                </div>

                                {goal.deadline && (
                                    <div className="goal-deadline">
                                        <Calendar size={14} />
                                        <span>Target: {formatDate(goal.deadline)}</span>
                                    </div>
                                )}

                                <Button
                                    fullWidth
                                    variant={goal.isCompleted ? 'success' : 'outline'}
                                    onClick={() => !goal.isCompleted && openContributeModal(goal)}
                                    disabled={goal.isCompleted}
                                >
                                    {goal.isCompleted ? '🎉 Goal Reached!' : 'Add Contribution'}
                                </Button>
                            </Card>
                        );
                    })
                ) : (
                    <Card className="empty-state-card">
                        <div className="empty-state">
                            <Target size={48} />
                            <h4>No Goals Yet</h4>
                            <p>Set your first financial goal to start saving.</p>
                            <Button variant="outline" onClick={openAddModal}>
                                Create Goal
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Add/Edit Goal Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingGoal ? 'Edit Goal' : 'Create Goal'}
                size="sm"
            >
                <form onSubmit={handleSubmit} className="goal-form">
                    <Input
                        label="Goal Name *"
                        placeholder="e.g., Emergency Fund"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Input
                        label="Target Amount *"
                        type="number"
                        placeholder="0.00"
                        value={formData.targetAmount}
                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    />

                    <Input
                        label="Target Date (Optional)"
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    />

                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div className="color-picker">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingGoal ? 'Update' : 'Create'} Goal
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Contribute Modal */}
            <Modal
                isOpen={showContributeModal}
                onClose={() => setShowContributeModal(false)}
                title="Add Contribution"
                size="sm"
            >
                <div className="contribute-form">
                    <p className="contribute-goal">
                        Contributing to: <strong>{selectedGoal?.name}</strong>
                    </p>
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                    />
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowContributeModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleContribute}>
                            Add Contribution
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Goals;
