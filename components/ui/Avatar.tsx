import { cn } from "@/lib/utils";

interface AvatarProps {
  src: string;
  alt: string;
  size: number;
  className?: string;
}

const Avatar = ({ src, alt, size, className }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "rounded-full object-cover",
        className
      )}
    />
  );
};

export default Avatar;
