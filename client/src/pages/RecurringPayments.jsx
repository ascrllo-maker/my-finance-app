import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { recurringService, categoryService, budgetService } from '../services/financeService';
import { formatCurrency, formatDate, frequencyLabels, paymentMethodLabels } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Plus, Repeat, Trash2, Edit2, Calendar, Bell } from 'lucide-react';
import './RecurringPayments.css';

const RecurringPayments = () => {
    const { success, error } = useNotification();
    const [payments, setPayments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetCategories, setBudgetCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        budgetCategory: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        reminderDays: 3,
        paymentMethod: 'bank_transfer'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsData, categoriesData, budgetData] = await Promise.all([
                recurringService.getAll(),
                categoryService.getAll('expense'),
                budgetService.getCurrent()
            ]);
            setPayments(paymentsData);
            setCategories(categoriesData);
            setBudgetCategories(budgetData?.categories || []);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            category: '',
            budgetCategory: budgetCategories[0]?.name || '',
            frequency: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            reminderDays: 3,
            paymentMethod: 'bank_transfer'
        });
        setEditingPayment(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (payment) => {
        setEditingPayment(payment);
        setFormData({
            description: payment.description,
            amount: payment.amount.toString(),
            category: payment.category,
            budgetCategory: payment.budgetCategory,
            frequency: payment.frequency,
            startDate: new Date(payment.nextDueDate).toISOString().split('T')[0],
            reminderDays: payment.reminderDays,
            paymentMethod: payment.paymentMethod
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.description || !formData.amount || !formData.category || !formData.budgetCategory) {
            error('Please fill in all required fields');
            return;
        }

        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (editingPayment) {
                await recurringService.update(editingPayment._id, data);
                success('Payment updated successfully!');
            } else {
                await recurringService.create(data);
                success('Recurring payment created!');
            }

            setShowModal(false);
            resetForm();
            loadData();
        } catch (err) {
            error('Failed to save payment');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this recurring payment?')) return;

        try {
            await recurringService.delete(id);
            success('Payment deleted successfully!');
            loadData();
        } catch (err) {
            error('Failed to delete payment');
        }
    };

    const getTotalMonthly = () => {
        return payments.reduce((sum, p) => {
            const amount = p.amount;
            switch (p.frequency) {
                case 'weekly': return sum + (amount * 4);
                case 'biweekly': return sum + (amount * 2);
                case 'monthly': return sum + amount;
                case 'quarterly': return sum + (amount / 3);
                case 'yearly': return sum + (amount / 12);
                default: return sum + amount;
            }
        }, 0);
    };

    if (loading) {
        return (
            <div className="recurring-loading">
                <div className="loading-spinner" />
                <p>Loading recurring payments...</p>
            </div>
        );
    }

    return (
        <div className="recurring-page">
            <div className="page-header">
                <div>
                    <h2>Recurring Payments</h2>
                    <p>Manage your regular bills and subscriptions</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={openAddModal}>
                    Add Payment
                </Button>
            </div>

            {/* Summary */}
            <Card className="summary-card animate-fadeInUp">
                <div className="summary-content">
                    <div className="summary-item">
                        <span className="summary-label">Total Recurring Payments</span>
                        <span className="summary-value">{payments.length}</span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Est. Monthly Cost</span>
                        <span className="summary-value">{formatCurrency(getTotalMonthly())}</span>
                    </div>
                </div>
            </Card>

            {/* Payments List */}
            <div className="payments-list">
                {payments.length > 0 ? (
                    payments.map((payment) => (
                        <Card key={payment._id} className="payment-card animate-fadeInUp" hoverable>
                            <div className="payment-content">
                                <div className="payment-icon">
                                    <Repeat size={20} />
                                </div>
                                <div className="payment-details">
                                    <h4 className="payment-description">{payment.description}</h4>
                                    <div className="payment-meta">
                                        <span className="payment-frequency">{frequencyLabels[payment.frequency]}</span>
                                        <span className="meta-divider">•</span>
                                        <span className="payment-category">{payment.category}</span>
                                    </div>
                                </div>
                                <div className="payment-info">
                                    <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                                    <div className="payment-due">
                                        <Calendar size={12} />
                                        <span>Next: {formatDate(payment.nextDueDate)}</span>
                                    </div>
                                </div>
                                <div className="payment-actions">
                                    <button className="action-btn" onClick={() => openEditModal(payment)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(payment._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="empty-state-card">
                        <div className="empty-state">
                            <Repeat size={48} />
                            <h4>No Recurring Payments</h4>
                            <p>Add your regular bills and subscriptions to track them.</p>
                            <Button variant="outline" onClick={openAddModal}>
                                Add Payment
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingPayment ? 'Edit Payment' : 'Add Recurring Payment'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="payment-form">
                    <Input
                        label="Description *"
                        placeholder="e.g., Netflix Subscription"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div className="form-row">
                        <Input
                            label="Amount *"
                            type="number"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />

                        <div className="form-group">
                            <label className="form-label">Frequency</label>
                            <select
                                className="form-select"
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                            >
                                {Object.entries(frequencyLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Budget Category *</label>
                            <select
                                className="form-select"
                                value={formData.budgetCategory}
                                onChange={(e) => setFormData({ ...formData, budgetCategory: e.target.value })}
                            >
                                <option value="">Select budget category</option>
                                {budgetCategories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <Input
                            label="Next Due Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />

                        <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <select
                                className="form-select"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            >
                                {Object.entries(paymentMethodLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Remind me (days before)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.reminderDays}
                            onChange={(e) => setFormData({ ...formData, reminderDays: parseInt(e.target.value) || 0 })}
                            min="0"
                            max="30"
                        />
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingPayment ? 'Update' : 'Add'} Payment
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RecurringPayments;
