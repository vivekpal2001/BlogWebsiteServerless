import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../config';

// Types
interface User {
    id: string;
    name: string;
    username: string;
    avatar?: string;
}

interface Blog {
    id: string;
    title: string;
    content: string;
    author: User;
    createdAt: string;
}

// Keys for React Query
export const queryKeys = {
    blogs: 'blogs',
    blog: (id: string) => ['blog', id],
    user: 'user',
};

// Custom hook for fetching blogs with infinite scroll
export const useBlogs = (pageSize = 5) => {
    return useInfiniteQuery({
        queryKey: [queryKeys.blogs],
        queryFn: async ({ pageParam = 1 }) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found in localStorage');
                    throw new Error('No token found');
                }
                
                console.log('Fetching blogs with token:', token.substring(0, 10) + '...');
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk?page=${pageParam}&limit=${pageSize}`, {
                    headers: {
                        Authorization: token
                    }
                });
                
                console.log('Blogs API Response:', response.data);
                
                // Check if response.data has a blogs property
                if (response.data && typeof response.data === 'object' && 'blogs' in response.data) {
                    return response.data.blogs;
                }
                
                // If response.data is an array directly
                if (Array.isArray(response.data)) {
                    return response.data;
                }
                
                console.error('Unexpected response format:', response.data);
                throw new Error('Invalid response format from blogs API');
            } catch (error) {
                console.error('Error in useBlogs:', error);
                if (axios.isAxiosError(error)) {
                    console.error('Axios error details:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        headers: error.response?.headers
                    });
                }
                throw error;
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            console.log('getNextPageParam:', { lastPageLength: lastPage.length, pageSize });
            // If the last page has fewer items than pageSize, we've reached the end
            return lastPage.length === pageSize ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30,
        retry: 1, // Only retry once on failure
    });
};

// Custom hook for fetching a single blog with caching
export const useBlog = (id: string) => {
    return useQuery({
        queryKey: queryKeys.blog(id),
        queryFn: async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                    headers: {
                        Authorization: token
                    }
                });
                
                // Check if response.data has a blog property
                if (response.data && typeof response.data === 'object' && 'blog' in response.data) {
                    return response.data.blog as Blog;
                }
                
                // If response.data is the blog object directly
                if (response.data && typeof response.data === 'object') {
                    return response.data as Blog;
                }
                
                throw new Error('Invalid blog data format');
            } catch (error) {
                console.error('Error fetching blog:', error);
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Changed from cacheTime to gcTime
        refetchOnWindowFocus: false, // Disable refetch on window focus
        refetchOnMount: false, // Disable refetch on mount
        refetchOnReconnect: false, // Disable refetch on reconnect
        retry: 1, // Only retry once on failure
    });
};

// Custom hook for fetching user profile with caching
export const useUser = () => {
    return useQuery({
        queryKey: [queryKeys.user],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                headers: {
                    Authorization: token
                }
            });
            return response.data as User;
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Changed from cacheTime to gcTime
        refetchOnWindowFocus: false, // Disable refetch on window focus
        refetchOnMount: false, // Disable refetch on mount
        refetchOnReconnect: false, // Disable refetch on reconnect
        retry: false, // Don't retry if unauthorized
    });
};

// Custom hook for updating user profile
export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: { name?: string; username?: string; password?: string }) => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await axios.put(
                `${BACKEND_URL}/api/v1/user/update`,
                data,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            return response.data as User;
        },
        onSuccess: () => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
        },
    });
};

// Custom hook for logging out and clearing cache
export const useLogout = () => {
    const queryClient = useQueryClient();
    
    return () => {
        // Clear all queries from cache
        queryClient.clear();
        // Remove token
        localStorage.removeItem('token');
    };
};

// Custom hook for creating a new blog
export const useCreateBlog = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (data: { title: string; content: string }) => {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token found');
            
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/blog`,
                data,
                {
                    headers: {
                        Authorization: token
                    }
                }
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch blogs
            queryClient.invalidateQueries({ queryKey: [queryKeys.blogs] });
        },
    });
}; 