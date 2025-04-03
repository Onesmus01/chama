const HowItWorks = () => {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-[#1E3A8A] mb-12">How It Works</h2>
  
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="p-8 bg-[#E0F2F1] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl text-[#0D9488] mb-6">📝</div>
              <h3 className="text-xl font-semibold text-gray-800">1. Sign Up</h3>
              <p className="text-gray-600 mt-2">Create a free account in minutes and set up your Chama.</p>
            </div>
  
            {/* Step 2 */}
            <div className="p-8 bg-[#E0F2F1] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl text-[#0D9488] mb-6">💳</div>
              <h3 className="text-xl font-semibold text-gray-800">2. Save & Invest</h3>
              <p className="text-gray-600 mt-2">Start saving as a group and grow your funds securely.</p>
            </div>
  
            {/* Step 3 */}
            <div className="p-8 bg-[#E0F2F1] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-5xl text-[#0D9488] mb-6">⚡</div>
              <h3 className="text-xl font-semibold text-gray-800">3. Withdraw Anytime</h3>
              <p className="text-gray-600 mt-2">Access your money instantly whenever you need it.</p>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default HowItWorks;
  