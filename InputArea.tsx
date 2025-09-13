
import React, { useCallback, useState } from 'react';

interface InputAreaProps {
    onTextChange: (text: string) => void;
    originalText: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onTextChange, originalText }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (file: File) => {
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                onTextChange(text);
            };
            reader.readAsText(file);
        } else {
            alert('Please upload a valid .txt file.');
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    }, [onTextChange]);

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);
    
    const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };

    return (
        <div>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragging ? 'border-purple-400 bg-purple-500/20' : 'border-gray-500 hover:border-purple-400'}`}
            >
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-300">Drag & drop a .txt file here, or</p>
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".txt"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer font-semibold text-purple-400 hover:text-purple-300">
                    Browse files
                </label>
                <p className="text-xs text-gray-500 mt-1">Limit 200MB per file</p>
            </div>

            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <textarea
                value={originalText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-48 p-4 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-y transition-colors duration-300"
            />
        </div>
    );
};

export default InputArea;
