import './Input.css';

const Input = ({
    label,
    type = 'text',
    error,
    icon,
    iconPosition = 'left',
    fullWidth = true,
    className = '',
    ...props
}) => {
    const wrapperClasses = [
        'input-wrapper',
        fullWidth ? 'input-full' : '',
        error ? 'input-error' : '',
        icon ? `input-with-icon input-icon-${iconPosition}` : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {label && <label className="input-label">{label}</label>}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input type={type} className="input" {...props} />
            </div>
            {error && <span className="input-error-message">{error}</span>}
        </div>
    );
};

export default Input;
