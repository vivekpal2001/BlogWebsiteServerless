import { Link } from "react-router-dom"
import { ProfileDropdown } from "./ProfileDropdown"

export const Appbar = () => {
    return (
        <div className="border-b flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4">
            <Link to={'/blogs'} className="flex flex-col justify-center cursor-pointer text-xl sm:text-2xl font-bold">
                DevScribble
            </Link>
            <div className="flex items-center space-x-4">
                <Link to={`/publish`}>
                    <button 
                        type="button" 
                        className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-4 sm:px-5 py-2 text-center transition-colors duration-200"
                    >
                        New
                    </button>
                </Link>
                <div className="flex items-center">
                    <ProfileDropdown />
                </div>
            </div>
        </div>
    )
}