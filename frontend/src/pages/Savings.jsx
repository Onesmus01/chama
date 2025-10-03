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

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Savings = () => {
  const [data, setData] = useState({
    name: "User",
    email: "",
    phone: "",
    memberSince: "",
    totalSavings: 0,
    expectedAmount: 0,
    extraPaid: 0,
    balance: 0,
    contributions: [],
    message: "",
  });

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
    `KES ${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${BASE_URL}/api/members/saved/save/saving`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const res = response.data;

        // Filter only completed contributions
        const completedContributions = Array.isArray(res.contributions)
          ? res.contributions.filter(
              (c) => c.status && c.status.toLowerCase() === "completed"
            )
          : [];

        // Calculate totalPaid only from completed contributions
        const totalPaid = completedContributions.reduce(
          (sum, c) => sum + Number(c.amount ?? 0),
          0
        );

        const expectedContribution = Number(res.expected_contribution ?? 200000);
        const balance = Math.max(expectedContribution - totalPaid, 0);
        const extraPaid = Math.max(totalPaid - expectedContribution, 0);

        setData({
          name: res.name || "User",
          email: res.email || "No email provided",
          phone: res.phone || "No phone provided",
          memberSince: res.member_since
            ? new Date(res.member_since).toLocaleDateString()
            : "N/A",
          totalSavings: totalPaid, // total from completed transactions only
          expectedAmount: expectedContribution,
          balance,
          extraPaid,
          contributions: completedContributions, // only completed contributions in table
          message:
            res.message ||
            (totalPaid > 0
              ? "Thank you for your contribution."
              : "You have not contributed yet."),
        });
      } catch (err) {
        console.error("❌ Fetch Savings Error:", err);
        setData((prev) => ({
          ...prev,
          message: "Failed to fetch savings data.",
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, [token]);

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center my-20">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-4"></div>
        <p className="text-xl font-medium text-gray-700">
          Loading your savings data...
        </p>
      </div>
    );

  const summaryCards = [
    { key: "totalSavings", title: "Total Savings", value: data.totalSavings, color: "green" },
    { key: "expectedAmount", title: "Expected Contribution", value: data.expectedAmount, color: "blue" },
    { key: "extraPaid", title: "Extra Paid", value: data.extraPaid, color: "purple" },
    { key: "balance", title: "Balance Remaining", value: data.balance, color: "red" },
  ];

  const colorMap = {
    green: "#16a34a",
    blue: "#2563eb",
    purple: "#7e22ce",
    red: "#dc2626",
  };

  return (
    <div className="max-w-7xl mx-auto my-16 px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Hello {data.name}, Your Savings Dashboard
        </h1>
        <p className="text-gray-500 text-lg">{data.message}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {summaryCards.map((card) => {
          const progressPercent = data.expectedAmount
            ? Math.min((card.value / data.expectedAmount) * 100, 100)
            : 0;

          return (
            <div
              key={card.key}
              className="relative p-6 rounded-3xl shadow-lg hover:shadow-xl transition cursor-pointer"
              style={{ backgroundColor: `${colorMap[card.color]}1A` }}
            >
              <p className="text-gray-500 text-sm mb-1">{card.title}</p>
              <p className="text-2xl font-bold mb-2">
                {hideCard[card.key] ? "****" : formatCurrency(card.value)}
              </p>
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
                onClick={() =>
                  setHideCard({ ...hideCard, [card.key]: !hideCard[card.key] })
                }
              >
                {hideCard[card.key] ? <FaEye /> : <FaEyeSlash />}
              </button>
              <div className="h-2 w-full bg-gray-200 rounded-full mt-4">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: colorMap[card.color],
                    transition: "width 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Info */}
      <div className="bg-white p-6 rounded-3xl shadow-lg mb-12 border border-gray-200 hover:shadow-xl transition-all">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Member Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700 font-medium">
          <p><FaUserAlt className="inline mr-2 text-gray-500" /> {data.name}</p>
          <p><FaEnvelope className="inline mr-2 text-gray-500" /> {data.email}</p>
          <p><FaPhone className="inline mr-2 text-gray-500" /> {data.phone}</p>
          <p><FaCalendarAlt className="inline mr-2 text-gray-500" /> Member Since: {data.memberSince}</p>
        </div>
      </div>

      {/* Savings Table (completed contributions only) */}
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
            {data.contributions.length > 0 ? (
              data.contributions.map((entry, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    {entry.payment_date
                      ? new Date(entry.payment_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4">{formatCurrency(entry.amount)}</td>
                  <td className="p-4">{entry.payment_method || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500">
                  No completed savings records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Print Button */}
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
