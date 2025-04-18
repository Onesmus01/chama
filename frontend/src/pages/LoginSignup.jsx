import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const BASE_URL = "http://localhost:6500/api/members";

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

const LoginSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "254",
    password: "",
  });

  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Axios response interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          Cookies.remove("token");
          navigate("/login");
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const isValidPhone =
        (value.startsWith("254") || value.startsWith("07")) && /^\d+$/.test(value);
      setFormData({ ...formData, phone: isValidPhone ? value : "254" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setIsForgotPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? `${BASE_URL}/login` : `${BASE_URL}/register`;

    try {
      const { data } = await axios.post(endpoint, formData);
      alert(data.message);

      if (isLogin && data.token) {
        Cookies.set("token", data.token, { expires: 7 });
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        navigate(data.role === "admin" ? "/admin" : "/");
        window.location.reload();
      } else {
        setIsLogin(true);
        window.location.reload();
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Something went wrong.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${BASE_URL}/forgot/reset-password`, {
        email: forgotEmail,
      });
      alert(data.message);
      setIsForgotPassword(false);
      setForgotEmail("");
    } catch (error) {
      alert(error.response?.data?.msg || "Unable to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isForgotPassword
            ? "Forgot Password"
            : isLogin
            ? "Login"
            : "Sign Up"}
        </h2>

        {!isForgotPassword ? (
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

            {isLogin && (
              <div className="text-right mb-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-blue-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <InputField
              label="Enter your email"
              type="email"
              name="forgotEmail"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 rounded-md mb-3"
            >
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="w-full text-sm text-gray-300 hover:underline"
            >
              Back to Login
            </button>
          </form>
        )}

        {!isForgotPassword && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
