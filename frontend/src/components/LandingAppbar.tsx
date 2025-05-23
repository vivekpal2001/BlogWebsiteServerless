import { Link } from "react-router-dom"

export const LandingAppbar = () => {
    return <div className="border-b flex justify-between px-10 py-4">
        <Link to={'/'} className="flex flex-col justify-center cursor-pointer text-2xl font-bold">
            DevScribble
        </Link>
        <div className="flex items-center gap-4">
            <Link to="/about">
                <button type="button" className="text-gray-800 hover:text-gray-600 font-medium text-sm px-4 py-2">About Us</button>
            </Link>
            <Link to="/signin">
                <button type="button" className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center">Sign In</button>
            </Link>
        </div>
    </div>
} 