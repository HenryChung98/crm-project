export default function Home() {
  return (
    <div className="">
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Start Simply
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Grow Faster
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-90">
            Transform customer relationships and accelerate business growth with us
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
              Start for free
            </button>

            <button className="group flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
              View demo
            </button>
          </div>

          <div className="mt-16 text-sm opacity-75">
            <p>Credit card is not required • Cancellation available at any time</p>
          </div>
          <button className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center gap-2">
            Sales consulting service
          </button>
        </div>
      </section>
    </div>
  );
}
