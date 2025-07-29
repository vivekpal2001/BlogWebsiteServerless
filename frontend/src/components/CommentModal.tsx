import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';


interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    name: string;
    username: string;
  };
  createdAt: string;
}

interface CommentModalProps {
  blogId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: number;
}

const CommentModal: React.FC<CommentModalProps> = ({ blogId, isOpen, onClose, currentUserId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/v1/blog/comment/${blogId}?page=1&limit=20`, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => {
        setComments(data.comments || []);
        setLoading(false);
      });
  }, [blogId, isOpen]);

  const handleAddComment = async () => {
    setIsPosting(true);
    if (!newComment.trim()) return;
    await fetch('/api/v1/blog/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ blogId, content: newComment }),
    });
    setNewComment('');
    // Refresh comments
    fetch(`/api/v1/blog/comment/${blogId}?page=1&limit=20`, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  };

  const handleEditComment = async (commentId: number) => {
    if (!editingContent.trim()) return;
    await fetch('/api/v1/blog/comment', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ commentId, content: editingContent }),
    });
    setEditingId(null);
    setEditingContent('');
    fetch(`/api/v1/blog/comment/${blogId}?page=1&limit=20`, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch('/api/v1/blog/comment', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ commentId }),
    });
    fetch(`/api/v1/blog/comment/${blogId}?page=1&limit=20`, {
      headers: { Authorization: `${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting) return;

    // setIsPosting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // setIsPosting(false);
        return;
      }

      await axios.post(
        `${BACKEND_URL}/api/v1/blog/comment`,
        { blogId: String(blogId), content: newComment },
        { headers: { Authorization: token } }
      );

      setNewComment('');
      
      // Refresh comments instead of reloading page
      const response = await fetch(`/api/v1/blog/comment/${blogId}?page=1&limit=20`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      setComments(data.comments || []);
      
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsPosting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
            {comments.length === 0 ? (
              <div className="text-gray-500">No comments yet.</div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="border-b pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">{comment.author.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {comment.author.id === currentUserId && (
                      <div className="flex space-x-2">
                        <button className="text-xs text-blue-600" onClick={() => { setEditingId(comment.id); setEditingContent(comment.content); }}>Edit</button>
                        <button className="text-xs text-red-600" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        className="flex-1 border rounded px-2 py-1 text-sm"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                      />
                      <button className="text-xs text-green-600" onClick={() => handleEditComment(comment.id)}>Save</button>
                      <button className="text-xs text-gray-500" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <div className="text-gray-700 dark:text-gray-200 mt-1 text-sm whitespace-pre-line">{comment.content}</div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        <div className="flex items-center space-x-2 mt-2">
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e); }}
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            onClick={handleAddComment}
            disabled={isPosting}
          >
            {isPosting ? 'Post' : 'Posting...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;