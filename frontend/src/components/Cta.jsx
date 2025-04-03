const CTASection = () => {
    return (
      <section className="bg-gradient-to-r from-[#1E3A8A] to-[#0D9488] text-white py-16 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold">Ready to Transform Your Savings?</h2>
          <p className="text-gray-300 mt-4 text-lg">
            Join ChamaPay today and experience secure, seamless, and smart financial management.
          </p>
  
          {/* Decorative HR */}
          <div className="flex justify-center my-6">
            <div className="w-16 h-1 bg-[#FACC15] rounded-lg"></div>
          </div>
  
          <button className="bg-[#FACC15] text-[#1E3A8A] font-semibold px-6 py-3 rounded-lg mt-6 shadow-md hover:bg-yellow-400 transition">
            Get Started Now
          </button>
        </div>
      </section>
    );
  };
  
  export default CTASection;
  