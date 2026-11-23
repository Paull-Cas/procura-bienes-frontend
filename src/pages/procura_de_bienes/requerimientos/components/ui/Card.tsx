
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false 
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
  const hoverStyles = hoverable ? 'cursor-pointer transition-transform hover:shadow-md hover:-translate-y-1' : '';
  
  return (
    <div 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-4 py-3 border-b border-gray-200 font-medium ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

export default Card;