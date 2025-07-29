import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Appbar } from "./Appbar";
import { Avatar } from "./BlogCard";
import { BACKEND_URL } from "../config";
import axios from "axios";

// Type definitions
interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  publishedAt?: string;
  author?: Author;
  likedByMe: boolean;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
}

export const FullBlog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/blog/${id}`, {
          headers: { Authorization: `${token}` },
        });
        
        if (!response.ok) throw new Error("Network response was not ok");
        
        const data = await response.json();
        setBlog(data.blog || data);
        
        if (data.comments) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to load blog. Please try again later.");
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, token]);

  // Fetch comments when showComments becomes true and comments are empty
  useEffect(() => {
    if (showComments && comments.length === 0 && blog && token) {
      fetchComments();
    }
  }, [showComments, blog, token]);

  const updateBlogLike = (liked: boolean, count: number) => {
    setBlog(prev => prev ? {
      ...prev,
      likedByMe: liked,
      _count: {
        ...prev._count,
        likes: count,
        comments: prev._count?.comments || 0
      }
    } : null);
  };

  const handleLike = async () => {
    if (!blog || likeLoading || !token) return;
    
    setLikeLoading(true);
    
    const wasLiked = blog.likedByMe;
    const currentLikes = blog._count?.likes || 0;
    const newLikeCount = wasLiked ? currentLikes - 1 : currentLikes + 1;
    
    // Optimistic update
    updateBlogLike(!wasLiked, newLikeCount);

    try {
      const blogId = String(blog.id);
      
      if (wasLiked) {
        await axios.delete(`${BACKEND_URL}/api/v1/blog/unlike`, {
          headers: { Authorization: token },
          data: { blogId },
        });
      } else {
        await axios.post(`${BACKEND_URL}/api/v1/blog/like`, 
          { blogId }, 
          { headers: { Authorization: token } }
        );
      }
    } catch (error) {
      // Revert optimistic update on error
      updateBlogLike(wasLiked, currentLikes);
      console.error("Error toggling like:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const updateCommentCount = () => {
    setBlog(prev => prev ? {
      ...prev,
      _count: {
        likes: prev._count?.likes || 0,
        comments: (prev._count?.comments || 0) + 1
      }
    } : null);
  };

  const handleAddComment = async () => {
    if (!blog || !newComment.trim() || commentLoading || !token) return;
    
    setCommentLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog/comment`,
        { 
          blogId: String(blog.id),
          content: newComment.trim()
        },
        { headers: { Authorization: token } }
      );

      const newCommentData = response.data.comment;
      setComments(prev => [newCommentData, ...prev]);
      updateCommentCount();
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!blog || comments.length > 0 || !token) return;
    
    try {
      setCommentLoading(true);
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/blog/comment/${blog.id}`,
        { headers: { Authorization: token } }
      );
      
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <span className="text-gray-700 dark:text-gray-200">Loading...</span>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <span className="text-red-600 dark:text-red-400">{error}</span>
      </div>
    </div>
  );

  const renderNotFoundState = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Appbar />
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <span className="text-gray-700 dark:text-gray-200">Blog not found.</span>
      </div>
    </div>
  );

  const renderInteractionButtons = () => (
    <div className="flex items-center space-x-6 mt-6 mb-6">
      <button
        onClick={handleLike}
        disabled={likeLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          blog?.likedByMe
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
        } ${likeLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span>👍</span>
        <span>{blog?._count?.likes ?? 0} {blog?.likedByMe ? 'Liked' : 'Like'}</span>
      </button>
      
      <button
        onClick={toggleComments}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
      >
        <span>💬</span>
        <span>{blog?._count?.comments ?? 0} Comments</span>
      </button>
    </div>
  );

  const renderCommentForm = () => (
    <div className="mb-6">
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 resize-none"
        rows={3}
      />
      <button
        onClick={handleAddComment}
        disabled={!newComment.trim() || commentLoading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {commentLoading ? 'Posting...' : 'Post Comment'}
      </button>
    </div>
  );

  const renderCommentsList = () => (
    
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <Avatar size="small" name={comment.author?.name || "Anonymous"} avatar={comment.author?.avatar || "Anonymous"} />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {comment.author?.name || "Anonymous"}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {comments.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );

  const renderCommentsSection = () => (
    <div className="mt-8 border-t pt-6 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Comments ({blog?._count?.comments ?? 0})
      </h3>
      {renderCommentForm()}
      {renderCommentsList()}
    </div>
  );

  const renderAuthorSection = () => (
    <div className="col-span-4">
      <div className="text-slate-600 dark:text-slate-300 text-lg">
        Author
      </div>
      <div className="flex w-full">
        <div className="pr-4 flex flex-col justify-center">
          <Avatar size="big" name={blog?.author?.name || "Anonymous"} avatar={blog?.author?.avatar|| "Anonymous"} />
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {blog?.author?.name || "Anonymous"}
          </div>
          <div className="pt-2 text-slate-500 dark:text-slate-400">
            {blog?.author?.bio || "No bio available"}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();
  if (!blog) return renderNotFoundState();

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Appbar />
      <div className="flex justify-center">
        <div className="grid grid-cols-12 px-10 w-full max-w-screen-xl pt-12">
          <div className="col-span-8">
            <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
              {blog.title}
            </div>
            <div className="text-slate-500 dark:text-slate-400 pt-2">
              {blog.publishedAt ? `Posted on ${new Date(blog.publishedAt).toLocaleDateString()}` : ""}
            </div>
            
            {renderInteractionButtons()}

            <div className="pt-4 text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
              {blog.content}
            </div>

            {showComments && renderCommentsSection()}
          </div>
          
          {renderAuthorSection()}
        </div>
      </div>
    </div>
  );
};