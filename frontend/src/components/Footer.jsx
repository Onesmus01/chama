import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#1E3A8A] text-white py-12">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
        
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold">ChamaPay</h3>
          <p className="text-gray-300 mt-3">
            Secure and smart financial solutions for savings groups and investments.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xl font-semibold">Quick Links</h4>
          <ul className="mt-3 space-y-2">
            <li><a href="/dashboard" className="hover:text-[#FACC15] transition">Dashboard</a></li>
            <li><a href="/savings" className="hover:text-[#FACC15] transition">Savings</a></li>
            <li><a href="/transactions" className="hover:text-[#FACC15] transition">Transactions</a></li>
            <li><a href="/contact" className="hover:text-[#FACC15] transition">Contact</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-xl font-semibold">Support</h4>
          <ul className="mt-3 space-y-2">
            <li><a href="/faq" className="hover:text-[#FACC15] transition">FAQs</a></li>
            <li><a href="/privacy" className="hover:text-[#FACC15] transition">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-[#FACC15] transition">Terms of Service</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-xl font-semibold">Follow Us</h4>
          <div className="flex space-x-4 mt-3">
            <a href="#" className="bg-[#FACC15] text-[#1E3A8A] p-2 rounded-full hover:bg-yellow-400 transition">
              <FaFacebookF size={20} />
            </a>
            <a href="#" className="bg-[#FACC15] text-[#1E3A8A] p-2 rounded-full hover:bg-yellow-400 transition">
              <FaTwitter size={20} />
            </a>
            <a href="#" className="bg-[#FACC15] text-[#1E3A8A] p-2 rounded-full hover:bg-yellow-400 transition">
              <FaInstagram size={20} />
            </a>
            <a href="#" className="bg-[#FACC15] text-[#1E3A8A] p-2 rounded-full hover:bg-yellow-400 transition">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

      </div>

      {/* Decorative HR */}
      <div className="flex justify-center my-8">
        <div className="w-16 h-1 bg-[#FACC15] rounded-lg"></div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 mt-4">
        © {new Date().getFullYear()} ChamaPay. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
