function Header({ totalPrice = 0, onCartClick, cartCount = 0 }) {
  return (
    <>
      {/* Top Navigation - Hidden on mobile */}
      <nav className="hidden md:block bg-black text-white text-sm py-2">
        <div className="container mx-auto px-4 flex justify-center space-x-6">
          <a href="#about" className="hover:text-orange-400 transition-colors">О нас</a>
          <a href="#contacts" className="hover:text-orange-400 transition-colors">Контакты</a>
        </div>
      </nav>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0 hover:scale-105 transition-transform">
                G
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">GOGO ПИЦЦА</h1>
                <p className="text-[10px] md:text-xs text-gray-600 hidden md:block">Сеть пиццерий</p>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Delivery Info - Hidden on mobile */}
              <div className="hidden lg:block text-right">
                <p className="text-sm font-semibold text-gray-900">Доставка пиццы</p>
                <p className="text-xs text-gray-600">38 мин • 4.89 ⭐</p>
              </div>

              {/* Cart Button */}
              <button 
                onClick={onCartClick}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-all active:scale-95 flex items-center space-x-2 text-sm md:text-base shadow-md hover:shadow-lg"
              >
                <span>Корзина</span>
                <span className="hidden md:inline border-l border-white/30 pl-2 ml-2">{totalPrice} ₽</span>
                {cartCount > 0 && (
                  <span className="md:hidden bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Categories - Scrollable on mobile */}
      <nav className="bg-white border-b border-gray-200 sticky top-[64px] md:top-[88px] z-40 shadow-sm backdrop-blur-md bg-opacity-90">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 md:space-x-8 overflow-x-auto py-3 no-scrollbar scroll-smooth">
            <a href="#pizza" className="text-gray-700 hover:text-orange-500 font-medium whitespace-nowrap text-sm md:text-base px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">Пиццы</a>
            <a href="#coffee" className="text-gray-700 hover:text-orange-500 font-medium whitespace-nowrap text-sm md:text-base px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">Кофе</a>
            <a href="#cocktails" className="text-gray-700 hover:text-orange-500 font-medium whitespace-nowrap text-sm md:text-base px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">Коктейли</a>
            <a href="#desserts" className="text-gray-700 hover:text-orange-500 font-medium whitespace-nowrap text-sm md:text-base px-2 py-1 rounded-md hover:bg-orange-50 transition-colors">Десерты</a>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
