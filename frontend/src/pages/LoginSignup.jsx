import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "254",  // Default phone number starts with 254
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "phone") {
            if (value.startsWith("254") || value.startsWith("07")) {
                // Allow only digits
                if (/^\d+$/.test(value)) {
                    setFormData({ ...formData, phone: value });
                }
            } else {
                // Default to '254' if the number doesn't start with '254' or '07'
                setFormData({ ...formData, phone: "254" });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
        
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = isLogin
                ? "http://localhost:6500/api/members/login"
                : "http://localhost:6500/api/members/register";

            const { data } = await axios.post(url, formData, {
                withCredentials: true, // ✅ Enable cookies for token handling
            });

            alert(data.message);

            if (isLogin) {
                if (data.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                setIsLogin(true);
            }
        } catch (error) {
            alert(error.response?.data?.msg || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? "Login" : "Sign Up"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md"
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <p className="text-center mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span className="text-blue-400 cursor-pointer" onClick={toggleForm}>
                        {isLogin ? " Sign up" : " Login"}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginSignup;
