import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LandingAppbar } from "../components/LandingAppbar";

export const Landing = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <LandingAppbar />
            
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <div className="text-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl md:text-6xl"
                    >
                        <span className="block">Share your developer insights with</span>
                        <span className="block text-green-600 dark:text-green-500">the tech community</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
                    >
                        Join DevScribble to share your unique approaches to problem-solving, tech updates, and coding insights. Connect with fellow developers and grow your technical expertise.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
                    >
                        <div className="rounded-md shadow">
                            <Link to="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10">
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Animated Features Section */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="mt-32"
                >
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                title: "Share Tech Insights",
                                description: "Document your coding journey, share solutions, and help others learn from your experiences.",
                                icon: "💻"
                            },
                            {
                                title: "Connect & Collaborate",
                                description: "Join a community of developers. Share knowledge, get feedback, and grow together.",
                                icon: "🤝"
                            },
                            {
                                title: "Stay Updated",
                                description: "Keep up with the latest tech trends and best practices from the developer community.",
                                icon: "📈"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 + index * 0.2 }}
                                className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{feature.title}</h3>
                                <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}; 