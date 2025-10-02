import { useState, useEffect, useRef } from "react";
import {
  FaPrint,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Transaction Report",
  });

  const getToken = () => {
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : null;
  };
  const token = getToken();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${BASE_URL}/api/members/transact/transactions/track`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTransactions(response.data.transactions || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [token]);

  // Counts & totals
  const totalAmount = transactions.reduce((acc, tx) => acc + Number(tx.amount || 0), 0);
  const completedCount = transactions.filter((tx) => tx.status === "success").length;
  const failedCount = transactions.filter((tx) => tx.status === "failed").length;
  const pendingCount = transactions.filter((tx) => tx.status === "pending").length;

  const formatStatus = (status) => {
    switch (status) {
      case "success":
        return { label: "Completed", style: "bg-green-100 text-green-700" };
      case "failed":
        return { label: "Failed", style: "bg-red-100 text-red-700" };
      case "pending":
      default:
        return { label: "Pending", style: "bg-yellow-100 text-yellow-700" };
    }
  };

  const renderTransactions = () => {
    const list = showAll ? transactions : transactions.slice(0, 5); // first 5 by default
    return list.length ? (
      list.map((tx, index) => {
        const { label, style } = formatStatus(tx.status);
        return (
          <tr key={index} className="text-center hover:bg-gray-50 transition">
            <td className="p-3 border">{tx.date_paid ? new Date(tx.date_paid).toLocaleDateString() : "—"}</td>
            <td className="p-3 border font-mono">{tx.transaction}</td>
            <td className="p-3 border">${Number(tx.amount).toLocaleString()}</td>
            <td className="p-3 border">{tx.phone}</td>
            <td className="p-3 border font-semibold">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${style}`}>{label}</span>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="5" className="text-center p-4 text-gray-500">
          No transactions found
        </td>
      </tr>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        My Transactions
      </h2>

      {loading && (
        <div className="flex justify-center items-center h-60">
          <FaSpinner className="animate-spin text-5xl text-blue-600" />
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 font-semibold mb-4">
          ⚠️ Error: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-2xl shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Total Amount</h3>
                <FaMoneyBillWave className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-800">${totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-2xl shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Completed</h3>
                <FaCheckCircle className="text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-800">{completedCount}</p>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-red-100 p-5 rounded-2xl shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Failed</h3>
                <FaTimesCircle className="text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-800">{failedCount}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-5 rounded-2xl shadow hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-600 font-medium">Pending</h3>
                <FaClock className="text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-800">{pendingCount}</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div
            ref={printRef}
            className="bg-white p-6 shadow-lg rounded-xl overflow-x-auto animate-fadeIn mb-4"
          >
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-900 text-white text-left">
                  <th className="p-3 border">Date Paid</th>
                  <th className="p-3 border">Transaction ID</th>
                  <th className="p-3 border">Amount</th>
                  <th className="p-3 border">Phone</th>
                  <th className="p-3 border">Status</th>
                </tr>
              </thead>
              <tbody>{renderTransactions()}</tbody>
            </table>
          </div>

          {/* Toggle All Transactions */}
          {transactions.length > 5 && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg shadow transition"
              >
                {showAll ? "Show Less" : "Show All Transactions"}
                {showAll ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>
          )}

          {/* Print Button */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handlePrint}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              <FaPrint className="mr-2" /> Print Transactions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Transaction;
