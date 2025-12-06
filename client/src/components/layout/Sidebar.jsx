import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Wallet,
    Receipt,
    Target,
    BarChart3,
    Tags,
    Repeat,
    Settings,
    ChevronLeft,
    ChevronRight,
    X
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/budget', icon: Wallet, label: 'Budget Setup' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/goals', icon: Target, label: 'Goals' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/categories', icon: Tags, label: 'Categories' },
    { path: '/recurring', icon: Repeat, label: 'Recurring' },
    { path: '/settings', icon: Settings, label: 'Settings' }
];

const Sidebar = ({ isCollapsed, isOpen, onToggle, onClose, onNavClick }) => {
    return (
        <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-header">
                <div
                    className={`sidebar-logo ${isCollapsed ? 'sidebar-logo-clickable' : ''}`}
                    onClick={isCollapsed ? onToggle : undefined}
                    title={isCollapsed ? 'Expand sidebar' : undefined}
                >
                    <div className="logo-icon">
                        <Wallet size={24} />
                    </div>
                    {!isCollapsed && <span className="logo-text">myFinance</span>}
                </div>
                {!isCollapsed && (
                    <button className="sidebar-toggle" onClick={onToggle}>
                        <ChevronLeft size={18} />
                    </button>
                )}
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
                    <X size={20} />
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? 'nav-item-active' : ''}`
                        }
                        title={isCollapsed ? item.label : undefined}
                        onClick={onNavClick}
                    >
                        <item.icon size={20} className="nav-icon" />
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed && (
                    <div className="sidebar-version">
                        <span>Made by Airl Carillo</span>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
