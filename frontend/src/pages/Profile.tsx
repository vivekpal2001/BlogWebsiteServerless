import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BACKEND_URL } from '../config';
import { Appbar } from '../components/Appbar';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  blogCount: number;
  _count?: {
    followers: number;
    following: number;
  };
  isFollowedByMe?: boolean;
}

const Profile: React.FC = () => {
  const { id: routeUserId } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'about'>('home');
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch current user id for follow/unfollow logic
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/user/me`, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUserId(data.id));
  }, []);

  // Fetch profile user data
  useEffect(() => {
    const url = routeUserId ? `${BACKEND_URL}/api/v1/user/${routeUserId}` : `${BACKEND_URL}/api/v1/user/me`;
    fetch(url, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, [routeUserId]);

  // Fetch posts for the profile user
  useEffect(() => {
    if (!user) return;
    setLoadingPosts(true);
    const url = routeUserId ? `${BACKEND_URL}/api/v1/blog/bulk?authorId=${user.id}` : `${BACKEND_URL}/api/v1/blog/my`;
    fetch(url, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.blogs || []);
        setLoadingPosts(false);
      });
  }, [user, routeUserId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    await fetch(`/api/v1/blog/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    await fetch(`${BACKEND_URL}/api/v1/user/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ followingId: user.id }),
    });
    setUser((prev) => prev ? { ...prev, isFollowedByMe: true, _count: { ...prev._count, followers: (prev._count?.followers ?? 0) + 1, following: prev._count?.following ?? 0 } } : prev);
    setFollowLoading(false);
  };

  const handleUnfollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    await fetch('/api/v1/user/unfollow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ followingId: user.id }),
    });
    setUser((prev) => prev ? { ...prev, isFollowedByMe: false, _count: { ...prev._count, followers: (prev._count?.followers ?? 1) - 1, following: prev._count?.following ?? 0 } } : prev);
    setFollowLoading(false);
  };

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <span className="text-gray-700 dark:text-gray-200">Loading...</span>
      </div>
    </div>
  );
  

  const isOwnProfile = currentUserId === user.id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="flex flex-col md:flex-row max-w-5xl mx-auto mt-8">
        {/* Main content */}
        <div className="flex-1 mr-0 md:mr-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">{user.name}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <button
              className={`border-b-2 ${activeTab === 'home' ? 'border-black dark:border-white font-semibold' : 'border-transparent'} px-2 py-1 text-gray-700 dark:text-gray-200`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button
              className={`border-b-2 ${activeTab === 'about' ? 'border-black dark:border-white font-semibold' : 'border-transparent'} px-2 py-1 text-gray-700 dark:text-gray-200`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-h-[200px]">
            {activeTab === 'home' ? (
              <div>
                {loadingPosts ? (
                  <div className="text-gray-500 dark:text-gray-400">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">No stories yet.</div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="border-b pb-4 border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{post.title}</h3>
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">By {post.author?.name || user.name}</div>
                        <div className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">{post.content.slice(0, 120)}{post.content.length > 120 ? '...' : ''}</div>
                        {post.publishedAt && (
                          <div className="text-xs text-gray-400">Published: {new Date(post.publishedAt).toLocaleDateString()}</div>
                        )}
                        {isOwnProfile && (
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => navigate(`/edit-blog/${post.id}`)}
                              className="px-3 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="px-3 py-1 text-xs rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{user.bio || 'No bio provided.'}</div>
              </div>
            )}
          </div>
        </div>
        {/* Sidebar */}
        <div className="w-full md:w-64 flex flex-col items-center mt-8 md:mt-0">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-white bg-black w-full h-full flex items-center justify-center">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">{user.name}</div>
          <div className="text-gray-500 dark:text-gray-400 mb-2">@{user.username}</div>
          {isOwnProfile ? (
            <button
              onClick={() => navigate('/edit-profile')}
              className="text-green-600 dark:text-green-400 hover:underline mb-4"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={user.isFollowedByMe ? handleUnfollow : handleFollow}
              className={`mb-4 px-4 py-2 rounded text-sm font-medium transition-colors ${user.isFollowedByMe ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' : 'bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-800'}`}
              disabled={followLoading}
            >
              {user.isFollowedByMe ? 'Unfollow' : 'Follow'}
            </button>
          )}
          <div className="flex space-x-4 text-sm text-gray-700 dark:text-gray-300 mb-2">
            <span><b>{user.blogCount}</b> Posts</span>
            <span><b>{user._count?.followers ?? 0}</b> Followers</span>
            <span><b>{user._count?.following ?? 0}</b> Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 