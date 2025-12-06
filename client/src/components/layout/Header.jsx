import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { Sun, Moon, Bell, LogOut, Menu, User, X, Check, AlertCircle, Info } from 'lucide-react';
import './Header.css';

const Header = ({ onMenuClick, title }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { notifications, removeNotification } = useNotification();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return <Check size={16} />;
            case 'error': return <X size={16} />;
            case 'warning': return <AlertCircle size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                    <Menu size={20} />
                </button>
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <button className="header-icon-btn" onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="notification-wrapper" ref={dropdownRef}>
                    <button
                        className="header-icon-btn"
                        title="Notifications"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="notification-badge">{notifications.length}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h4>Notifications</h4>
                                {notifications.length > 0 && (
                                    <span className="notification-count">{notifications.length} new</span>
                                )}
                            </div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className={`notification-item notification-${notif.type}`}>
                                            <div className="notification-icon">
                                                {getNotificationIcon(notif.type)}
                                            </div>
                                            <div className="notification-content">
                                                <p>{notif.message}</p>
                                            </div>
                                            <button
                                                className="notification-dismiss"
                                                onClick={() => removeNotification(notif.id)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-empty">
                                        <Bell size={32} />
                                        <p>No new notifications</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="header-user">
                    <div className="user-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                        ) : (
                            <User size={18} />
                        )}
                    </div>
                    <div className="user-info hide-mobile">
                        <span className="user-name">{user?.name}</span>
                    </div>
                </div>

                <button className="header-icon-btn logout-btn" onClick={logout} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
