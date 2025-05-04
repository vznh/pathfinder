// components/reusable/DropdownMenu.tsx
import { ReactNode, useEffect, useRef, useState } from "react";

interface DropdownMenuProps {
  toggleIcon: ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
  className?: string;
  buttonClassName?: string;
  theme?: "light" | "dark";
  label?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  toggleIcon,
  position = "top-left",
  children,
  className = "",
  buttonClassName = "",
  theme = "light",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on clicks outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(tgt) &&
        toggleWrapperRef.current &&
        !toggleWrapperRef.current.contains(tgt)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [isOpen]);

  // Position menu relative to the toggle
  const getDropdownPosition = () => {
    switch (position) {
      case "top-left":
      case "top-right":
        return "absolute left-0 mt-2";
      case "bottom-left":
      case "bottom-right":
        return "absolute left-0 bottom-full mb-2";
      default:
        return "absolute left-0 mt-2";
    }
  };

  // Theme styles
  const containerTheme =
    theme === "dark"
      ? "bg-gray-800 text-white shadow-2xl rounded-2xl"
      : "bg-white text-gray-800 shadow-lg rounded-lg";

  return (
    <div className="relative inline-block" ref={toggleWrapperRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`p-2 rounded-lg focus:outline-none ${buttonClassName}`}
        aria-label={label ?? "Toggle dropdown"}
        aria-expanded={isOpen}
      >
        {toggleIcon}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`${getDropdownPosition()} z-10 ${containerTheme} p-2 ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
