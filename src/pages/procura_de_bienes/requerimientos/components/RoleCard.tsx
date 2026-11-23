import { UserCircle2, ClipboardList, CheckCircle, FileSearch } from 'lucide-react';

type RoleProps = {
  title: string;
  description: string;
  icon: 'jefe-area' | 'jefe-control' | 'encargado-compras';
  actions: string[];
};

const RoleCard: React.FC<RoleProps> = ({ title, description, icon, actions }) => {
  const getIcon = () => {
    switch (icon) {
      case 'jefe-area':
        return <UserCircle2 size={48} className="text-orange-500" />;
      case 'jefe-control':
        return <ClipboardList size={48} className="text-orange-600" />;
      case 'encargado-compras':
        return <FileSearch size={48} className="text-orange-500" />;
      default:
        return <CheckCircle size={48} className="text-orange-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-center mb-4">
          {getIcon()}
          <h3 className="ml-4 text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="border-t border-gray-100 pt-4">
          <h4 className="font-medium text-gray-700 mb-2">Responsabilidades:</h4>
          <ul className="space-y-2">
            {actions.map((action, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={16} className="text-orange-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-600">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoleCard;