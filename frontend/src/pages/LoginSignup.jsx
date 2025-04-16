import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const LoginSignup = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "254",
        password: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target;

        if (name === "phone") {
            if ((value.startsWith("254") || value.startsWith("07")) && /^\d+$/.test(value)) {
                setFormData({ ...formData, phone: value });
            } else {
                setFormData({ ...formData, phone: "254" });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const toggleForm = () => setIsLogin(!isLogin);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin
            ? "http://localhost:6500/api/members/login"
            : "http://localhost:6500/api/members/register";

        try {
            const { data } = await axios.post(endpoint, formData);

            alert(data.message);

            if (isLogin && data.token) {
                // Set the token in cookies and headers
                Cookies.set("token", data.token, { expires: 7 }); // Set token in cookies for later use
                axios.defaults.headers.Authorization = `Bearer ${data.token}`; // Set token in axios default headers

                data.role === "admin" ? navigate("/admin") : navigate("/");
                window.location.reload();
            } else {
                setIsLogin(true);
                window.location.reload();
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
                            <InputField
                                label="Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Phone"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </>
                    )}
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md"
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <p className="text-center mt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span
                        className="text-blue-400 cursor-pointer ml-1"
                        onClick={toggleForm}
                    >
                        {isLogin ? "Sign up" : "Login"}
                    </span>
                </p>

                {isLogin && (
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate("/admin")}
                            className="text-sm text-yellow-400 hover:underline"
                        >
                            Admin? Go to Admin Page
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable input field component
const InputField = ({ label, type, name, value, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-semibold">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none"
        />
    </div>
);

export default LoginSignup;
