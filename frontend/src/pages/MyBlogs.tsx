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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Appbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <Spinner />
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Appbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Blogs</h3>
                        <p className="text-red-700 dark:text-red-100">{error instanceof Error ? error.message : "Failed to load blogs"}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Appbar />
            <div className="max-w-4xl mx-auto px-4 py-8">

                {!blogs || blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
                        <h2 className="text-2xl font-semibold">No blogs yet</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Start writing your first blog!</p>
                        <button
                            onClick={() => navigate("/publish")}
                            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Create Blog
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                      {blogs.map((blog: Blog) => (
                        <div key={blog.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                          {editingBlog?.id === blog.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                placeholder="Blog title"
                                disabled={updateBlog.isPending}
                              />
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-blue-500 min-h-[200px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                                  disabled={updateBlog.isPending}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleUpdate}
                                  disabled={updateBlog.isPending || !editTitle.trim() || !editContent.trim()}
                                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
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
                              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{blog.title}</h2>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">{blog.content}</p>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(blog)}
                                    className="px-3 py-1 text-black dark:text-gray-200 hover:text-black dark:hover:text-gray-400 transition-colors"
                                    disabled={deleteBlog.isPending}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(blog.id)}
                                    className="px-3 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600 transition-colors"
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