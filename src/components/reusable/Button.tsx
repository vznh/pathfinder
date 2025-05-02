// components/reusable/Button.tsx
import type { ReactNode } from "react";
import type { ButtonLayoutPosition } from "@/models/types";
import { cn } from "@/utils/";

interface ButtonProps {
	icon: ReactNode;
	position: ButtonLayoutPosition;
	onClick?: () => void;
	className?: string;
	disabled?: boolean; // Add disabled prop
}

export const Button = ({ icon, position, onClick, className, disabled = false }: ButtonProps) => { // Destructure disabled prop with a default value
	const positionClasses = {
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
	};

	// base classes and state-specific classes
	const baseClasses = "absolute flex items-center justify-center rounded-lg shadow-lg transition-all w-12 h-12 text-base";
	const enabledClasses = "bg-gray-50 hover:bg-gray-100 active:bg-gray-200";
	const disabledClasses = "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70";

	const finalClassName = cn(
		baseClasses,
		positionClasses[position],
		disabled ? disabledClasses : enabledClasses,
		className,
	);

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={finalClassName}
		>
			{icon}
		</button>
	);
};
