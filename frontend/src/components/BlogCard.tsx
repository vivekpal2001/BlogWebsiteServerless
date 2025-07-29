import { Link } from "react-router-dom";

interface BlogCardProps {
    id: string;
    authorName: string;
    authorAvatar?: string;
    title: string;
    content: string;
    publishedDate: string;
    image?: string;
    likesCount?: number;
    commentsCount?: number;
    likedByMe?: boolean;
    onLike?: () => void;
    onComment?: () => void;
    likeLoading?: string | null;
}

export const BlogCard = ({
    id,
    authorName,
    authorAvatar,
    title,
    content,
    publishedDate,
    image,
    likesCount = 0,
    commentsCount = 0,
    likedByMe = false,
    onLike,
    onComment,
    likeLoading
}: BlogCardProps) => {
    // Calculate reading time (assuming average reading speed of 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row">
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-black dark:bg-gray-600 flex items-center justify-center text-white font-medium shadow-sm overflow-hidden">
                            {authorAvatar ? (
                                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                            ) : (
                                authorName[0].toUpperCase()
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{authorName}</p>
                            <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{publishedDate}</p>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{readingTime} min read</p>
                            </div>
                        </div>
                    </div>
                    <Link to={`/blog/${id}`} className="block group">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            {title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                            {content}
                        </p>
                    </Link>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                    <button
                        onClick={onLike}
                        disabled={likeLoading === id}
                        className={`flex items-center space-x-1 text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${likedByMe ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'} ${likeLoading === id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        aria-label="Like"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={likedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={likedByMe ? 'currentColor' : 'none'} />
                        </svg>
                        <span>{likesCount}</span>
                    </button>
                    <button
                        onClick={onComment}
                        className="flex items-center space-x-1 text-sm px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                        aria-label="Comment"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2h2m5-4h-4m0 0V4m0 2v2" />
                        </svg>
                        <span>{commentsCount}</span>
                    </button>
                </div>
            </div>
            {image && (
                <div className="md:w-48 w-full h-40 md:h-auto flex-shrink-0">
                    <img src={image} alt={title} className="object-cover w-full h-full rounded-b-xl md:rounded-b-none md:rounded-r-xl" />
                </div>
            )}
        </div>
    );
};

export function Circle() {
    return <div className="h-1 w-1 rounded-full bg-slate-500">

    </div>
}

export function Avatar({name, avatar, size = "small" }: { name: string,avatar:string, size?: "small" | "big" }) {
    return (
        <div className={`relative inline-flex items-center justify-center overflow-hidden bg-black dark:bg-gray-600 rounded-full ${size === "small" ? "w-6 h-6" : "w-10 h-10"}`}>
            <span className={`${size === "small" ? "text-xs" : "text-md"} font-medium text-white dark:text-gray-100`}>
            {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="font-medium text-white dark:text-gray-100">
          {name[0]?.toUpperCase()}
        </span>
      )}
            </span>
        </div>
    );
}