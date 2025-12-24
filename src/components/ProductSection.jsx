function ProductSection({ id, title, items, bgColor = 'bg-gray-50', addToCart }) {
  return (
    <section id={id} className={`scroll-mt-36 md:scroll-mt-44 py-8 ${bgColor}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group hover:-translate-y-1">
              <div className="w-full aspect-[4/3] mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-3 flex-grow">{item.description}</p>
                <div className="mt-auto flex items-center justify-between gap-4">
                  <p className="text-orange-500 font-bold text-lg">{item.price}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-1 bg-orange-100 text-orange-600 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-all font-medium active:scale-95"
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

export default ProductSection;
