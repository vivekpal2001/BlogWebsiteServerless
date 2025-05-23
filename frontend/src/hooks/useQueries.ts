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
                    throw new Error('No token found');
                }
                
                const response = await axios.get(`${BACKEND_URL}/api/v1/blog/bulk?page=${pageParam}&limit=${pageSize}`, {
                    headers: {
                        Authorization: token
                    }
                });
                
                if (response.data && typeof response.data === 'object' && 'blogs' in response.data) {
                    return response.data.blogs;
                }
                
                if (Array.isArray(response.data)) {
                    return response.data;
                }
                
                throw new Error('Invalid response format from blogs API');
            } catch (error) {
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
            return lastPage.length === pageSize ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
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
                
                if (response.data && typeof response.data === 'object' && 'blog' in response.data) {
                    return response.data.blog as Blog;
                }
                
                if (response.data && typeof response.data === 'object') {
                    return response.data as Blog;
                }
                
                throw new Error('Invalid blog data format');
            } catch (error) {
                throw error;
            }
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
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
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: false,
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
            queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
        },
    });
};

// Custom hook for logging out and clearing cache
export const useLogout = () => {
    const queryClient = useQueryClient();
    
    return () => {
        queryClient.clear();
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
            queryClient.invalidateQueries({ queryKey: [queryKeys.blogs] });
        },
    });
}; 