import { Link } from "react-router-dom"
import { ProfileDropdown } from "./ProfileDropdown"
import { ThemeToggle } from "./ThemeToggle"
import { useState } from "react";
import { Bars3Icon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export const Appbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="border-b flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 relative">
            <Link to={'/blogs'} className="flex flex-col justify-center cursor-pointer text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                DevScribble
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
                <ThemeToggle />
                <Link to={`/my-blogs`}>
                    <button 
                        type="button" 
                        className="text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-4 sm:px-5 py-2 text-center transition-colors duration-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                    >
                        My Blogs
                    </button>
                </Link>
                <Link to={`/publish`}>
                    <button 
                        type="button" 
                        className="flex items-center justify-center text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-3 sm:px-4 py-2 text-center transition-colors duration-200"
                        title="Create Blog"
                    >
                        <PlusIcon className="h-5 w-5 mr-1" />
                        <span className="hidden sm:inline">New</span>
                    </button>
                </Link>
                <div className="flex items-center">
                    <ProfileDropdown />
                </div>
            </div>
            <div className="flex items-center sm:hidden space-x-4">
                <ThemeToggle />
                <button onClick={toggleMobileMenu} className="text-gray-700 dark:text-gray-300 focus:outline-none">
                    {isMobileMenuOpen ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>
            </div>
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg py-4 sm:hidden z-20">
                    <div className="flex flex-col items-center space-y-4">
                        <Link to={`/my-blogs`} onClick={toggleMobileMenu} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium">
                            My Blogs
                        </Link>
                        <Link to={`/publish`} onClick={toggleMobileMenu} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium flex items-center">
                            <PlusIcon className="h-5 w-5 mr-1" />
                            <span>New</span>
                        </Link>
                        <div className="w-full flex justify-center">
                            <ProfileDropdown size="small" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}