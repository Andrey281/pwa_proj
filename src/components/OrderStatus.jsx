import { useState, useEffect, useCallback, useRef } from 'react';

const ORDER_STAGES = {
  ACCEPTED: { name: 'Принятие заказа', duration: 10, icon: '📋', color: 'bg-blue-500' },
  PREPARING: { name: 'Готовка', duration: 10, icon: '👨‍🍳', color: 'bg-orange-500' },
  DELIVERING: { name: 'Доставка', duration: 10, icon: '🚗', color: 'bg-green-500' },
  COMPLETED: { name: 'Доставлено', duration: 0, icon: '✅', color: 'bg-green-600' }
};

function OrderStatus({ order, onComplete }) {
  const [currentStage, setCurrentStage] = useState(order?.stage || 'ACCEPTED');
  const [timeRemaining, setTimeRemaining] = useState(order?.timeRemaining || ORDER_STAGES.ACCEPTED.duration);
  const [startTime, setStartTime] = useState(order?.startTime || Date.now());
  const previousStageRef = useRef(currentStage);

  // Функция для отправки уведомления
  const sendNotification = useCallback((stageKey, stageName) => {
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления');
      return;
    }

    // Запрашиваем разрешение, если еще не запрашивали
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          showNotification(stageKey, stageName);
        }
      });
    } else if (Notification.permission === 'granted') {
      showNotification(stageKey, stageName);
    }
  }, []);

  const showNotification = (stageKey, stageName) => {
    const stage = ORDER_STAGES[stageKey];
    let message = '';
    let tag = `order-${order.orderId}-${stageKey}`;

    if (stageKey === 'ACCEPTED') {
      message = `Заказ #${order.orderId} принят! Начинаем готовку...`;
    } else if (stageKey === 'PREPARING') {
      message = `Заказ #${order.orderId} готовится! Скоро будет готов.`;
    } else if (stageKey === 'DELIVERING') {
      message = `Заказ #${order.orderId} в пути! Курьер уже едет к вам.`;
    } else if (stageKey === 'COMPLETED') {
      message = `🎉 Заказ #${order.orderId} доставлен! Приятного аппетита!`;
      tag = `order-${order.orderId}-completed`;
    }

    // Пытаемся использовать Service Worker для уведомлений (PWA способ)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Отправляем сообщение в Service Worker для показа уведомления
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: 'Gogo Пицца',
        options: {
          body: message,
          icon: '/pwa-icon.svg',
          badge: '/pwa-icon.svg',
          tag: tag,
          requireInteraction: stageKey === 'COMPLETED',
          vibrate: [200, 100, 200],
          data: {
            orderId: order.orderId,
            stage: stageKey
          }
        }
      });
    } else {
      // Fallback: используем обычный Notification API (работает только когда вкладка открыта)
      const notification = new Notification('Gogo Пицца', {
        body: message,
        icon: '/pwa-icon.svg',
        badge: '/pwa-icon.svg',
        tag: tag,
        requireInteraction: stageKey === 'COMPLETED',
        vibrate: [200, 100, 200],
        data: {
          orderId: order.orderId,
          stage: stageKey
        }
      });

      // Обработка клика по уведомлению
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const moveToNextStage = useCallback((current, originalStartTime) => {
    const stages = Object.keys(ORDER_STAGES);
    const currentIndex = stages.indexOf(current);
    
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      const newStartTime = Date.now();
      
      setCurrentStage(nextStage);
      setTimeRemaining(ORDER_STAGES[nextStage].duration);
      setStartTime(newStartTime);

      // Отправляем уведомление о завершении текущего этапа и начале следующего
      sendNotification(nextStage, ORDER_STAGES[nextStage].name);

      // Обновляем localStorage
      const orderData = {
        stage: nextStage,
        startTime: newStartTime,
        timeRemaining: ORDER_STAGES[nextStage].duration,
        orderId: order.orderId,
        totalPrice: order.totalPrice
      };
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
    } else {
      // Заказ завершен
      setCurrentStage('COMPLETED');
      sendNotification('COMPLETED', ORDER_STAGES.COMPLETED.name);
      localStorage.removeItem('currentOrder');
      if (onComplete) onComplete();
    }
  }, [order, onComplete, sendNotification]);

  // Отслеживаем изменения этапа для отправки уведомлений
  useEffect(() => {
    // Отправляем уведомление при смене этапа (включая первый этап ACCEPTED)
    if (previousStageRef.current !== currentStage) {
      // Для ACCEPTED отправляем сразу, для остальных - только при смене
      if (currentStage === 'ACCEPTED' || previousStageRef.current) {
        sendNotification(currentStage, ORDER_STAGES[currentStage].name);
      }
    }
    previousStageRef.current = currentStage;
  }, [currentStage, sendNotification]);

  // Запрашиваем разрешение на уведомления при монтировании компонента
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Восстанавливаем состояние из localStorage при загрузке
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
        const stageDuration = ORDER_STAGES[parsed.stage]?.duration || 10;
        const remaining = Math.max(0, stageDuration - elapsed);
        
        if (remaining <= 0 && parsed.stage !== 'COMPLETED') {
          // Этап завершен, переходим к следующему
          moveToNextStage(parsed.stage, parsed.startTime);
        } else {
          setCurrentStage(parsed.stage);
          setTimeRemaining(remaining);
          setStartTime(parsed.startTime);
          previousStageRef.current = parsed.stage;
        }
      } catch (error) {
        console.error('Ошибка восстановления заказа:', error);
      }
    }
  }, [moveToNextStage]);

  useEffect(() => {
    if (currentStage === 'COMPLETED') {
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const stageDuration = ORDER_STAGES[currentStage].duration;
      const remaining = Math.max(0, stageDuration - elapsed);

      setTimeRemaining(remaining);

      // Сохраняем состояние в localStorage для офлайн работы
      const orderData = {
        stage: currentStage,
        startTime: startTime,
        timeRemaining: remaining,
        orderId: order.orderId,
        totalPrice: order.totalPrice
      };
      localStorage.setItem('currentOrder', JSON.stringify(orderData));

      if (remaining <= 0) {
        moveToNextStage(currentStage, startTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStage, startTime, order, moveToNextStage, onComplete]);

  const getStageIndex = (stage) => {
    return Object.keys(ORDER_STAGES).indexOf(stage);
  };

  const getProgress = () => {
    const currentIndex = getStageIndex(currentStage);
    const totalStages = Object.keys(ORDER_STAGES).length - 1; // -1 потому что COMPLETED не считается
    const stageProgress = currentStage !== 'COMPLETED' 
      ? (ORDER_STAGES[currentStage].duration - timeRemaining) / ORDER_STAGES[currentStage].duration
      : 1;
    
    return ((currentIndex + stageProgress) / totalStages) * 100;
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Заказ #{order.orderId}</h2>
          <p className="text-gray-600">Сумма: {order.totalPrice} ₽</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Stages */}
        <div className="space-y-4">
          {Object.entries(ORDER_STAGES).map(([key, stage], index) => {
            const isActive = currentStage === key;
            const isCompleted = getStageIndex(currentStage) > index;
            const showTimer = isActive && key !== 'COMPLETED';

            return (
              <div
                key={key}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? `${stage.color} text-white shadow-lg transform scale-105` 
                    : isCompleted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="text-3xl">{stage.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{stage.name}</div>
                  {showTimer && (
                    <div className="text-sm opacity-90 mt-1">
                      Осталось: {timeRemaining} сек
                    </div>
                  )}
                  {isCompleted && key !== 'COMPLETED' && (
                    <div className="text-sm opacity-90 mt-1">✓ Завершено</div>
                  )}
                </div>
                {isActive && (
                  <div className="animate-spin text-2xl">⏳</div>
                )}
              </div>
            );
          })}
        </div>

        {currentStage === 'COMPLETED' && (
          <button
            onClick={onComplete}
            className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderStatus;
