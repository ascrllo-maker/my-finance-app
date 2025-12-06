import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { reportService } from '../services/financeService';
import { formatCurrency, getGreeting, formatRelativeTime, getBudgetStatus, calculatePercentage, getMonthName } from '../utils/helpers';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    Target,
    Plus,
    ArrowRight,
    Receipt
} from 'lucide-react';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const { user } = useAuth();
    const { warning } = useNotification();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await reportService.getDashboard();
            setDashboardData(data);

            // Show warnings for budget alerts
            data.warnings?.forEach((w) => {
                if (w.type === 'danger') {
                    warning(`${w.message} (${w.percentage}%)`);
                }
            });
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter categories based on user preference (showOnDashboard)
    const spendingCategories = useMemo(() => {
        if (!dashboardData?.budget?.categories) return [];

        return dashboardData.budget.categories.filter(cat => {
            // If the property exists, strictly respect it
            if (typeof cat.showOnDashboard === 'boolean') {
                return cat.showOnDashboard;
            }
            // Fallback for legacy data: Hide Personal Savings, show others
            return cat.name.toLowerCase() !== 'personal savings';
        });
    }, [dashboardData]);

    // Pie chart data for budget overview
    const pieChartData = useMemo(() => {
        if (spendingCategories.length === 0) return null;

        const colors = ['#EF4444', '#8B5CF6', '#F59E0B', '#3B82F6', '#10B981', '#EC4899'];

        return {
            labels: spendingCategories.map(cat => cat.name),
            datasets: [{
                data: spendingCategories.map(cat => cat.allocatedAmount),
                backgroundColor: spendingCategories.map((cat, i) => cat.color || colors[i % colors.length]),
                borderWidth: 0,
                hoverOffset: 10
            }]
        };
    }, [spendingCategories]);

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const category = spendingCategories[context.dataIndex];
                        const spent = category?.spent || 0;
                        const allocated = category?.allocatedAmount || 0;
                        return [
                            `Allocated: ${formatCurrency(allocated)}`,
                            `Spent: ${formatCurrency(spent)}`,
                            `Remaining: ${formatCurrency(allocated - spent)}`
                        ];
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner" />
                <p>Loading your financial overview...</p>
            </div>
        );
    }

    const hasBudget = dashboardData?.budget !== null && spendingCategories.length > 0;

    return (
        <div className="dashboard">
            {/* Welcome Section */}
            <div className="dashboard-welcome animate-fadeInDown">
                <div>
                    <h2 className="welcome-greeting">{getGreeting()}, {user?.name?.split(' ')[0]}!</h2>
                    <p className="welcome-subtitle">Here's your financial overview for <strong>{getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}</strong>.</p>
                </div>
                <Link to="/expenses">
                    <Button icon={<Plus size={18} />}>Add Expense</Button>
                </Link>
            </div>

            {/* Row 1: Quick Stats */}
            <div className="stats-grid animate-fadeInUp">
                <Card className="stat-card" variant="elevated">
                    <div className="stat-icon stat-icon-primary">
                        <Wallet size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Budget</span>
                        <span className="stat-value">{formatCurrency(dashboardData?.totalBudget || 0)}</span>
                    </div>
                </Card>

                <Card className="stat-card" variant="elevated">
                    <div className="stat-icon stat-icon-danger">
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value">{formatCurrency(dashboardData?.totalSpent || 0)}</span>
                    </div>
                </Card>

                <Card className="stat-card" variant="elevated">
                    <div className="stat-icon stat-icon-success">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Remaining</span>
                        <span className="stat-value">{formatCurrency(dashboardData?.remaining || 0)}</span>
                    </div>
                </Card>

                <Card className="stat-card" variant="elevated">
                    <div className="stat-icon stat-icon-warning">
                        <Target size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Active Goals</span>
                        <span className="stat-value">{dashboardData?.goals?.length || 0}</span>
                    </div>
                </Card>
            </div>

            {/* Row 2: Budget Overview with Pie Chart - Full Width */}
            <Card className="budget-overview-card animate-fadeInUp">
                <Card.Header>
                    <h3>Budget Overview</h3>
                    <Link to="/budget" className="card-action">
                        {hasBudget ? 'Edit Budget' : 'Set Up Budget'} <ArrowRight size={16} />
                    </Link>
                </Card.Header>
                <Card.Body>
                    {hasBudget ? (
                        <div className="budget-overview-content">
                            <div className="budget-pie-chart">
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                            <div className="budget-categories-list">
                                {spendingCategories.map((cat, index) => {
                                    const status = getBudgetStatus(cat.spent, cat.allocatedAmount);
                                    const percentage = calculatePercentage(cat.spent, cat.allocatedAmount);
                                    return (
                                        <div key={index} className="budget-category-row">
                                            <div className="category-info">
                                                <div
                                                    className="category-color-dot"
                                                    style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}
                                                />
                                                <span className="category-name">{cat.name}</span>
                                            </div>
                                            <div className="category-progress">
                                                <ProgressBar
                                                    value={cat.spent}
                                                    max={cat.allocatedAmount}
                                                    color={status.color}
                                                    showLabel={false}
                                                    showPercentage={false}
                                                    size="sm"
                                                />
                                            </div>
                                            <div className="category-stats">
                                                <span className="spent">{formatCurrency(cat.spent)}</span>
                                                <span className="separator">/</span>
                                                <span className="allocated">{formatCurrency(cat.allocatedAmount)}</span>
                                                <span className={`percentage ${status.status}`}>{percentage.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <PiggyBank size={64} />
                            <h4>No Budget Set</h4>
                            <p>Set up your monthly budget to start tracking your spending.</p>
                            <Link to="/budget">
                                <Button variant="primary">Set Up Budget</Button>
                            </Link>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Row 3: Recent Transactions - Full Width */}
            <Card className="transactions-card animate-fadeInUp">
                <Card.Header>
                    <h3>Recent Transactions</h3>
                    <Link to="/expenses" className="card-action">
                        View All <ArrowRight size={16} />
                    </Link>
                </Card.Header>
                <Card.Body>
                    {dashboardData?.recentTransactions?.length > 0 ? (
                        <div className="transactions-list">
                            {dashboardData.recentTransactions.map((tx) => (
                                <div key={tx._id} className="transaction-item">
                                    <div className="transaction-icon">
                                        <Receipt size={18} />
                                    </div>
                                    <div className="transaction-details">
                                        <span className="transaction-description">{tx.description}</span>
                                        <span className="transaction-category">{tx.category}</span>
                                    </div>
                                    <div className="transaction-meta">
                                        <span className="transaction-amount">-{formatCurrency(tx.amount)}</span>
                                        <span className="transaction-date">{formatRelativeTime(tx.date)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Receipt size={64} />
                            <h4>No Transactions Yet</h4>
                            <p>Add your first expense to start tracking your spending.</p>
                            <Link to="/expenses">
                                <Button variant="primary">Add Expense</Button>
                            </Link>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Dashboard;
