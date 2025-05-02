import React from 'react';

type AvatarProps = {
  src: string;
  alt?: string;
  size?: number;
};

const Avatar = ({ src, alt = 'User Avatar', size = 40 }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
};

export default Avatar;
