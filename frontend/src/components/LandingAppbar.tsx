import { Link } from "react-router-dom"
import { ThemeToggle } from "./ThemeToggle"

export const LandingAppbar = () => {
    return <div className="border-b flex justify-between px-10 py-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <Link to={'/'} className="flex flex-col justify-center cursor-pointer text-2xl font-bold text-gray-900 dark:text-gray-100">
            DevScribble
        </Link>
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/about">
                <button type="button" className="text-gray-800 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-sm px-4 py-2">About Us</button>
            </Link>
            <Link to="/signin">
                <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center">Sign In</button>
            </Link>
        </div>
    </div>
} 