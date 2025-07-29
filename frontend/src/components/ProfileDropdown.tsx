import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useLogout } from "../hooks/useQueries";

interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
}

interface ProfileDropdownProps {
    size?: "small" | "big";
}

export const ProfileDropdown = ({ size = "big" }: ProfileDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const logout = useLogout();

    // Use the cached user data
    const { data: user, isLoading, error } = useUser() as { 
        data: User | undefined; 
        isLoading: boolean; 
        error: Error | null; 
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout(); // This will clear the cache and remove the token
        navigate("/");
    };

    if (isLoading) {
        const sizeClass = size === 'small' ? 'w-6 h-6' : 'w-10 h-10';
        return (
          <div
            className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse`}
          />
        );
      }
      

    if (error || !user) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                <div className={`w-${size === "small" ? "6" : "10"} h-${size === "small" ? "6" : "10"} rounded-full overflow-hidden ${user.avatar ? "" : "bg-black"}`}>
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center ${size === "small" ? "text-xs" : "text-md"} font-medium text-white`}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.username}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/profile");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            navigate("/settings");
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Settings
                    </button>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}; 