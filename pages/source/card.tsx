import React from 'react';

interface CardProps {
  title?: string;
  padding?: string;
  borderRadius?: string;
  width?: string;
  height?: string;
}

const Card: React.FC<CardProps> = ({ title, padding, borderRadius, width, height, children }) => {
  return (
    <div
      style={{
        backgroundColor: 'white',
        backgroundImage: 'linear-gradient(to right, #ff9966 0%, #ff5e62 100%)',
        padding: padding || '50px',
        borderRadius: borderRadius || '15px',
        width: width || '100%',
        height: height || 'auto',
        boxSizing: 'border-box',
        boxShadow: '0 4px 6px 0 hsla(0, 0%, 0%, 0.2)',
        border: '1px solid #E0E0E0',
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {title && <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>{"Upload CSV Here"}</h3>}
      {children}
    </div>
  );
};

export default Card;
