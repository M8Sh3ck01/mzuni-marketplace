import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconProps {
  icon: LucideIcon;
  className?: string;
  color?: string;
  size?: number;
}

export function Icon({ icon: Icon, className, color, size = 24 }: IconProps) {
  return (
    <Icon 
      className={cn(className)} 
      style={{ 
        color: color || 'currentColor',
        width: size,
        height: size
      }} 
    />
  );
} 