import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Mail, Moon, Sun, DollarSign, Save } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { user, updateProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { success, error } = useNotification();

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        monthlyIncome: user?.monthlyIncome?.toString() || '',
        currency: user?.currency || 'PHP'
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        const result = await updateProfile({
            name: formData.name,
            monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
            currency: formData.currency
        });
        setSaving(false);

        if (result.success) {
            success('Settings saved successfully!');
        } else {
            error(result.error);
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <h2>Settings</h2>
                <p>Manage your account preferences</p>
            </div>

            <div className="settings-grid">
                {/* Profile Settings */}
                <Card className="settings-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-icon">
                            <User size={20} />
                            <h3>Profile</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="settings-form">
                            <Input
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                icon={<User size={18} />}
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                disabled
                                icon={<Mail size={18} />}
                            />

                            <div className="form-row">
                                <Input
                                    label="Default Monthly Income"
                                    type="number"
                                    value={formData.monthlyIncome}
                                    onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                                    placeholder="0.00"
                                />

                                <div className="form-group">
                                    <label className="form-label">Currency</label>
                                    <select
                                        className="form-select"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="PHP">PHP - Philippine Peso</option>
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                    </select>
                                </div>
                            </div>

                            <Button onClick={handleSave} loading={saving} icon={<Save size={16} />}>
                                Save Changes
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Appearance Settings */}
                <Card className="settings-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-icon">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                            <h3>Appearance</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="appearance-options">
                            <div className="theme-option">
                                <div className="theme-preview theme-light" onClick={() => theme === 'dark' && toggleTheme()}>
                                    <div className="preview-header" />
                                    <div className="preview-sidebar" />
                                    <div className="preview-content">
                                        <div className="preview-card" />
                                        <div className="preview-card" />
                                    </div>
                                    {theme === 'light' && <div className="theme-check">✓</div>}
                                </div>
                                <span>Light</span>
                            </div>
                            <div className="theme-option">
                                <div className="theme-preview theme-dark" onClick={() => theme === 'light' && toggleTheme()}>
                                    <div className="preview-header" />
                                    <div className="preview-sidebar" />
                                    <div className="preview-content">
                                        <div className="preview-card" />
                                        <div className="preview-card" />
                                    </div>
                                    {theme === 'dark' && <div className="theme-check">✓</div>}
                                </div>
                                <span>Dark</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                {/* About */}
                <Card className="settings-card animate-fadeInUp">
                    <Card.Header>
                        <h3>About</h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="about-info">
                            <div className="about-item">
                                <span className="about-label">App Version</span>
                                <span className="about-value">1.0.0</span>
                            </div>
                            <div className="about-item">
                                <span className="about-label">Framework</span>
                                <span className="about-value">React + Vite</span>
                            </div>
                            <div className="about-item">
                                <span className="about-label">Backend</span>
                                <span className="about-value">Node.js + Express + MongoDB</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
