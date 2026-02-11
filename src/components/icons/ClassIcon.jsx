import { CLASS_ICONS, ROLE_ICONS } from './index';

// Renders the appropriate class icon based on classId
const ClassIcon = ({ classId, size = 24, className = '' }) => {
  const IconComponent = CLASS_ICONS[classId];

  if (!IconComponent) {
    // Fallback to a generic icon or null
    return <span className={className} style={{ fontSize: size * 0.8 }}>?</span>;
  }

  return <IconComponent size={size} className={className} />;
};

// Renders the appropriate role icon
export const RoleIcon = ({ role, size = 24, className = '' }) => {
  const IconComponent = ROLE_ICONS[role];

  if (!IconComponent) {
    return <span className={className} style={{ fontSize: size * 0.8 }}>?</span>;
  }

  return <IconComponent size={size} className={className} />;
};

export default ClassIcon;
