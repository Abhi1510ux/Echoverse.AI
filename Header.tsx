import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="flex justify-center items-center gap-4 mb-2">
                 <i className="fas fa-headphones-alt text-5xl text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]"></i>
                <h1 className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]">
                    EchoVerse
                </h1>
            </div>
            <p className="text-lg text-gray-300">
                Your AI-Powered Audiobook Creation Tool
            </p>
        </header>
    );
};

export default Header;