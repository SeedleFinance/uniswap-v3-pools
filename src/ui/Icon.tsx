import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Props {
  icon: any; // TODO: fix type
  size?: any;
  spin?: boolean;
  className?: string;
}

const Icon = ({ icon, size, spin, className }: Props) => {
  return <FontAwesomeIcon className={className} icon={icon} size={size} spin={spin} />;
};

export default Icon;
