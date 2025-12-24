import pizzaImg from '../assets/pizzas/0198bf24170179679a7872f2ddf16d18.avif';
import comboImg from '../assets/pizzas/0198bf283b2372ea8e7cfc8adae9ea84.avif';
import sauceImg from '../assets/deserts/01980cbe28fa720b979f0ff09e0ca9bf.avif';

function FrequentlyOrdered({ addToCart }) {
  const items = [
    {
      image: pizzaImg,
      title: 'Пепперони фреш',
      description: 'Пикантная пепперони, увеличенная порция моцареллы, томатный соус',
      price: 'от 259 ₽',
      numericPrice: 259,
      oldPrice: null
    },
    {
      image: comboImg,
      title: '3 пиццы 30 см',
      description: 'Набор из трех популярных пицц',
      price: '1299 ₽',
      numericPrice: 1299,
      oldPrice: '1657 ₽'
    },
    {
      image: sauceImg,
      title: 'Десерт дня',
      description: 'Сладкий сюрприз от шеф-повара',
      price: '175 ₽',
      numericPrice: 175,
      oldPrice: '198 ₽'
    }
  ];

  const handleAdd = (item) => {
    // Map internal structure to expected cart structure
    addToCart({
      name: item.title,
      image: item.image,
      price: item.price,
      numericPrice: item.numericPrice,
      description: item.description
    });
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Часто заказывают</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
              <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 shadow-sm relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col flex-grow text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-orange-500 font-bold mb-4 flex items-center justify-center gap-2">
                  {item.price} {item.oldPrice && <span className="text-gray-400 line-through text-sm font-normal">{item.oldPrice}</span>}
                </p>
                <div className="mt-auto w-full">
                  <button 
                    onClick={() => handleAdd(item)}
                    className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-all active:scale-95 font-medium shadow-orange-200 hover:shadow-lg"
                  >
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FrequentlyOrdered;
