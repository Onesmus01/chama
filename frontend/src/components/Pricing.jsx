
const Pricing = () => {
    return (
      <section className="bg-gradient-to-r from-[#E0F2FE] to-[#ECFDF5] py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Section Title */}
          <h2 className="text-4xl font-bold text-[#1E3A8A]">Choose Your Plan</h2>
          <p className="text-gray-600 mt-4">
            Flexible and affordable pricing for every group and individual.
          </p>
  
          {/* Decorative Line */}
          <hr className="w-20 mx-auto my-6 border-t-4 border-[#0D9488] rounded-full" />
  
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {/* Basic Plan */}
            <div className="bg-white shadow-lg rounded-lg p-8 border-t-4 border-[#1E3A8A] hover:scale-105 transition-transform">
              <h3 className="text-2xl font-semibold text-[#1E3A8A]">Basic</h3>
              <p className="text-gray-600 mt-2">For small groups</p>
              <h4 className="text-4xl font-bold text-[#0D9488] mt-4">$9<span className="text-lg">/month</span></h4>
              <ul className="mt-4 text-gray-700 space-y-2">
                <li>✅ 5 Members</li>
                <li>✅ Basic Transactions</li>
                <li>✅ Email Support</li>
              </ul>
              <button className="mt-6 bg-[#FACC15] text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400">
                Get Started
              </button>
            </div>
  
            {/* Standard Plan */}
            <div className="bg-white shadow-xl rounded-lg p-8 border-t-4 border-[#0D9488] hover:scale-105 transition-transform">
              <h3 className="text-2xl font-semibold text-[#0D9488]">Standard</h3>
              <p className="text-gray-600 mt-2">For growing chamas</p>
              <h4 className="text-4xl font-bold text-[#1E3A8A] mt-4">$19<span className="text-lg">/month</span></h4>
              <ul className="mt-4 text-gray-700 space-y-2">
                <li>✅ 20 Members</li>
                <li>✅ Priority Support</li>
                <li>✅ Advanced Features</li>
              </ul>
              <button className="mt-6 bg-[#FACC15] text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400">
                Choose Plan
              </button>
            </div>
  
            {/* Premium Plan */}
            <div className="bg-white shadow-lg rounded-lg p-8 border-t-4 border-[#FACC15] hover:scale-105 transition-transform">
              <h3 className="text-2xl font-semibold text-[#FACC15]">Premium</h3>
              <p className="text-gray-600 mt-2">For large chamas</p>
              <h4 className="text-4xl font-bold text-[#0D9488] mt-4">$49<span className="text-lg">/month</span></h4>
              <ul className="mt-4 text-gray-700 space-y-2">
                <li>✅ Unlimited Members</li>
                <li>✅ 24/7 Priority Support</li>
                <li>✅ All Features Unlocked</li>
              </ul>
              <button className="mt-6 bg-[#FACC15] text-black font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400">
                Get Premium
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  export default Pricing;
  