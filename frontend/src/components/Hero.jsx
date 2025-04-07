import { FaShieldAlt, FaMoneyCheckAlt, FaClock, FaBolt, FaUsers, FaMobileAlt } from "react-icons/fa";
import photo from "../assets/photo.jpg";
import {useNavigate} from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate()
    return (
        <section className="bg-gradient-to-r from-[#1E3A8A] to-[#48b4ab] text-white py-20 px-6 md:px-12">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                {/* Left Content */}
                <div className="md:w-1/2 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        Save Smarter, Together.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 mb-6">
                        Join <span className="font-semibold text-yellow-300">ChamaPay</span> and take control of your group savings with a <strong>secure</strong>, <strong>automated</strong>, and <strong>easy-to-use</strong> platform. 
                        Build <strong>financial strength</strong> together!
                    </p>

                    {/* Features List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-100 mb-6">
                        <div className="flex items-center space-x-3">
                            <FaShieldAlt className="text-yellow-300 text-2xl" />
                            <span>Secure & Transparent</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FaMoneyCheckAlt className="text-yellow-300 text-2xl" />
                            <span>Automated Savings</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FaClock className="text-yellow-300 text-2xl" />
                            <span>Real-time Tracking</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <FaBolt className="text-yellow-300 text-2xl" />
                            <span>Fast Withdrawals</span>
                        </div>
                    </div>

                    {/* Call to Action Button */}
                    <button onClick={()=>navigate('/pricing')} className="bg-[#FACC15] text-[#111827] font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-yellow-400 transition-all duration-300">
                        Get Started
                    </button>
                </div>

                {/* Right Content - Image and Info Panel */}
                <div className="md:w-1/2 flex justify-center mt-8 md:mt-0 relative">
                    <div className="w-full max-w-lg bg-white text-[#1E3A8A] p-8 rounded-2xl shadow-xl relative overflow-hidden">
                        {/* Animated Background Glow */}
                        <div className="absolute -top-16 -left-16 w-40 h-40 bg-yellow-300 opacity-30 rounded-full animate-pulse"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-400 opacity-20 rounded-full animate-bounce"></div>

                        {/* Image */}
                        <div className="flex justify-center mb-6">
                            <img
                                src={photo}
                                alt=''
                                className="w-[150px] max-w-md md:max-w-lg h-[160px] rounded-full shadow-2xl border-4 border-[#FACC15] hover:scale-105 transition-transform duration-300 ease-in-out backdrop-blur-lg bg-white/10 p-2 shadow-yellow-400/50 animate-puls"
                            />
                        </div>

                        <h2 className="text-2xl font-bold mb-4">Why Choose ChamaPay?</h2>

                        <ul className="space-y-4">
                            <li className="flex items-center space-x-3">
                                <FaUsers className="text-[#1E3A8A] text-2xl" />
                                <span>Collaborate with Your Team</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaMobileAlt className="text-[#1E3A8A] text-2xl" />
                                <span>Access Anywhere, Anytime</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <FaShieldAlt className="text-[#1E3A8A] text-2xl" />
                                <span>Top-Level Security for Your Funds</span>
                            </li>
                        </ul>

                        <button onClick={()=>navigate('/learn')} className="mt-6 bg-[#1E3A8A] text-white px-5 py-3 rounded-lg shadow-md hover:bg-[#123066] transition-all duration-300">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;