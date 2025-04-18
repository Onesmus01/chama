import { useState, useEffect, useRef } from "react";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Transaction Report',
    onAfterPrint: () => console.log('Print complete'),
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
      try {
        const response = await axios.get("http://localhost:6500/api/members/transact/transactions", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error.response?.data || error.message);
      }
    };

    fetchTransactions();
  }, [token]);

  const renderTransactions = () =>
    transactions.length ? (
      transactions.map((tx, index) => (
        <tr key={index} className="text-center border">
          <td className="p-3 border">{new Date(tx.date_paid).toLocaleDateString()}</td>
          <td className="p-3 border">{tx.transaction}</td>
          <td className="p-3 border">${tx.amount}</td>
          <td className="p-3 border">{tx.phone}</td>
          <td className={`p-3 border font-semibold ${tx.status === "completed" ? "text-green-600" : tx.status === "failed" ? "text-red-600" : "text-yellow-500"}`}>
            {tx.status}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" className="text-center p-4 text-gray-500">
          No transactions found
        </td>
      </tr>
    );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">My Transactions</h2>

      <div ref={printRef} className="bg-white p-6 shadow-lg rounded-xl overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-800 text-white">
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

      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          className="mt-6 flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          <FaPrint className="mr-2" />
          Print Transactions
        </button>
      </div>
    </div>
  );
};

export default Transaction;
