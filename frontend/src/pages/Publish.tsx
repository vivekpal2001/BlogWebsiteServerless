import { Appbar } from "../components/Appbar"
import { useNavigate } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import { useCreateBlog } from "../hooks/useQueries";
import { Spinner } from "../components/Spinner";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();
    const { mutate: createBlog, isPending } = useCreateBlog();

    const handlePublish = () => {
        if (!title.trim() || !description.trim()) {
            alert("Please fill in both title and content");
            return;
        }

        createBlog(
            { title, content: description },
            {
                onSuccess: () => {
                    navigate('/blogs');
                },
                onError: (error) => {
                    console.error('Error creating blog:', error);
                    alert('Failed to create blog. Please try again.');
                }
            }
        );
    };

    return <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Appbar />
        <div className="flex justify-center w-full pt-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-lg w-full">
                <input 
                    onChange={(e) => setTitle(e.target.value)}
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-blue-500 dark:focus:border-blue-600 block w-full p-2.5" 
                    placeholder="Title" 
                    disabled={isPending}
                />

                <TextEditor 
                    onChange={(e) => setDescription(e.target.value)} 
                    disabled={isPending}
                />
                
                <button 
                    onClick={handlePublish}
                    disabled={isPending}
                    type="submit" 
                    className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 dark:bg-blue-600 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? (
                        <>
                            <Spinner />
                            <span className="ml-2">Publishing...</span>
                        </>
                    ) : (
                        "Publish post"
                    )}
                </button>
            </div>
        </div>
    </div>
}

function TextEditor({ 
    onChange, 
    disabled 
}: {
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
}) {
    return <div className="mt-2">
        <div className="w-full mb-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
                {/* Add any toolbar for the editor here */}
            </div>
            <div className="my-2 bg-white dark:bg-gray-700 rounded-b-lg w-full">
                <label className="sr-only">Publish post</label>
                <textarea 
                    onChange={onChange} 
                    id="editor" 
                    rows={8} 
                    className="focus:outline-none block w-full px-0 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border-0 pl-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                    placeholder="Write an article..." 
                    required 
                    disabled={disabled}
                />
            </div>
        </div>
    </div>
}