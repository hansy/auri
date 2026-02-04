import React from 'react';
import { Language, CEFR, UserProfile } from '@dictation/shared/types';
import Hero from './landing/Hero';
import CTABox from './landing/CTABox';
import Methodology from './landing/Methodology';
import BottomCTA from './landing/BottomCTA';

interface LandingProps {
    onStart: (lang?: Language, level?: CEFR) => void;
    user: UserProfile | null;
}

const Landing: React.FC<LandingProps> = ({ onStart, user }) => {
    return (
        <div className="space-y-32 animate-in fade-in duration-1000">
            <div className="flex flex-col items-center text-center gap-16 min-h-[70vh] py-20">
                <Hero />
                <CTABox onStart={onStart} user={user} />
            </div>

            <Methodology />

            <BottomCTA onStart={() => onStart()} />
        </div>
    );
};

export default Landing;
