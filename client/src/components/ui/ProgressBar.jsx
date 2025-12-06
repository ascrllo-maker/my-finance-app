import './ProgressBar.css';

const ProgressBar = ({
    value = 0,
    max = 100,
    showLabel = true,
    showPercentage = true,
    label,
    color,
    size = 'md',
    animated = true,
    className = ''
}) => {
    const percentage = Math.min((value / max) * 100, 100);

    // Determine color based on percentage if not explicitly set
    const getStatusColor = () => {
        if (color) return color;
        if (percentage >= 100) return 'var(--color-danger)';
        if (percentage >= 80) return 'var(--color-warning)';
        return 'var(--color-success)';
    };

    const classes = [
        'progress-bar-container',
        `progress-bar-${size}`,
        animated ? 'progress-bar-animated' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {(showLabel || showPercentage) && (
                <div className="progress-bar-header">
                    {label && <span className="progress-bar-label">{label}</span>}
                    {showPercentage && (
                        <span className="progress-bar-percentage">{percentage.toFixed(0)}%</span>
                    )}
                </div>
            )}
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getStatusColor()
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
