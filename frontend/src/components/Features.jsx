const Features = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-[#E0F2F1] to-[#ffffff]">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12 text-[#1E3A8A]">Why Choose ChamaPay?</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          {/* Secure Payments */}
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-5xl text-[#0D9488] mb-6">🔒</div>
            <h3 className="text-xl font-semibold text-gray-800">Secure Payments</h3>
            <p className="text-gray-600 mt-2">Your transactions are encrypted and protected with top security standards.</p>
          </div>

          {/* Easy Savings */}
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-5xl text-[#0D9488] mb-6">💰</div>
            <h3 className="text-xl font-semibold text-gray-800">Easy Savings</h3>
            <p className="text-gray-600 mt-2">Start saving together with friends or your Chama in just a few clicks.</p>
          </div>

          {/* Instant Transfers */}
          <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-5xl text-[#0D9488] mb-6">⚡</div>
            <h3 className="text-xl font-semibold text-gray-800">Instant Transfers</h3>
            <p className="text-gray-600 mt-2">Send and receive money instantly, anytime, anywhere.</p>
          </div>
        </div>
      </div>
      <hr className="mt-16 border-t-4 border-[#1E3A8A] w-3/4 mx-auto opacity-75" />
    </section>
  );
};

export default Features;
