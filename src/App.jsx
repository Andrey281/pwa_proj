import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PromotionalBanners from './components/PromotionalBanners';
import FrequentlyOrdered from './components/FrequentlyOrdered';
import ProductSection from './components/ProductSection';
import Footer from './components/Footer';
import InstallPrompt from './components/InstallPrompt';
import CartDrawer from './components/CartDrawer';
import OfflineIndicator from './components/OfflineIndicator';
import OrderStatus from './components/OrderStatus';

// Import images
import pizza1 from './assets/pizzas/0198bf24170179679a7872f2ddf16d18.avif';
import pizza2 from './assets/pizzas/0198bf283b2372ea8e7cfc8adae9ea84.avif';
import pizza3 from './assets/pizzas/0198bf3e424371b49f0b8d7dbe320a70.avif';
import pizza4 from './assets/pizzas/0198bf40eb1171aabe90b1b3ce07c0c5.avif';

import coffee1 from './assets/cofes/01982280dc9a778c941ba53768d94882.avif';
import coffee2 from './assets/cofes/019840b6488170018dd640026aea9961.avif';
import coffee3 from './assets/cofes/01989addcc7274898f72b92f5edbb1e9.avif';
import coffee4 from './assets/cofes/01995c220923729cb82e709a3ced2f64.avif';

import cocktail1 from './assets/cocktails/019880d9a81873129e7300a65203f39b.avif';
import cocktail2 from './assets/cocktails/0199864cde067657875cc624002e2500.avif';
import cocktail3 from './assets/cocktails/0199ae7176e279399630a1442abc93a7.avif';
import cocktail4 from './assets/cocktails/0199864cde067657875cc624002e2500.avif';

import dessert1 from './assets/deserts/01980cbe28fa720b979f0ff09e0ca9bf.avif';
import dessert2 from './assets/deserts/01980cbf3a9174a2954c1e6e5f5baa68.avif';
import dessert3 from './assets/deserts/01980d4299eb70c2ac5b0203c228851f.avif';
import dessert4 from './assets/deserts/019888711809770cbe00dbdf9ced5022.avif';


function App() {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Регистрация Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Регистрируем сразу, не ждем load
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          console.log('✅ Service Worker зарегистрирован:', registration.scope);
          console.log('Service Worker состояние:', registration.active ? 'active' : 'installing');
          
          // Проверяем обновления
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('Service Worker состояние изменилось:', newWorker.state);
              });
            }
          });
        } catch (error) {
          console.error('❌ Ошибка регистрации Service Worker:', error);
          console.error('Детали ошибки:', error.message, error.stack);
        }
      };

      // Если страница уже загружена, регистрируем сразу
      if (document.readyState === 'complete') {
        registerSW();
      } else {
        // Иначе ждем загрузки
        window.addEventListener('load', registerSW);
      }
    } else {
      console.warn('⚠️ Service Worker не поддерживается в этом браузере');
    }
  }, []);

  // Восстановление состояния при загрузке (офлайн поддержка)
  useEffect(() => {
    // Восстанавливаем путь (hash)
    const savedPath = localStorage.getItem('currentPath');
    if (savedPath && savedPath !== window.location.hash) {
      window.location.hash = savedPath;
      // Прокручиваем к секции после небольшой задержки
      setTimeout(() => {
        const element = document.querySelector(savedPath);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }

    // Восстанавливаем корзину
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      } catch (error) {
        console.error('Ошибка восстановления корзины:', error);
        localStorage.removeItem('cartItems');
      }
    }

    // Восстанавливаем заказ
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        // Проверяем, не завершен ли уже заказ
        if (parsed.stage !== 'COMPLETED') {
          setCurrentOrder(parsed);
        } else {
          localStorage.removeItem('currentOrder');
        }
      } catch (error) {
        console.error('Ошибка восстановления заказа:', error);
        localStorage.removeItem('currentOrder');
      }
    }
  }, []);

  // Сохранение пути при изменении hash
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash || '#';
      localStorage.setItem('currentPath', currentHash);
    };

    // Сохраняем текущий hash при загрузке
    handleHashChange();

    // Слушаем изменения hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Сохранение корзины в localStorage при изменении
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cartItems');
    }
  }, [cartItems]);

  // Cart logic
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => 
          item.name === product.name 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, id: Date.now(), quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.numericPrice * item.quantity), 0);
  }, [cartItems]);

  // Оформление заказа
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const orderId = Math.floor(Math.random() * 1000000);
    const newOrder = {
      orderId: orderId,
      totalPrice: totalPrice,
      stage: 'ACCEPTED',
      startTime: Date.now(),
      timeRemaining: 10,
      items: cartItems
    };

    setCurrentOrder(newOrder);
    setIsCartOpen(false);
    setCartItems([]); // Очищаем корзину после оформления
    localStorage.removeItem('cartItems'); // Удаляем корзину из localStorage

    // Сохраняем в localStorage для офлайн работы
    localStorage.setItem('currentOrder', JSON.stringify(newOrder));
  };

  // Завершение заказа
  const handleOrderComplete = () => {
    setCurrentOrder(null);
    localStorage.removeItem('currentOrder');
  };

  const pizzaItems = [
    {
      image: pizza1,
      name: 'Маргарита',
      description: 'Томаты, моцарелла, базилик',
      price: 'от 299 ₽',
      numericPrice: 299,
      bgColor: 'bg-orange-100'
    },
    {
      image: pizza2,
      name: 'Четыре сыра',
      description: 'Моцарелла, горгонзола, пармезан, чеддер',
      price: 'от 349 ₽',
      numericPrice: 349,
      bgColor: 'bg-orange-100'
    },
    {
      image: pizza3,
      name: 'Гавайская',
      description: 'Курица, ананасы, моцарелла',
      price: 'от 379 ₽',
      numericPrice: 379,
      bgColor: 'bg-orange-100'
    },
    {
      image: pizza4,
      name: 'Барбекю',
      description: 'Курица, бекон, соус барбекю',
      price: 'от 399 ₽',
      numericPrice: 399,
      bgColor: 'bg-orange-100'
    }
  ];

  const coffeeItems = [
    {
      image: coffee1,
      name: 'Эспрессо',
      description: 'Классический эспрессо',
      price: 'от 99 ₽',
      numericPrice: 99,
      bgColor: 'bg-amber-100'
    },
    {
      image: coffee2,
      name: 'Капучино',
      description: 'Эспрессо с молочной пеной',
      price: 'от 149 ₽',
      numericPrice: 149,
      bgColor: 'bg-amber-100'
    },
    {
      image: coffee3,
      name: 'Латте',
      description: 'Эспрессо с молоком',
      price: 'от 159 ₽',
      numericPrice: 159,
      bgColor: 'bg-amber-100'
    },
    {
      image: coffee4,
      name: 'Американо',
      description: 'Эспрессо с водой',
      price: 'от 119 ₽',
      numericPrice: 119,
      bgColor: 'bg-amber-100'
    }
  ];

  const cocktailItems = [
    {
      image: cocktail1,
      name: 'Мохито',
      description: 'Мята, лайм, содовая',
      price: 'от 199 ₽',
      numericPrice: 199,
      bgColor: 'bg-pink-100'
    },
    {
      image: cocktail2,
      name: 'Пина Колада',
      description: 'Ананас, кокос, ром',
      price: 'от 249 ₽',
      numericPrice: 249,
      bgColor: 'bg-pink-100'
    },
    {
      image: cocktail3,
      name: 'Маргарита',
      description: 'Текила, лайм, соль',
      price: 'от 279 ₽',
      numericPrice: 279,
      bgColor: 'bg-pink-100'
    },
    {
      image: cocktail4,
      name: 'Космополитен',
      description: 'Водка, клюква, лайм',
      price: 'от 299 ₽',
      numericPrice: 299,
      bgColor: 'bg-pink-100'
    }
  ];

  const dessertItems = [
    {
      image: dessert1,
      name: 'Чизкейк',
      description: 'Классический чизкейк',
      price: 'от 199 ₽',
      numericPrice: 199,
      bgColor: 'bg-yellow-100'
    },
    {
      image: dessert2,
      name: 'Тирамису',
      description: 'Итальянский десерт',
      price: 'от 229 ₽',
      numericPrice: 229,
      bgColor: 'bg-yellow-100'
    },
    {
      image: dessert3,
      name: 'Брауни',
      description: 'Шоколадный брауни',
      price: 'от 179 ₽',
      numericPrice: 179,
      bgColor: 'bg-yellow-100'
    },
    {
      image: dessert4,
      name: 'Мороженое',
      description: 'Ванильное мороженое',
      price: 'от 149 ₽',
      numericPrice: 149,
      bgColor: 'bg-yellow-100'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header 
        totalPrice={totalPrice} 
        onCartClick={() => setIsCartOpen(true)} 
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />
      <PromotionalBanners />
      <FrequentlyOrdered addToCart={addToCart} />
      <ProductSection id="pizza" title="Пиццы" items={pizzaItems} bgColor="bg-gray-50" addToCart={addToCart} />
      <ProductSection id="coffee" title="Кофе" items={coffeeItems} addToCart={addToCart} />
      <ProductSection id="cocktails" title="Коктейли" items={cocktailItems} bgColor="bg-gray-50" addToCart={addToCart} />
      <ProductSection id="desserts" title="Десерты" items={dessertItems} addToCart={addToCart} />
      <Footer />
      
      {/* Install Prompt */}
      <InstallPrompt />
      
      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        totalPrice={totalPrice}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Order Status */}
      {currentOrder && (
        <OrderStatus 
          order={currentOrder}
          onComplete={handleOrderComplete}
        />
      )}
    </div>
  );
}

export default App;
