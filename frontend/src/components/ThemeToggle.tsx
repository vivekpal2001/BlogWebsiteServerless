import { useTheme } from '../ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'; // Assuming you have or will install heroicons

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`transform transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white`}
      >
        {theme === 'dark' ? (
          <MoonIcon className="h-4 w-4 text-gray-300" />
        ) : (
          <SunIcon className="h-4 w-4 text-gray-200" />
        )}
      </span>
    </button>
  );
}; 