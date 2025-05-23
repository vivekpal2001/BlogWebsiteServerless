import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../hooks/useQueries';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const location = useLocation();
    const { data: user, isLoading, isError } = useUser();
    const token = localStorage.getItem('token');

    // If there's no token, redirect to signin
    if (!token) {
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // If we're still loading the user data, show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // If there's an error or no user data, redirect to signin
    if (isError || !user) {
        localStorage.removeItem('token'); // Clear invalid token
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // If we have a valid user, render the protected content
    return <>{children}</>;
}; 