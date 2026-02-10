import React from 'react';
import Hero from './landing/Hero';
import CTABox from './landing/CTABox';
import Methodology from './landing/Methodology';
import BottomCTA from './landing/BottomCTA';

const Landing: React.FC = () => {
    return (
        <div className="space-y-32 animate-in fade-in duration-1000">
            <div className="flex flex-col items-center text-center gap-16 min-h-[70vh] py-20">
                <Hero />
                <CTABox />
            </div>

            <Methodology />

            <BottomCTA />
        </div>
    );
};

export default Landing;
