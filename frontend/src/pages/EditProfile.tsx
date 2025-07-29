import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Appbar } from "../components/Appbar";
import { Spinner } from "../components/Spinner";

export const EditProfile = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [avatar, setAvatar] = useState("");
    const [bio, setBio] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/signin");
                    return;
                }

                const response = await axios.get(`${BACKEND_URL}/api/v1/user/me`, {
                    headers: {
                        Authorization: token
                    }
                });

                setName(response.data.name || "");
                setUsername(response.data.username || "");
                setAvatar(response.data.avatar || "");
                setBio(response.data.bio || "");
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        navigate("/signin");
                    } else {
                        setError(error.response?.data?.message || "Failed to fetch user data");
                    }
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSaving(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/signin");
                return;
            }

            await axios.put(
                `${BACKEND_URL}/api/v1/user/update`,
                { 
                    name,
                    username,
                    password: password || undefined, // Only send password if it's not empty
                    avatar,
                    bio
                },
                {
                    headers: {
                        Authorization: token
                    }
                }
            );

            setSuccess("Profile updated successfully!");
            setTimeout(() => {
                navigate("/blogs");
            }, 2000);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    navigate("/signin");
                } else {
                    setError(error.response?.data?.message || "Failed to update profile");
                }
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Appbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <Spinner />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Appbar />
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Profile</h1>
                    
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center text-red-700 dark:text-red-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg flex items-center text-green-700 dark:text-green-200">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-2">
                                {avatar ? (
                                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-white bg-black w-full h-full flex items-center justify-center">?</span>
                                )}
                            </div>
                            <input
                                type="text"
                                id="avatar"
                                value={avatar}
                                onChange={e => setAvatar(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mt-2"
                                placeholder="Avatar image URL"
                                disabled={saving}
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Paste an image URL for your avatar.</p>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Enter your name"
                                required
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Enter your username"
                                required
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Tell us about yourself..."
                                rows={3}
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Enter new password (leave blank to keep current)"
                                disabled={saving}
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Leave password blank if you don't want to change it
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="button"
                                onClick={() => navigate("/blogs")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none focus:underline transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <div className="flex items-center">
                                        <Spinner />
                                        <span className="ml-2">Saving...</span>
                                    </div>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}; 