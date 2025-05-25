import { Blog } from "../hooks"
import { Appbar } from "./Appbar"
import { Avatar } from "./BlogCard"

export const FullBlog = ({ blog }: {blog: Blog}) => {
    return <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Appbar />
        <div className="flex justify-center">
            <div className="grid grid-cols-12 px-10 w-full pt-200 max-w-screen-xl pt-12">
                <div className="col-span-8">
                    <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-100">
                        {blog.title}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 pt-2">
                        Post on 2nd December 2023
                    </div>
                    <div className="pt-4 text-gray-800 dark:text-gray-300">
                        {blog.content}
                    </div>
                </div>
                <div className="col-span-4">
                    <div className="text-slate-600 dark:text-slate-300 text-lg">
                        Author
                    </div>
                    <div className="flex w-full">
                        <div className="pr-4 flex flex-col justify-center">
                            <Avatar size="big" name={blog.author.name || "Anonymous"} />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {blog.author.name || "Anonymous"}
                            </div>
                            <div className="pt-2 text-slate-500 dark:text-slate-400">
                                Random catch phrase about the author's ability to grab the user's attention
                            </div>
                        </div>
                    </div>  
                </div>
                
            </div>
        </div>
    </div>
}