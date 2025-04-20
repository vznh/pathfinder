import type { ButtonLayoutPosition } from "@/models/types";
// components/reusable/Button.tsx
import type { ReactNode } from "react";

interface ButtonProps {
	icon: ReactNode;
	position: ButtonLayoutPosition;
	onClick?: () => void;
	className?: string;
}

export const Button = ({ icon, position, onClick, className }: ButtonProps) => {
	const positionClasses = {
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
	};

	return (
		<button
			onClick={onClick}
			className={`absolute flex items-center bg-gray-50 justify-center rounded-lg shadow-lg transition-all w-12 h-12 text-base ${positionClasses[position]} ${className}`}
		>
			{icon}
		</button>
	);
};
