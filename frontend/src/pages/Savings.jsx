import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaFileDownload,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

// Use your environment variable for backend
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [extraPaid, setExtraPaid] = useState(0);
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [hideCard, setHideCard] = useState({
    totalSavings: true,
    expectedAmount: true,
    extraPaid: true,
    balance: true,
  });

  const componentRef = useRef();

  const getToken = () => {
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : null;
  };
  const token = getToken();

  const formatCurrency = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${BASE_URL}/api/members/saved/save/saving`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );

        const {
          name, email, phone, member_since,
          total_paid, expected_amount, message, savings_data
        } = data;

        setName(name || "User");
        setEmail(email || "No email provided");
        setPhone(phone || "No phone provided");
        setMemberSince(member_since ? new Date(member_since).toLocaleDateString() : "N/A");

        const total = Array.isArray(total_paid)
          ? total_paid.reduce((acc, entry) => acc + Number(entry.amount || 0), 0)
          : Number(total_paid) || 0;

        setTotalSavings(total);
        setSavings(savings_data || []);

        const expected = Number(expected_amount) || 0;
        setExpectedAmount(expected);

        const difference = total - expected;
        if (difference > 0) {
          setExtraPaid(difference);
          setBalance(0);
        } else {
          setBalance(Math.abs(difference));
          setExtraPaid(0);
        }

        setMessage(total === 0 ? "You have not contributed yet." : (message || "Thank you for your contribution."));
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch savings data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, [token]);

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center my-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium text-gray-700">Loading your savings data...</p>
      </div>
    );
  }

  const summaryCards = [
    { key: "totalSavings", title: "Total Savings", value: totalSavings, color: "green" },
    { key: "expectedAmount", title: "Expected Contribution", value: expectedAmount, color: "blue" },
    extraPaid > 0 && { key: "extraPaid", title: "Extra Paid", value: extraPaid, color: "purple" },
    balance > 0 && { key: "balance", title: "Balance Remaining", value: balance, color: "red" },
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto my-16 px-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Hello {name}, Your Savings Dashboard
        </h1>
        <p className="text-gray-500 text-lg">{message}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {summaryCards.map((card, idx) => (
          <div
            key={idx}
            className={`relative bg-gradient-to-r from-${card.color}-50 to-${card.color}-100 p-6 rounded-3xl shadow-lg hover:shadow-xl transition cursor-pointer`}
          >
            <p className="text-gray-500 text-sm mb-1">{card.title}</p>
            <p className={`text-2xl font-bold text-${card.color}-800 mb-2`}>
              {hideCard[card.key] ? "****" : `$${formatCurrency(card.value)}`}
            </p>
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
              onClick={() => setHideCard({ ...hideCard, [card.key]: !hideCard[card.key] })}
            >
              {hideCard[card.key] ? <FaEye /> : <FaEyeSlash />}
            </button>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-4">
              <div
                className={`h-2 rounded-full bg-${card.color}-500`}
                style={{
                  width: `${Math.min((card.value / expectedAmount) * 100, 100)}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-lg mb-12 border border-gray-200 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Member Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 font-medium">
          <p><FaUserAlt className="inline mr-2 text-gray-500" /> {name}</p>
          <p><FaEnvelope className="inline mr-2 text-gray-500" /> {email}</p>
          <p><FaPhone className="inline mr-2 text-gray-500" /> {phone}</p>
          <p><FaCalendarAlt className="inline mr-2 text-gray-500" /> Member Since: {memberSince}</p>
        </div>
      </div>

      <div ref={componentRef} className="overflow-x-auto mb-12">
        <table className="min-w-full bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
          <thead>
            <tr className="bg-gray-900 text-white text-left text-lg">
              <th className="p-4">Date</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Description</th>
            </tr>
          </thead>
          <tbody>
            {savings.length > 0 ? (
              savings.map((entry, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">{entry.payment_date ? new Date(entry.payment_date).toLocaleDateString() : "N/A"}</td>
                  <td className="p-4">{`$${formatCurrency(entry.amount)}`}</td>
                  <td className="p-4">{entry.payment_method || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500">No savings records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          className="flex items-center gap-3 px-8 py-3 bg-blue-900 hover:bg-blue-700 text-white rounded-full shadow-lg transition"
        >
          <FaFileDownload /> Print Savings Report
        </button>
      </div>
    </div>
  );
};

export default Savings;
