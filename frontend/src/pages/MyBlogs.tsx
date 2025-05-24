"use client"

import { useMyBlogs, useDeleteBlog, useUpdateBlog } from "../hooks/useQueries"
import { Appbar } from "../components/Appbar"
import { Spinner } from "../components/Spinner"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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

export const MyBlogs = () => {
    const navigate = useNavigate()
    const { data: blogs, isLoading, error, isError } = useMyBlogs()
    const deleteBlog = useDeleteBlog()
    const updateBlog = useUpdateBlog()
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this blog?")) {
            try {
                await deleteBlog.mutateAsync(id)
            } catch (error) {
                console.error("Error deleting blog:", error)
            }
        }
    }

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog)
        setEditTitle(blog.title)
        setEditContent(blog.content)
    }

    const handleUpdate = async () => {
        if (!editingBlog) return

        try {
            await updateBlog.mutateAsync({
                id: editingBlog.id,
                data: {
                    title: editTitle.trim(),
                    content: editContent.trim(),
                },
            })
            setEditingBlog(null)
            setEditTitle("")
            setEditContent("")
        } catch (error) {
            console.error("Error updating blog:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Appbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <Spinner />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Appbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Blogs</h3>
                        <p className="text-red-700">{error instanceof Error ? error.message : "Failed to load blogs"}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar />
            <div className="max-w-4xl mx-auto px-4 py-8">

                {!blogs || blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-900">No blogs yet</h2>
                        <p className="mt-2 text-gray-600">Start writing your first blog!</p>
                        <button
                            onClick={() => navigate("/publish")}
                            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors"
                        >
                            Create Blog
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                      {blogs.map((blog: Blog) => (
                        <div key={blog.id} className="bg-white rounded-lg shadow-md p-6">
                          {editingBlog?.id === blog.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Blog title"
                                disabled={updateBlog.isPending}
                              />
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black min-h-[200px]"
                                placeholder="Blog content"
                                disabled={updateBlog.isPending}
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingBlog(null)
                                    setEditTitle("")
                                    setEditContent("")
                                  }}
                                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                  disabled={updateBlog.isPending}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdate}
                                  disabled={updateBlog.isPending || !editTitle.trim() || !editContent.trim()}
                                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                  {updateBlog.isPending ? (
                                    <>
                                      <Spinner size="sm" />
                                      <span>Saving...</span>
                                    </>
                                  ) : (
                                    <span>Save</span>
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h2>
                              <p className="text-gray-600 mb-4">{blog.content}</p>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(blog)}
                                    className="px-3 py-1 text-black hover:text-black transition-colors"
                                    disabled={deleteBlog.isPending}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors"
                                    disabled={deleteBlog.isPending}
                                  >
                                    {deleteBlog.isPending ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
            </div>
        </div>
    )
} 