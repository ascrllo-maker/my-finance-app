import { useState, useEffect } from 'react';
import { reportService } from '../services/financeService';
import { formatCurrency, getMonthName } from '../utils/helpers';
import Card from '../components/ui/Card';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';
import './Reports.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const [monthlyReport, setMonthlyReport] = useState(null);
    const [yearlyReport, setYearlyReport] = useState(null);
    const [trends, setTrends] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadReports();
    }, [selectedMonth, selectedYear]);

    const loadReports = async () => {
        try {
            const [monthly, yearly, trendsData] = await Promise.all([
                reportService.getMonthly(selectedMonth, selectedYear),
                reportService.getYearly(selectedYear),
                reportService.getTrends(6)
            ]);
            setMonthlyReport(monthly);
            setYearlyReport(yearly);
            setTrends(trendsData);
        } catch (err) {
            console.error('Failed to load reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const pieChartData = {
        labels: monthlyReport?.expensesByCategory?.map(c => c._id) || [],
        datasets: [{
            data: monthlyReport?.expensesByCategory?.map(c => c.total) || [],
            backgroundColor: [
                '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                '#EC4899', '#3B82F6', '#14B8A6', '#F97316', '#6366F1'
            ],
            borderWidth: 0,
            hoverOffset: 20
        }]
    };

    const barChartData = {
        labels: yearlyReport?.monthlySpending?.map(m => getMonthName(m._id).slice(0, 3)) || [],
        datasets: [{
            label: 'Spending',
            data: yearlyReport?.monthlySpending?.map(m => m.total) || [],
            backgroundColor: 'rgba(79, 70, 229, 0.8)',
            borderRadius: 8
        }]
    };

    const lineChartData = {
        labels: trends?.monthlyTotals?.map(t => `${getMonthName(t._id.month).slice(0, 3)} ${t._id.year}`) || [],
        datasets: [{
            label: 'Monthly Spending',
            data: trends?.monthlyTotals?.map(t => t.total) || [],
            borderColor: '#4F46E5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                grid: { color: 'rgba(0,0,0,0.05)' }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                bottom: 10,
                left: 0,
                right: 0
            }
        },
        plugins: {
            legend: {
                position: 'right',
                align: 'center', // Vertically center the legend
                labels: {
                    padding: 20,
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    usePointStyle: false, // Use default rectangles
                    boxWidth: 40, // Wide rectangles as shown in image
                    boxHeight: 12 // Slight height for the rectangle
                }
            },
            tooltip: {
                titleFont: {
                    size: 16
                },
                bodyFont: {
                    size: 14
                },
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: getMonthName(i + 1)
    }));

    const years = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { value: year, label: year.toString() };
    });

    if (loading) {
        return (
            <div className="reports-loading">
                <div className="loading-spinner" />
                <p>Loading reports...</p>
            </div>
        );
    }

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h2>Reports & Analytics</h2>
                    <p>Insights into your spending habits</p>
                </div>
                <div className="date-filters">
                    <select
                        className="filter-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <select
                        className="filter-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    >
                        {years.map(y => (
                            <option key={y.value} value={y.value}>{y.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-row animate-fadeInUp">
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--color-primary)' }}>
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Budget</span>
                        <span className="stat-value">{formatCurrency(monthlyReport?.totalBudget || 0)}</span>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value">{formatCurrency(monthlyReport?.totalSpent || 0)}</span>
                    </div>
                </Card>
                <Card className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Budget Used</span>
                        <span className="stat-value">{monthlyReport?.budgetUtilization || 0}%</span>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <Card className="chart-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-icon">
                            <PieChart size={20} />
                            <h3>Spending by Category</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="chart-container pie-chart">
                            {monthlyReport?.expensesByCategory?.length > 0 ? (
                                <Pie data={pieChartData} options={pieOptions} />
                            ) : (
                                <div className="no-data">No spending data for this period</div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                <Card className="chart-card animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-icon">
                            <BarChart3 size={20} />
                            <h3>Monthly Spending ({selectedYear})</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="chart-container bar-chart">
                            {yearlyReport?.monthlySpending?.length > 0 ? (
                                <Bar data={barChartData} options={chartOptions} />
                            ) : (
                                <div className="no-data">No spending data for this year</div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                <Card className="chart-card full-width animate-fadeInUp">
                    <Card.Header>
                        <div className="card-title-icon">
                            <TrendingUp size={20} />
                            <h3>Spending Trends (Last 6 Months)</h3>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="chart-container line-chart">
                            {trends?.monthlyTotals?.length > 0 ? (
                                <Line data={lineChartData} options={chartOptions} />
                            ) : (
                                <div className="no-data">Not enough data to show trends</div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Category Breakdown */}
            <Card className="breakdown-card animate-fadeInUp">
                <Card.Header>
                    <h3>Category Breakdown</h3>
                </Card.Header>
                <Card.Body>
                    {monthlyReport?.expensesByCategory?.length > 0 ? (
                        <div className="breakdown-list">
                            {monthlyReport.expensesByCategory.map((cat, index) => (
                                <div key={cat._id} className="breakdown-item">
                                    <div className="breakdown-category">
                                        <div
                                            className="category-dot"
                                            style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}
                                        />
                                        <span>{cat._id}</span>
                                    </div>
                                    <div className="breakdown-values">
                                        <span className="breakdown-count">{cat.count} transactions</span>
                                        <span className="breakdown-amount">{formatCurrency(cat.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data">No spending data for this period</div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Reports;
