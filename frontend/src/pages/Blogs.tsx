"use client"

import { useBlogs } from "../hooks/useQueries"
import { Appbar } from "../components/Appbar"
import { BlogCard } from "../components/BlogCard"
import { Spinner } from "../components/Spinner"
import { useEffect, useRef, useCallback, useState } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"

interface Blog {
  id: string
  title: string
  content: string
  author: {
    name: string
  }
  createdAt: string
}

export const Blogs = () => {
  const [newBlogs, setNewBlogs] = useState<Blog[]>([])
  const [isCheckingNewBlogs, setIsCheckingNewBlogs] = useState(false)

  const { data, isLoading, error, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useBlogs()

  // Function to directly fetch the latest blogs from the API
  const fetchLatestBlogs = useCallback(async () => {
    if (isCheckingNewBlogs) return

    setIsCheckingNewBlogs(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get(`${BACKEND_URL}/api/v1/blog`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          limit: 10,
          offset: 0,
        },
      })

      const latestBlogs = response.data
      const currentBlogs = data?.pages[0] || []

      const trulyNewBlogs = latestBlogs.filter(
        (newBlog: Blog) => !currentBlogs.some((existingBlog: Blog) => existingBlog.id === newBlog.id),
      )

      if (trulyNewBlogs.length > 0) {
        setNewBlogs((prev) => {
          const combinedBlogs = [...prev]

          trulyNewBlogs.forEach((blog: Blog) => {
            if (!combinedBlogs.some((b) => b.id === blog.id)) {
              combinedBlogs.push(blog)
            }
          })

          return combinedBlogs
        })
      }
    } catch (err) {
      console.error("Error fetching latest blogs:", err)
    } finally {
      setIsCheckingNewBlogs(false)
    }
  }, [data, isCheckingNewBlogs])

  useEffect(() => {
    const interval = setInterval(fetchLatestBlogs, 15000)
    return () => clearInterval(interval)
  }, [fetchLatestBlogs])

  const observer = useRef<IntersectionObserver>()
  const lastBlogRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })

      if (node) observer.current.observe(node)
    },
    [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  const cachedBlogs = data?.pages.flat() || []

  const allBlogs = [
    ...newBlogs,
    ...cachedBlogs.filter((cachedBlog: Blog) => !newBlogs.some((newBlog) => newBlog.id === cachedBlog.id)),
  ]

  const handleRefreshAll = () => {
    window.location.reload()
  }

  const handleShowNewBlogs = () => {
    setNewBlogs([])
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
    const errorMessage = error instanceof Error ? error.message : "Failed to load blogs"
    const statusCode = (error as any)?.response?.status
    const errorData = (error as any)?.response?.data

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Appbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Error Loading Blogs</h3>
            <p className="text-red-700 dark:text-red-100">{errorMessage}</p>
            {statusCode && <p className="text-sm text-red-600 dark:text-red-200 mt-1">Status Code: {statusCode}</p>}
            {errorData && <p className="text-sm text-red-600 dark:text-red-200 mt-1">Error Details: {JSON.stringify(errorData)}</p>}
            <button
              onClick={handleRefreshAll}
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
        {newBlogs.length > 0 && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 flex justify-between items-center">
            <p className="text-blue-700 dark:text-blue-200">
              {newBlogs.length} new blog{newBlogs.length > 1 ? "s" : ""} available!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleShowNewBlogs}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Show New Blogs
              </button>
              <button
                onClick={handleRefreshAll}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Refresh All
              </button>
            </div>
          </div>
        )}

        {allBlogs.length > 0 ? (
          <div className="space-y-6">
            {allBlogs.map((blog: Blog, index: number) => (
              <div
                key={blog.id}
                ref={index === allBlogs.length - 1 && index >= newBlogs.length ? lastBlogRef : null}
                className={newBlogs.some((newBlog) => newBlog.id === blog.id) ? "animate-pulse-once" : ""}
              >
                <BlogCard
                  id={blog.id}
                  authorName={blog.author.name}
                  title={blog.title}
                  content={blog.content}
                  publishedDate={new Date(blog.createdAt).toLocaleDateString()}
                />
              </div>
            ))}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">No blogs yet</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Be the first to write a blog!</p>
            <div className="mt-4">
              <button
                onClick={handleRefreshAll}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
