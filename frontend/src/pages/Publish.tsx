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

    return <div>
        <Appbar />
        <div className="flex justify-center w-full pt-8"> 
            <div className="max-w-screen-lg w-full">
                <input 
                    onChange={(e) => setTitle(e.target.value)}
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
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
                    className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="w-full mb-4">
            <div className="flex items-center justify-between border">
                <div className="my-2 bg-white rounded-b-lg w-full">
                    <label className="sr-only">Publish post</label>
                    <textarea 
                        onChange={onChange} 
                        id="editor" 
                        rows={8} 
                        className="focus:outline-none block w-full px-0 text-sm text-gray-800 bg-white border-0 pl-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                        placeholder="Write an article..." 
                        required 
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    </div>
}