import { FaShieldAlt, FaPiggyBank, FaMoneyBillWave } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

const LearnMore = () => {
  const navigate = useNavigate()
  return (
    <section className="bg-gradient-to-b from-[#0A2342] to-[#117A7A] min-h-screen text-white">
      {/* Hero Section */}
      <div className="container mx-auto text-center py-20">
        <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Discover More About ChamaPay</h1>
        <p className="text-lg max-w-3xl mx-auto opacity-80">
          ChamaPay is a secure, fast, and reliable way to manage your savings, transactions, and payments with ease.
        </p>
      </div>

      {/* Features Section */}
      <div className="container mx-auto grid md:grid-cols-3 gap-12 px-6 md:px-20 py-16">
        {/* Secure Transactions */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaShieldAlt />
          </div>
          <h3 className="text-xl font-semibold text-center">Secure Transactions</h3>
          <p className="text-gray-600 text-center mt-2">
            Your funds are protected with top-tier encryption and security protocols.
          </p>
        </div>

        {/* Smart Savings */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaPiggyBank />
          </div>
          <h3 className="text-xl font-semibold text-center">Smart Savings</h3>
          <p className="text-gray-600 text-center mt-2">
            Save money collectively and efficiently with automated savings plans.
          </p>
        </div>

        {/* Fast Payments */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaMoneyBillWave />
          </div>
          <h3 className="text-xl font-semibold text-center">Fast Payments</h3>
          <p className="text-gray-600 text-center mt-2">
            Transfer money instantly with zero delays or extra hidden charges.
          </p>
        </div>
      </div>

      {/* Call-To-Action Section */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Get Started with ChamaPay</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Join thousands of users who trust ChamaPay for their financial needs. Sign up today and take control of your transactions.
        </p>
        <NavLink to="/signup">
          <button onClick={()=> navigate('/pricing')} className="mt-6 bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 px-6 rounded-full text-lg shadow-md transition duration-300">
            Get Started
          </button>
        </NavLink>
      </div>
    </section>
  );
};

export default LearnMore;
