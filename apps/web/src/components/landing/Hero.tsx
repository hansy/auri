import React from 'react';

const Hero: React.FC = () => {
    return (
        <div className="flex flex-col items-center space-y-2 max-w-4xl">
            <h2 className="text-5xl font-semibold leading-[1.05] text-stone-900 serif tracking-tight">
                Achieve fluency by listening
            </h2>
            <p className="text-xl text-stone-500 leading-relaxed max-w-3xl">
                To speak a language, you must first understand what is being said. auri helps train your ear by sending you daily listening exercises.
            </p>
        </div>
    );
};

export default Hero;
