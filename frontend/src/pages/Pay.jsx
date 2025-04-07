import { useState } from "react";
import axios from "axios";

const Pay = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (phone.length !== 9 || !amount) {
      setMessage("Please enter a valid phone number and amount.");
      setStatus("error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:6500/api/payment/mpesa/pay", {
        phone: `254${phone}`,
        amount,
      });

      setMessage(response.data.message || "Payment request sent!");
      setStatus("success");
      setPhone("");
      setAmount("");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to send payment request.";
      setMessage(errMsg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-xl rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-6">
        Make a Payment
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-sm ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
            <span className="px-3 bg-gray-100 text-gray-700">254</span>
            <input
              type="tel"
              placeholder="712345678"
              className="w-full px-4 py-2 focus:outline-none"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,9}$/.test(val)) {
                  setPhone(val);
                }
              }}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Amount (KES)</label>
          <input
            type="number"
            placeholder="e.g. 100"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="1"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-800 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          disabled={loading}
        >
          {loading ? "Sending..." : "Pay with M-Pesa"}
        </button>
      </form>
    </div>
  );
};

export default Pay;
