import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaFileDownload,
  FaInfoCircle,
} from "react-icons/fa";

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
  const componentRef = useRef();

  const { id } = useParams();

  const getToken = () => {
    const localToken = localStorage.getItem("token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    return match ? match[1] : null;
  };

  const token = getToken();

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:6500/api/members/saved/save/saving`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const {
          name,
          email,
          phone,
          member_since,
          total_paid,
          expected_amount,
          message,
          savings_data,
        } = response.data;

        setName(name || "User");
        setEmail(email || "No email provided");
        setPhone(phone || "No phone provided");
        setMemberSince(member_since ? new Date(member_since).toLocaleDateString() : "N/A");

        const total = Array.isArray(total_paid)
          ? total_paid.reduce((acc, entry) => acc + (entry.amount || 0), 0)
          : total_paid || 0;

        setTotalSavings(total);
        setSavings(savings_data || []);

        const expected = expected_amount || 0;
        setExpectedAmount(expected);

        const difference = total - expected;
        if (difference > 0) {
          setExtraPaid(difference);
          setBalance(0);
        } else {
          setBalance(Math.abs(difference));
          setExtraPaid(0);
        }

        if (total === 0 || !total) {
          setMessage("You have not contributed yet.");
        } else {
          setMessage(message || "Thank you for your contribution.");
        }
      } catch (error) {
        console.error("Error fetching savings:", error);
        setMessage("Failed to fetch savings data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();
  }, [token, id]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  if (loading) {
    return (
      <div className="text-center my-20 text-xl font-medium text-blue-700 animate-pulse">
        <FaInfoCircle className="inline mr-2 text-blue-500" /> Loading your savings data...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-16 px-8 py-10 bg-white shadow-xl rounded-3xl border border-blue-200 transition-all duration-300">
      <h2 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-900 drop-shadow-xl tracking-tight font-[Inter]">
        <FaMoneyBillWave className="inline mr-2 text-green-600" />
        Hello {name}, Here’s Your Savings Summary
      </h2>

      <p className="text-xl text-center text-green-700 font-semibold mb-4">
        💰 Total Savings: <span className="font-bold text-green-900">${totalSavings.toFixed(2)}</span>
      </p>

      <p className="text-center text-lg mb-2 text-blue-700">
        🎯 Expected Contribution: <span className="font-semibold">${expectedAmount.toFixed(2)}</span>
      </p>

      {extraPaid > 0 && (
        <p className="text-center text-green-600 font-semibold text-lg mb-2">
          ✅ Extra Paid: ${extraPaid.toFixed(2)} — Great job!
        </p>
      )}

      {balance > 0 && (
        <p className="text-center text-red-600 font-semibold text-lg mb-2">
          ⚠️ Balance Remaining: ${balance.toFixed(2)} — Please complete your contribution.
        </p>
      )}

      <div className="mb-12 bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-inner border border-blue-100">
        <h3 className="text-2xl font-bold text-blue-800 mb-4 font-serif">
          <FaUserAlt className="inline mr-2 text-blue-600" /> Member Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg text-gray-700 font-medium">
          <p><FaUserAlt className="inline mr-2 text-blue-500" /> Name: <span className="font-semibold">{name}</span></p>
          <p><FaEnvelope className="inline mr-2 text-blue-500" /> Email: <span className="font-semibold">{email}</span></p>
          <p><FaPhone className="inline mr-2 text-blue-500" /> Phone: <span className="font-semibold">{phone}</span></p>
          <p><FaCalendarAlt className="inline mr-2 text-blue-500" /> Member Since: <span className="font-semibold">{memberSince}</span></p>
        </div>
      </div>

      {message && (
        <div className="text-center text-red-500 font-medium text-lg mb-8">
          <FaInfoCircle className="inline mr-2" /> {message}
        </div>
      )}

      <div ref={componentRef} className="overflow-x-auto mb-12">
        <table className="w-full text-left table-auto rounded-xl shadow-lg bg-white border border-gray-200">
          <thead>
            <tr className="bg-blue-800 text-white text-lg">
              <th className="p-4"><FaCalendarAlt className="inline mr-2" /> Date</th>
              <th className="p-4"><FaMoneyBillWave className="inline mr-2" /> Amount</th>
              <th className="p-4"><FaFileInvoiceDollar className="inline mr-2" /> Description</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(savings) && savings.length > 0 ? (
              savings.map((entry, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-blue-50 transition duration-200"
                >
                  <td className="p-4">
                    {entry.payment_date
                      ? new Date(entry.payment_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-4 text-green-600 font-semibold">
                    {entry.amount != null ? `$${entry.amount.toFixed(2)}` : "$0.00"}
                  </td>
                  <td className="p-4">{entry.payment_method || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-6 text-gray-500">
                  No savings records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-12">
        <button
          onClick={handlePrint}
          className="flex items-center gap-3 px-8 py-3 bg-blue-900 hover:bg-blue-700 text-white text-lg font-semibold rounded-full shadow-md transition-all duration-300"
        >
          <FaFileDownload className="text-xl" /> Print Savings Report
        </button>
      </div>
    </div>
  );
};

export default Savings;
