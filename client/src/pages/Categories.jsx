import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { categoryService } from '../services/financeService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react';
import './Categories.css';

const Categories = () => {
    const { success, error } = useNotification();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('expense');

    const [formData, setFormData] = useState({
        name: '',
        color: '#6366F1',
        type: 'expense'
    });

    const colors = [
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6B7280'
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await categoryService.getAll();
            setCategories(data);
        } catch (err) {
            console.error('Failed to load categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            color: '#6366F1',
            type: activeTab
        });
        setEditingCategory(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            color: category.color,
            type: category.type
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            error('Please enter a category name');
            return;
        }

        try {
            if (editingCategory) {
                await categoryService.update(editingCategory._id, formData);
                success('Category updated successfully!');
            } else {
                await categoryService.create(formData);
                success('Category created successfully!');
            }

            setShowModal(false);
            resetForm();
            loadCategories();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await categoryService.delete(id);
            success('Category deleted successfully!');
            loadCategories();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to delete category');
        }
    };

    const filteredCategories = categories.filter(c => c.type === activeTab);

    if (loading) {
        return (
            <div className="categories-loading">
                <div className="loading-spinner" />
                <p>Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <div>
                    <h2>Categories</h2>
                    <p>Manage your expense and budget categories</p>
                </div>
                <Button icon={<Plus size={18} />} onClick={openAddModal}>
                    Add Category
                </Button>
            </div>

            {/* Tabs */}
            <div className="tabs animate-fadeInUp">
                <button
                    className={`tab ${activeTab === 'expense' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('expense')}
                >
                    Expense Categories
                </button>
                <button
                    className={`tab ${activeTab === 'budget' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('budget')}
                >
                    Budget Categories
                </button>
            </div>

            {/* Categories Grid */}
            <div className="categories-grid">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                        <Card key={category._id} className="category-card animate-fadeInUp" hoverable>
                            <div className="category-content">
                                <div
                                    className="category-icon"
                                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                                >
                                    <Tag size={20} />
                                </div>
                                <div className="category-info">
                                    <span className="category-name">{category.name}</span>
                                    {category.isDefault && (
                                        <span className="category-badge">Default</span>
                                    )}
                                </div>
                                {!category.isDefault && (
                                    <div className="category-actions">
                                        <button className="action-btn" onClick={() => openEditModal(category)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="action-btn action-btn-danger" onClick={() => handleDelete(category._id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="empty-state-card">
                        <div className="empty-state">
                            <Tag size={48} />
                            <h4>No Categories</h4>
                            <p>Create your first {activeTab} category.</p>
                            <Button variant="outline" onClick={openAddModal}>
                                Add Category
                            </Button>
                        </div>
                    </Card>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingCategory ? 'Edit Category' : 'Create Category'}
                size="sm"
            >
                <form onSubmit={handleSubmit} className="category-form">
                    <Input
                        label="Category Name *"
                        placeholder="e.g., Entertainment"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                            className="form-select"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="expense">Expense Category</option>
                            <option value="budget">Budget Category</option>
                        </select>
                    </div>

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
                            {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Categories;
