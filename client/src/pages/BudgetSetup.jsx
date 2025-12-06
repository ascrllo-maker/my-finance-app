import { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { budgetService, categoryService } from '../services/financeService';
import { formatCurrency, getMonthName } from '../utils/helpers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import { Wallet, Save, RefreshCw, PieChart, Plus, Pencil, Trash2, Check, X, Eye, EyeOff } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './BudgetSetup.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors = [
    '#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

const defaultCategories = [
    { name: 'Bills & Utilities', percentage: 60, color: '#EF4444', showOnDashboard: true },
    { name: 'Personal Savings', percentage: 35, color: '#10B981', showOnDashboard: false },
    { name: 'Wants', percentage: 5, color: '#8B5CF6', showOnDashboard: true }
];

const BudgetSetup = () => {
    const { success, error } = useNotification();
    const [income, setIncome] = useState('');
    const [categories, setCategories] = useState(defaultCategories);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [existingBudget, setExistingBudget] = useState(null);

    // Edit state
    const [editingIndex, setEditingIndex] = useState(null);
    const [editName, setEditName] = useState('');

    // Add category modal
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryPercentage, setNewCategoryPercentage] = useState(10);
    const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    useEffect(() => {
        loadBudget();
    }, []);

    const loadBudget = async () => {
        try {
            const budget = await budgetService.getCurrent();
            if (budget) {
                setExistingBudget(budget);
                setIncome(budget.totalIncome.toString());
                setCategories(budget.categories.map(c => ({
                    name: c.name,
                    percentage: c.percentage,
                    color: c.color,
                    spent: c.spent,
                    showOnDashboard: c.showOnDashboard !== false // default to true if not set
                })));
            }
        } catch (err) {
            console.error('Failed to load budget:', err);
        } finally {
            setLoading(false);
        }
    };

    const totalPercentage = useMemo(() => {
        return categories.reduce((sum, cat) => sum + cat.percentage, 0);
    }, [categories]);

    const isValid = useMemo(() => {
        return income > 0 && totalPercentage === 100;
    }, [income, totalPercentage]);

    const allocations = useMemo(() => {
        const incomeNum = parseFloat(income) || 0;
        return categories.map(cat => ({
            ...cat,
            amount: (cat.percentage / 100) * incomeNum
        }));
    }, [income, categories]);

    const handlePercentageChange = (index, value) => {
        const newValue = Math.max(0, Math.min(100, parseInt(value) || 0));
        setCategories(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], percentage: newValue };
            return updated;
        });
    };

    // Start editing a category name
    const startEditing = (index) => {
        setEditingIndex(index);
        setEditName(categories[index].name);
    };

    // Save edited category name
    const saveEdit = () => {
        if (editName.trim() === '') {
            error('Category name cannot be empty');
            return;
        }
        setCategories(prev => {
            const updated = [...prev];
            updated[editingIndex] = { ...updated[editingIndex], name: editName.trim() };
            return updated;
        });
        setEditingIndex(null);
        setEditName('');
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingIndex(null);
        setEditName('');
    };

    // Delete a category
    const deleteCategory = (index) => {
        if (categories.length <= 1) {
            error('You must have at least one budget category');
            return;
        }
        setCategories(prev => prev.filter((_, i) => i !== index));
    };

    // Toggle dashboard visibility
    const toggleDashboardVisibility = (index) => {
        setCategories(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], showOnDashboard: !updated[index].showOnDashboard };
            return updated;
        });
    };

    // Add new category
    const handleAddCategory = () => {
        if (newCategoryName.trim() === '') {
            error('Please enter a category name');
            return;
        }

        // Check for duplicate names
        if (categories.some(c => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            error('A category with this name already exists');
            return;
        }

        const newCategory = {
            name: newCategoryName.trim(),
            percentage: Math.max(0, Math.min(100, parseInt(newCategoryPercentage) || 0)),
            color: newCategoryColor,
            showOnDashboard: true
        };

        setCategories(prev => [...prev, newCategory]);
        setShowAddModal(false);
        setNewCategoryName('');
        setNewCategoryPercentage(10);
        // Pick next available color
        const usedColors = categories.map(c => c.color);
        const nextColor = categoryColors.find(c => !usedColors.includes(c)) || categoryColors[0];
        setNewCategoryColor(nextColor);
        success(`Added "${newCategory.name}" category`);
    };

    const handleSave = async () => {
        if (!isValid) {
            error('Please ensure income is set and percentages add up to 100%');
            return;
        }

        setSaving(true);
        try {
            await budgetService.save({
                month: currentMonth,
                year: currentYear,
                totalIncome: parseFloat(income),
                categories: categories.map(cat => ({
                    name: cat.name,
                    percentage: cat.percentage,
                    color: cat.color,
                    icon: 'wallet',
                    showOnDashboard: cat.showOnDashboard !== false
                }))
            });
            success('Budget saved successfully!');
            loadBudget();
        } catch (err) {
            error('Failed to save budget');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setCategories(defaultCategories);
    };

    const chartData = {
        labels: categories.map(c => c.name),
        datasets: [{
            data: categories.map(c => c.percentage),
            backgroundColor: categories.map(c => c.color),
            borderWidth: 0
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            }
        }
    };

    if (loading) {
        return (
            <div className="budget-loading">
                <div className="loading-spinner" />
                <p>Loading budget...</p>
            </div>
        );
    }

    return (
        <div className="budget-setup">
            <div className="page-header">
                <div>
                    <h2>Budget Setup</h2>
                    <p>Set up your monthly budget for {getMonthName(currentMonth)} {currentYear}</p>
                </div>
            </div>

            <div className="budget-grid">
                {/* Income Input */}
                <Card className="income-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-with-icon">
                            <Wallet size={20} />
                            <h3>Monthly Income</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="income-input-wrapper">
                            <span className="currency-symbol">₱</span>
                            <input
                                type="number"
                                className="income-input"
                                placeholder="Enter your monthly income"
                                value={income}
                                onChange={(e) => setIncome(e.target.value)}
                            />
                        </div>
                        <p className="income-hint">Enter your total monthly income before expenses.</p>
                    </Card.Body>
                </Card>

                {/* Budget Allocation */}
                <Card className="allocation-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-with-icon">
                            <PieChart size={20} />
                            <h3>Budget Allocation</h3>
                        </div>
                        <div className={`percentage-badge ${totalPercentage === 100 ? 'valid' : 'invalid'}`}>
                            {totalPercentage}%
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="allocation-list">
                            {categories.map((cat, index) => (
                                <div key={`${cat.name}-${index}`} className="allocation-item">
                                    <div className="allocation-header">
                                        <div className="category-info">
                                            <div
                                                className="category-color"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            {editingIndex === index ? (
                                                <div className="category-name-edit">
                                                    <input
                                                        type="text"
                                                        className="category-name-input"
                                                        value={editName}
                                                        onChange={(e) => setEditName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEdit();
                                                            if (e.key === 'Escape') cancelEdit();
                                                        }}
                                                        autoFocus
                                                    />
                                                    <button className="edit-btn save-btn" onClick={saveEdit}>
                                                        <Check size={14} />
                                                    </button>
                                                    <button className="edit-btn cancel-btn" onClick={cancelEdit}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="category-name-wrapper">
                                                    <span className="category-name">{cat.name}</span>
                                                    <button
                                                        className="edit-name-btn"
                                                        onClick={() => startEditing(index)}
                                                        title="Rename category"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="category-actions">
                                            <div className="percentage-input-wrapper">
                                                <input
                                                    type="number"
                                                    className="percentage-input"
                                                    value={cat.percentage}
                                                    onChange={(e) => handlePercentageChange(index, e.target.value)}
                                                    min="0"
                                                    max="100"
                                                />
                                                <span className="percentage-symbol">%</span>
                                            </div>
                                            <button
                                                className={`visibility-toggle-btn ${cat.showOnDashboard ? 'visible' : 'hidden'}`}
                                                onClick={() => toggleDashboardVisibility(index)}
                                                title={cat.showOnDashboard ? "Shown on Dashboard" : "Hidden on Dashboard"}
                                            >
                                                {cat.showOnDashboard ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            {categories.length > 1 && (
                                                <button
                                                    className="delete-category-btn"
                                                    onClick={() => deleteCategory(index)}
                                                    title="Delete category"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="allocation-details">
                                        <ProgressBar
                                            value={cat.percentage}
                                            max={100}
                                            color={cat.color}
                                            showLabel={false}
                                            showPercentage={false}
                                            size="sm"
                                            animated={false}
                                        />
                                        <span className="allocation-amount">
                                            {formatCurrency(allocations[index]?.amount || 0)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="add-category-btn"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus size={16} />
                            Add Category
                        </button>

                        {totalPercentage !== 100 && (
                            <div className="percentage-warning">
                                Percentages must add up to 100%. Currently: {totalPercentage}%
                            </div>
                        )}

                        <div className="allocation-actions">
                            <Button
                                variant="secondary"
                                onClick={handleReset}
                                icon={<RefreshCw size={16} />}
                            >
                                Reset
                            </Button>
                            <Button
                                onClick={handleSave}
                                loading={saving}
                                disabled={!isValid}
                                icon={<Save size={16} />}
                            >
                                Save Budget
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Visual Chart */}
                <Card className="chart-card animate-fadeInUp">
                    <Card.Header>
                        <h3>Allocation Overview</h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="chart-container">
                            <Pie data={chartData} options={chartOptions} />
                        </div>
                        <div className="chart-legend">
                            {categories.map((cat, index) => (
                                <div key={`legend-${index}`} className="legend-item">
                                    <div
                                        className="legend-color"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="legend-label">{cat.name}</span>
                                    <span className="legend-percentage">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </Card.Body>
                </Card>

                {/* Summary */}
                <Card className="summary-card animate-fadeInUp">
                    <Card.Header>
                        <h3>Budget Summary</h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="summary-list">
                            {allocations.map((alloc, index) => (
                                <div key={`summary-${index}`} className="summary-item">
                                    <div className="summary-category">
                                        <div
                                            className="category-color"
                                            style={{ backgroundColor: alloc.color }}
                                        />
                                        <span>{alloc.name}</span>
                                    </div>
                                    <div className="summary-values">
                                        <span className="summary-percentage">{alloc.percentage}%</span>
                                        <span className="summary-amount">{formatCurrency(alloc.amount)}</span>
                                    </div>
                                </div>
                            ))}
                            <div className="summary-total">
                                <span>Total</span>
                                <span>{formatCurrency(parseFloat(income) || 0)}</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Add Category Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Budget Category"
                size="sm"
            >
                <div className="add-category-form">
                    <div className="form-group">
                        <label className="form-label">Category Name</label>
                        <Input
                            type="text"
                            placeholder="e.g., Entertainment, Food, Transport"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Percentage (%)</label>
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            value={newCategoryPercentage}
                            onChange={(e) => setNewCategoryPercentage(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Color</label>
                        <div className="color-picker">
                            {categoryColors.map(color => (
                                <button
                                    key={color}
                                    className={`color-option ${newCategoryColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setNewCategoryColor(color)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddCategory} icon={<Plus size={16} />}>
                            Add Category
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BudgetSetup;
