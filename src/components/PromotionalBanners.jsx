function PromotionalBanners() {
  return (
    <section className="bg-gray-50 py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-5 md:p-6 min-w-[260px] md:min-w-[300px] text-white shadow-lg transform transition-transform hover:scale-[1.02]">
            <h3 className="text-lg md:text-xl font-bold mb-2">Новогодние акции</h3>
            <p className="text-sm opacity-90">Специальные предложения</p>
          </div>
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-5 md:p-6 min-w-[260px] md:min-w-[300px] text-white shadow-lg transform transition-transform hover:scale-[1.02]">
            <h3 className="text-lg md:text-xl font-bold mb-2">Дарим призы</h3>
            <p className="text-sm opacity-90">Участвуйте в розыгрыше</p>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-5 md:p-6 min-w-[260px] md:min-w-[300px] text-white shadow-lg transform transition-transform hover:scale-[1.02]">
            <h3 className="text-lg md:text-xl font-bold mb-2">Комбо наборы</h3>
            <p className="text-sm opacity-90">Выгодные предложения</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PromotionalBanners;
