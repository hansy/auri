import React from 'react';
import { UserProfile } from '@dictation/shared/types';

interface HeaderProps {
    user: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    return (
        <header className="mb-12 flex justify-between items-center">
            <h1 className="text-xl font-medium tracking-tight text-stone-800">Daily Dictation</h1>
            {user && (
                <div className="text-sm font-medium text-stone-400">
                    STREAK: {user.streak}d
                </div>
            )}
        </header>
    );
};

export default Header;
