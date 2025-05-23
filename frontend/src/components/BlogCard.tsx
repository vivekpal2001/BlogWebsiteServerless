import { Link } from "react-router-dom";

interface BlogCardProps {
    id: string;
    authorName: string;
    title: string;
    content: string;
    publishedDate: string;
}

export const BlogCard = ({
    id,
    authorName,
    title,
    content,
    publishedDate
}: BlogCardProps) => {
    // Calculate reading time (assuming average reading speed of 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-medium shadow-sm">
                        {authorName[0].toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-gray-900">{authorName}</p>
                        <div className="flex items-center space-x-2">
                            <p className="text-xs text-gray-500">{publishedDate}</p>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">{readingTime} min read</p>
                        </div>
                    </div>
                </div>
                
                <Link to={`/blog/${id}`} className="block group">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors">
                        {title}
                    </h2>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                        {content}
                    </p>
                    <div className="flex items-center text-gray-900 font-medium group-hover:text-gray-700 transition-colors">
                        Read more
                        <svg 
                            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export function Circle() {
    return <div className="h-1 w-1 rounded-full bg-slate-500">

    </div>
}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    return (
        <div className={`relative inline-flex items-center justify-center overflow-hidden bg-black rounded-full ${size === "small" ? "w-6 h-6" : "w-10 h-10"}`}>
            <span className={`${size === "small" ? "text-xs" : "text-md"} font-medium text-white`}>
                {name[0].toUpperCase()}
            </span>
        </div>
    );
}