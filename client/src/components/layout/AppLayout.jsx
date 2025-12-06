import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './AppLayout.css';

const pageTitles = {
    '/': 'Dashboard',
    '/budget': 'Budget Setup',
    '/expenses': 'Expenses',
    '/goals': 'Financial Goals',
    '/reports': 'Reports & Analytics',
    '/categories': 'Categories',
    '/recurring': 'Recurring Payments',
    '/settings': 'Settings'
};

const AppLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const pageTitle = pageTitles[location.pathname] || 'myFinance';

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const openMobileMenu = () => {
        setMobileMenuOpen(true);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className={`app-layout ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}>
            <Sidebar
                isCollapsed={sidebarCollapsed}
                isOpen={mobileMenuOpen}
                onToggle={toggleSidebar}
                onClose={closeMobileMenu}
                onNavClick={closeMobileMenu}
            />

            <div
                className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />

            <div className="main-content">
                <Header
                    title={pageTitle}
                    onMenuClick={openMobileMenu}
                />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
