function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div id="about">
            <h3 className="text-lg font-bold mb-4">О нас</h3>
            <p className="text-gray-400">Gogo Пицца - сеть пиццерий с доставкой по всему городу. Мы готовим только из свежих ингредиентов.</p>
          </div>
          <div id="contacts">
            <h3 className="text-lg font-bold mb-4">Контакты</h3>
            <p className="text-gray-400 mb-2">Телефон: +7 (999) 123-45-67</p>
            <p className="text-gray-400 mb-2">Email: info@gogopizza.ru</p>
            <p className="text-gray-400">Время работы: 10:00 - 23:00</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Социальные сети</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-500">VK</a>
              <a href="#" className="text-gray-400 hover:text-orange-500">Telegram</a>
              <a href="#" className="text-gray-400 hover:text-orange-500">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

