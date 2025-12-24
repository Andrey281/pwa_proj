import { useState, useEffect } from 'react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Скрыть через 3 сек
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification && isOnline) return null;

  return (
    <div 
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 flex items-center gap-3 font-medium ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-800 text-white'
      }`}
    >
      <span className="text-xl">{isOnline ? '🌐' : '📡'}</span>
      <span>
        {isOnline ? 'Соединение восстановлено' : 'Вы офлайн. Работает PWA режим'}
      </span>
    </div>
  );
}

export default OfflineIndicator;

