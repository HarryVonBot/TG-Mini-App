import React from 'react';

interface MembershipCardProps {
  level: string;
  className?: string;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ level, className = '' }) => {
  const cardPath = `/assets/membership-cards/${level}-card.png`;
  
  return (
    <div className={`membership-card ${className}`}>
      <img 
        src={cardPath}
        alt={`${level} membership card`}
        className="w-full h-auto max-w-[280px] rounded-lg shadow-lg"
        style={{ 
          width: '280px', 
          height: '158px',
          objectFit: 'cover'
        }}
        onError={(e) => {
          // Fallback if image doesn't exist
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling!.setAttribute('style', 'display: block');
        }}
      />
      <div 
        className="fallback-card bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg shadow-lg flex items-center justify-center"
        style={{ 
          width: '280px', 
          height: '158px',
          display: 'none'
        }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">💳</div>
          <div className="font-semibold">{level.toUpperCase()} MEMBER</div>
          <div className="text-sm opacity-75">Card Loading...</div>
        </div>
      </div>
    </div>
  );
};