import React from 'react';

const AppleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Apple Body */}
        <path
            d="M 50,29 C 20,29 15,58 30,78 C 45,98 55,98 70,78 C 85,58 80,29 50,29 Z"
            fill="#f44336"
        />
        {/* Top indent shadow */}
        <path
            d="M 50,29 C 40,38 60,38 50,29 Z"
            fill="#c62828"
        />
        {/* Stem */}
        <path
            d="M 50,29 C 52,20 62,20 60,10"
            stroke="#795548"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
        />
        {/* Leaf */}
        <path
            d="M 60,20 C 70,10 80,20 65,25"
            fill="#4caf50"
        />
    </svg>
);

export default AppleIcon;
