import { useState, useEffect } from 'react';
import './PwaInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // 1. Check if already standalone (don't show)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
        if (isStandalone) return;

        // 2. Check Session Storage (don't show if dismissed this session)
        if (sessionStorage.getItem('pwa_prompt_dismissed')) return;

        // 3. Detect Platform
        // Basic IOS check
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // 4. Listen for prompt event (Android/Desktop)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt immediately on Android if event fires
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // 5. If iOS, show after delay since there is no event
        if (ios) {
            const timer = setTimeout(() => setShowPrompt(true), 3000); // 3s delay
            return () => {
                clearTimeout(timer);
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="pwa-prompt-overlay active">
            <div className="pwa-prompt-content">
                <div className="pwa-header">
                    <div>
                        <h3 className="pwa-title">Installer l'application</h3>
                        <p className="pwa-text">Profitez d'une expérience en plein écran pour profiter de Feello</p>
                    </div>
                    <button className="pwa-close-btn" onClick={handleDismiss}>✕</button>
                </div>

                {isIOS ? (
                    <div className="ios-instructions">
                        <div className="ios-step">
                            <span>1. Appuyez sur</span>
                            <span className="ios-icon">
                                {/* Share Icon SVG */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
                            </span>
                            <span>Partager</span>
                        </div>
                        <div className="ios-step">
                            <span>2. Sélectionnez</span>
                            <span className="ios-icon">
                                {/* Plus Square Icon */}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </span>
                            <span>Sur l'écran d'accueil</span>
                        </div>
                    </div>
                ) : (
                    <button className="pwa-action-btn" onClick={handleInstallClick}>
                        Installer Feello
                    </button>
                )}
            </div>
        </div>
    );
};
