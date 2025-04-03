import { FaUsers, FaWallet, FaPiggyBank } from "react-icons/fa";

const Stats = () => {
  return (
    <section className="bg-gradient-to-r from-[#0D9488] to-[#1E3A8A] py-16 text-white">
      <div className="max-w-6xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="text-4xl font-bold">Our Impact in Numbers</h2>
        <p className="text-gray-300 mt-4">
          See how ChamaPay is helping groups manage and grow their savings.
        </p>

        {/* Decorative Line */}
        <hr className="w-20 mx-auto my-6 border-t-4 border-[#FACC15] rounded-full" />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Users Stat */}
          <div className="bg-white shadow-lg rounded-lg p-8 text-[#1E3A8A]">
            <FaUsers className="text-5xl mx-auto mb-4 text-[#0D9488]" />
            <h3 className="text-4xl font-bold">50K+</h3>
            <p className="text-lg font-semibold">Active Users</p>
          </div>

          {/* Transactions Stat */}
          <div className="bg-white shadow-lg rounded-lg p-8 text-[#0D9488]">
            <FaWallet className="text-5xl mx-auto mb-4 text-[#1E3A8A]" />
            <h3 className="text-4xl font-bold">$10M+</h3>
            <p className="text-lg font-semibold">Transactions Processed</p>
          </div>

          {/* Savings Stat */}
          <div className="bg-white shadow-lg rounded-lg p-8 text-[#1E3A8A]">
            <FaPiggyBank className="text-5xl mx-auto mb-4 text-[#0D9488]" />
            <h3 className="text-4xl font-bold">$5M+</h3>
            <p className="text-lg font-semibold">Total Savings</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
