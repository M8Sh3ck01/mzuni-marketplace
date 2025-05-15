import React from 'react';

type AvatarProps = {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
};

const Avatar = ({ src, alt = 'User Avatar', size = 40, className = '' }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
};

export default Avatar;
