import React from 'react';
import { WasteType } from '../../types';
import { 
  Sofa, 
  Tv, 
  Smartphone, 
  Hammer, 
  Trees, 
  ShoppingBag 
} from 'lucide-react';

interface WasteTypeIconProps {
  type: WasteType;
  className?: string;
  size?: number;
  color?: string;
  withLabel?: boolean;
}

const wasteTypeConfig: Record<WasteType, {
  icon: React.FC<{ size?: number, className?: string }>;
  label: string;
  color: string;
}> = {
  furniture: {
    icon: Sofa,
    label: 'Furniture',
    color: 'text-amber-600'
  },
  appliances: {
    icon: Tv,
    label: 'Appliances',
    color: 'text-blue-600'
  },
  electronics: {
    icon: Smartphone,
    label: 'Electronics',
    color: 'text-purple-600'
  },
  rubble: {
    icon: Hammer,
    label: 'Rubble',
    color: 'text-gray-600'
  },
  green_waste: {
    icon: Trees,
    label: 'Green Waste',
    color: 'text-green-600'
  },
  household: {
    icon: ShoppingBag,
    label: 'Household',
    color: 'text-teal-600'
  }
};

const WasteTypeIcon: React.FC<WasteTypeIconProps> = ({
  type,
  className = '',
  size = 20,
  color,
  withLabel = false
}) => {
  const config = wasteTypeConfig[type];
  const Icon = config.icon;
  const colorClass = color ? `text-${color}` : config.color;

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Icon size={size} className={colorClass} />
      {withLabel && (
        <span className="ml-2 text-sm font-medium text-gray-700">{config.label}</span>
      )}
    </div>
  );
};

export function getAllWasteTypes(): Array<{
  type: WasteType;
  label: string;
  icon: React.FC<{ size?: number, className?: string }>;
  color: string;
}> {
  return Object.entries(wasteTypeConfig).map(([type, config]) => ({
    type: type as WasteType,
    ...config
  }));
}

export default WasteTypeIcon;