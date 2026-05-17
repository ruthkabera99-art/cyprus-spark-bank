import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  email?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || name.trim()[0]?.toUpperCase() || "?";
  }
  if (email?.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return "?";
}

function getGradientIndex(str: string | null | undefined): number {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 6;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-28 h-28 text-3xl",
};

export function UserAvatar({
  src,
  name,
  email,
  alt = "Avatar",
  className,
  fallbackClassName,
  size = "md",
}: UserAvatarProps) {
  const initials = getInitials(name, email);
  const gradientIndex = getGradientIndex(name || email);
  const sizeClasses = sizeMap[size];

  return (
    <Avatar className={cn(sizeClasses, "overflow-hidden rounded-full", className)}>
      <AvatarImage src={src || undefined} alt={alt} />
      <AvatarFallback
        className={cn(
          `gradient-avatar-${gradientIndex}`,
          "text-white font-semibold flex items-center justify-center",
          sizeClasses,
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
