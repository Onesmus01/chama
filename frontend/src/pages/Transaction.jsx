import { useState, useEffect } from "react";
import { FaPrint } from "react-icons/fa";
import { useReactToPrint } from "react-to-print";

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:6500/api/members/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    fetchTransactions();
  }, []);

  const printRef = useState(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">My Transactions</h2>
      <div ref={printRef} className="bg-white p-6 shadow-lg rounded-xl">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Type</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <tr key={index} className="text-center border">
                  <td className="p-3 border">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="p-3 border">{tx.type}</td>
                  <td className="p-3 border">${tx.amount}</td>
                  <td className="p-3 border text-green-600 font-semibold">{tx.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={handlePrint} className="mt-6 flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700">
        <FaPrint className="mr-2" /> Print Transactions
      </button>
    </div>
  );
};

export default Transaction;