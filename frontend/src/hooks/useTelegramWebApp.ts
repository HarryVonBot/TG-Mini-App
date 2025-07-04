import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

// Telegram WebApp Hook for VonVault
export const useTelegramWebApp = () => {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    // Check if running in Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setIsTelegram(true);

      // Initialize WebApp
      tg.ready();
      tg.expand();
      
      // Set VonVault theme colors
      tg.setHeaderColor('#000000'); // Black header to match VonVault
      tg.setBackgroundColor('#000000');
      
      // Enable closing confirmation
      tg.enableClosingConfirmation();

      // Get user data
      if (tg.initDataUnsafe?.user) {
        setUser({
          id: tg.initDataUnsafe.user.id,
          first_name: tg.initDataUnsafe.user.first_name,
          last_name: tg.initDataUnsafe.user.last_name,
          username: tg.initDataUnsafe.user.username,
          language_code: tg.initDataUnsafe.user.language_code,
          photo_url: tg.initDataUnsafe.user.photo_url,
        });
      }
    }
  }, []);

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp && 'MainButton' in webApp) {
      (webApp as any).MainButton.setText(text);
      (webApp as any).MainButton.onClick(onClick);
      (webApp as any).MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp && 'MainButton' in webApp) {
      (webApp as any).MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (webApp && 'BackButton' in webApp) {
      (webApp as any).BackButton.onClick(onClick);
      (webApp as any).BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (webApp && 'BackButton' in webApp) {
      (webApp as any).BackButton.hide();
    }
  };

  const sendData = (data: any) => {
    if (webApp) {
      (webApp as any).sendData(JSON.stringify(data));
    }
  };

  const close = () => {
    if (webApp) {
      (webApp as any).close();
    }
  };

  const hapticFeedback = (type = 'impact', style = 'medium') => {
    if (webApp && 'HapticFeedback' in webApp) {
      if (type === 'impact') {
        (webApp as any).HapticFeedback.impactOccurred(style);
      } else if (type === 'notification') {
        (webApp as any).HapticFeedback.notificationOccurred(style);
      } else if (type === 'selection') {
        (webApp as any).HapticFeedback.selectionChanged();
      }
    }
  };

  return {
    webApp,
    user,
    isTelegram,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    sendData,
    close,
    hapticFeedback,
  };
};