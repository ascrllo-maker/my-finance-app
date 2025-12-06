import { useNotification } from '../../contexts/NotificationContext';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import './NotificationToast.css';

const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
};

const NotificationToast = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="toast-container">
            {notifications.map((notification) => {
                const Icon = icons[notification.type] || Info;

                return (
                    <div
                        key={notification.id}
                        className={`toast toast-${notification.type} animate-slideInRight`}
                    >
                        <div className="toast-icon">
                            <Icon size={20} />
                        </div>
                        <div className="toast-content">
                            <h4 className="toast-title">{notification.title}</h4>
                            <p className="toast-message">{notification.message}</p>
                        </div>
                        <button
                            className="toast-close"
                            onClick={() => removeNotification(notification.id)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default NotificationToast;
