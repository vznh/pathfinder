import type { ButtonLayoutPosition } from "@/models/types";
import type { ReactNode } from "react";

interface ButtonProps {
  icon: ReactNode;
  position?: ButtonLayoutPosition; // Made position optional
  onClick?: () => void;
  className?: string;
  isStatic?: boolean; // Added property for static positioning
}

export const Button = ({ 
  icon, 
  position = "top-left", // Default position if not provided
  onClick, 
  className = "",
  isStatic = false // Default to false for backward compatibility
}: ButtonProps) => {
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  // Apply position classes only if not static
  const positioningClasses = isStatic ? "" : `absolute ${positionClasses[position]}`;

  return (
    <button
      onClick={onClick}
      className={`flex items-center bg-gray-50 justify-center rounded-lg shadow-lg transition-all w-12 h-12 text-base ${positioningClasses} ${className}`}
    >
      {icon}
    </button>
  );
};