import { InputHTMLAttributes, forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, className = "", ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <input
                        ref={ref}
                        className={`w-full h-11 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${error ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"} focus:bg-white dark:focus:bg-[#0c0c0e] rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-medium ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {error}
                    </span>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
