import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Mail, Lock, Wallet, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const { error: showError } = useNotification();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
        if (!password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            showError(result.error);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card animate-fadeInUp">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="auth-logo-icon">
                                <Wallet size={32} />
                            </div>
                            <h1 className="auth-logo-text">myFinance</h1>
                        </div>
                        <p className="auth-subtitle">Welcome back! Sign in to continue.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail size={18} />}
                            error={errors.email}
                        />

                        <div className="password-input-wrapper">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock size={18} />}
                                error={errors.password}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="auth-options">
                            <label className="checkbox-label">
                                <input type="checkbox" className="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="auth-link">
                                Forgot password?
                            </Link>
                        </div>

                        <Button type="submit" fullWidth loading={loading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/signup" className="auth-link">
                                Create one
                            </Link>
                        </p>
                    </div>
                    <div className="auth-credit">
                        Made by Airl Carillo
                    </div>
                </div>

                <div className="auth-decoration">
                    <div className="decoration-card decoration-card-1">
                        <div className="decoration-icon">💰</div>
                        <span>Track Spending</span>
                    </div>
                    <div className="decoration-card decoration-card-2">
                        <div className="decoration-icon">📊</div>
                        <span>Visual Reports</span>
                    </div>
                    <div className="decoration-card decoration-card-3">
                        <div className="decoration-icon">🎯</div>
                        <span>Set Goals</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
