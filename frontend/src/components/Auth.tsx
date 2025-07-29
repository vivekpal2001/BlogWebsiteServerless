

import { type ChangeEvent, useState } from "react"
import { Link, useNavigate} from "react-router-dom"
import type { SignupInput } from "@vkpal2001/medium-blog"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Spinner } from "../components/Spinner"
import { z } from "zod"

// Define validation schemas
const emailSchema = z.string().email("Please enter a valid email address")
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: emailSchema,
    password: passwordSchema
})

const signinSchema = z.object({
    username: emailSchema,
    password: z.string().min(1, "Password is required")
})

type ValidationErrors = {
    name?: string;
    username?: string;
    password?: string;
}

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        username: "",
        password: "",
    })


    const validateField = (field: keyof SignupInput, value: string) => {
        try {
            if (type === "signup") {
                if (field === "name") {
                    signupSchema.shape.name.parse(value)
                } else if (field === "username") {
                    signupSchema.shape.username.parse(value)
                } else if (field === "password") {
                    signupSchema.shape.password.parse(value)
                }
            } else {
                if (field === "username") {
                    signinSchema.shape.username.parse(value)
                } else if (field === "password") {
                    signinSchema.shape.password.parse(value)
                }
            }
            setValidationErrors(prev => ({ ...prev, [field]: undefined }))
            return true
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errorMessage = err.errors[0]?.message
                setValidationErrors(prev => ({ ...prev, [field]: errorMessage }))
            }
            return false
        }
    }

    const validateForm = () => {
        try {
            if (type === "signup") {
                signupSchema.parse(postInputs)
            } else {
                signinSchema.parse(postInputs)
            }
            return true
        } catch (err) {
            if (err instanceof z.ZodError) {
                const errors: ValidationErrors = {}
                err.errors.forEach(error => {
                    const path = error.path[0] as keyof ValidationErrors
                    errors[path] = error.message
                })
                setValidationErrors(errors)
            }
            return false
        }
    }

    async function sendRequest() {
        if (!validateForm()) {
            return
        }

        setLoading(true)
        setError("")
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs,
            )
            const jwt = response.data
            localStorage.setItem("token", jwt)
            navigate('/blogs', { replace: true })
        } catch (e) {
            if (axios.isAxiosError(e)) {
                setError(e.response?.data?.message || "Error during authentication")
            } else {
                setError("An unexpected error occurred")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPostInputs(prev => ({ ...prev, [name]: value }))
        validateField(name as keyof SignupInput, value)
    }

    return (
        <div className="h-screen flex justify-center flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="flex justify-center">
                <div>
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            {type === "signup" ? "Create an account" : "Sign in to your account"}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                            {type === "signup" 
                                ? "Already have an account? " 
                                : "Don't have an account? "}
                            <Link className="pl-2 underline" to={type === "signup" ? "/signin" : "/signup"}>
                                {type === "signup" ? "Sign in" : "Sign up"}
                            </Link>
                        </div>
                    </div>
                    <div className="pt-2">
                        {type === "signup" && (
                            <LabelledInput 
                                label="Name" 
                                placeholder="Vivek Kumar" 
                                name="name"
                                onChange={handleInputChange}
                                error={validationErrors.name}
                            />
                        )}
                        <LabelledInput 
                            label="Username" 
                            placeholder="vivek@example.com" 
                            name="username"
                            onChange={handleInputChange}
                            error={validationErrors.username}
                        />
                        <LabelledInput 
                            label="Password" 
                            type="password" 
                            placeholder="••••••••" 
                            name="password"
                            onChange={handleInputChange}
                            error={validationErrors.password}
                        />
                        {error && (
                            <div className="text-red-500 text-sm mt-2">
                                {error}
                            </div>
                        )}
                        <button 
                            onClick={sendRequest} 
                            type="button" 
                            className="mt-8 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading || Object.keys(validationErrors).some(key => validationErrors[key as keyof ValidationErrors])}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Spinner />
                                    <span className="ml-2">Please wait...</span>
                                </div>
                            ) : (
                                type === "signup" ? "Sign up" : "Sign in"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface LabelledInputProps {
    label: string;
    placeholder: string;
    type?: string;
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

function LabelledInput({ label, placeholder, type = "text", name, onChange, error }: LabelledInputProps) {
    return (
        <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">{label}</label>
            <input
                type={type}
                name={name}
                onChange={onChange}
                className={`bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:focus:ring-blue-600 dark:focus:border-blue-600`}
                placeholder={placeholder}
            />
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}
