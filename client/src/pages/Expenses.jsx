import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { expenseService, categoryService, budgetService } from '../services/financeService';
import { formatCurrency, formatDate, paymentMethodLabels } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Plus, Search, Filter, Receipt, Trash2, Edit2, Calendar, CreditCard } from 'lucide-react';
import './Expenses.css';

const Expenses = () => {
    const { success, error } = useNotification();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetCategories, setBudgetCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        budgetCategory: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expensesData, categoriesData, budgetData] = await Promise.all([
                expenseService.getAll({ limit: 100 }),
                categoryService.getAll('expense'),
                budgetService.getCurrent()
            ]);

            setExpenses(expensesData.expenses || []);
            setCategories(categoriesData || []);
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
            date: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            notes: ''
        });
        setEditingExpense(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (expense) => {
        setEditingExpense(expense);
        setFormData({
            description: expense.description,
            amount: expense.amount.toString(),
            category: expense.category,
            budgetCategory: expense.budgetCategory,
            date: new Date(expense.date).toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod,
            notes: expense.notes || ''
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
            if (editingExpense) {
                await expenseService.update(editingExpense._id, {
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
                success('Expense updated successfully!');
            } else {
                await expenseService.create({
                    ...formData,
                    amount: parseFloat(formData.amount)
                });
                success('Expense added successfully!');
            }

            setShowModal(false);
            resetForm();
            loadData();
        } catch (err) {
            error('Failed to save expense');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            await expenseService.delete(id);
            success('Expense deleted successfully!');
            loadData();
        } catch (err) {
            error('Failed to delete expense');
        }
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalFiltered = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (loading) {
        return (
            <div className="expenses-loading">
                <div className="loading-spinner" />
                <p>Loading expenses...</p>
            </div>
        );
    }

    return (
        <div className="expenses-page">
            <div className="page-header">
                <div>
                    <h2>Expenses</h2>
                    <p>Track and manage your spending</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={openAddModal}>
                    Add Expense
                </Button>
            </div>

            {/* Filters */}
            <Card className="filters-card animate-fadeInUp">
                <div className="filters-row">
                    <div className="search-wrapper">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search expenses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filters-summary">
                    <span>{filteredExpenses.length} expenses</span>
                    <span className="summary-total">Total: {formatCurrency(totalFiltered)}</span>
                </div>
            </Card>

            {/* Expenses List */}
            <div className="expenses-list">
                {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                        <Card key={expense._id} className="expense-card animate-fadeInUp" hoverable>
                            <div className="expense-content">
                                <div className="expense-icon">
                                    <Receipt size={20} />
                                </div>
                                <div className="expense-details">
                                    <h4 className="expense-description">{expense.description}</h4>
                                    <div className="expense-meta">
                                        <span className="expense-category">{expense.category}</span>
                                        <span className="meta-divider">•</span>
                                        <span className="expense-budget">{expense.budgetCategory}</span>
                                    </div>
                                </div>
                                <div className="expense-info">
                                    <span className="expense-amount">-{formatCurrency(expense.amount)}</span>
                                    <div className="expense-sub-info">
                                        <Calendar size={12} />
                                        <span>{formatDate(expense.date)}</span>
                                    </div>
                                    <div className="expense-sub-info">
                                        <CreditCard size={12} />
                                        <span>{paymentMethodLabels[expense.paymentMethod]}</span>
                                    </div>
                                </div>
                                <div className="expense-actions">
                                    <button className="action-btn" onClick={() => openEditModal(expense)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="action-btn action-btn-danger" onClick={() => handleDelete(expense._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="empty-state-card">
                        <div className="empty-state">
                            <Receipt size={48} />
                            <h4>No Expenses Found</h4>
                            <p>Start tracking your spending by adding your first expense.</p>
                            <Button variant="outline" onClick={openAddModal}>
                                Add Expense
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingExpense ? 'Edit Expense' : 'Add Expense'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="expense-form">
                    <Input
                        label="Description *"
                        placeholder="e.g., Netflix Payment"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <Input
                        label="Amount *"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />

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
                            label="Date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            placeholder="Optional notes..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="form-actions">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingExpense ? 'Update' : 'Add'} Expense
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;
