import React from 'react';

const PulsingDots = ({ 
  size = 'md', 
  color = 'blue', 
  text = 'Loading',
  className = '' 
}) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px'
    },
    dotsContainer: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    dot: {
      borderRadius: '50%',
      animation: 'pulse 1.4s ease-in-out infinite'
    },
    text: {
      color: '#666',
      fontSize: '14px',
      fontWeight: '500',
      margin: 0,
      animation: 'textPulse 2s ease-in-out infinite'
    }
  };

  const sizeMap = {
    sm: { width: '8px', height: '8px' },
    md: { width: '12px', height: '12px' },
    lg: { width: '16px', height: '16px' },
    xl: { width: '20px', height: '20px' }
  };

  const colorMap = {
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#10b981',
    red: '#ef4444',
    gray: '#6b7280',
    indigo: '#6366f1',
    pink: '#ec4899',
    orange: '#f97316'
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1.2);
              opacity: 1;
            }
          }
          
          @keyframes textPulse {
            0%, 100% {
              opacity: 0.7;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>
      
      <div style={styles.container} className={className}>
        <div style={styles.dotsContainer}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              style={{
                ...styles.dot,
                ...sizeMap[size],
                backgroundColor: colorMap[color],
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {text && (
          <p style={styles.text}>
            {text}...
          </p>
        )}
      </div>
    </>
  );
};

export default PulsingDots;