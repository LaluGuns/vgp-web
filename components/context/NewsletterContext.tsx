'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface NewsletterContextType {
    isOpen: boolean;
    openPopup: () => void;
    closePopup: () => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

export function NewsletterProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openPopup = () => setIsOpen(true);
    const closePopup = () => setIsOpen(false);

    return (
        <NewsletterContext.Provider value={{ isOpen, openPopup, closePopup }}>
            {children}
        </NewsletterContext.Provider>
    );
}

export function useNewsletter() {
    const context = useContext(NewsletterContext);
    if (context === undefined) {
        throw new Error('useNewsletter must be used within a NewsletterProvider');
    }
    return context;
}
