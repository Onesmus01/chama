import { useState, useEffect } from "react";
import axios from "axios";
import { FaMobileAlt, FaMoneyBillWave } from "react-icons/fa";  // Importing FontAwesome icons

const Pay = () => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [intervalId, setIntervalId] = useState(null); // for polling

  const webhookUrl = "https://chama-8.onrender.com/api/payment/mpesa/webhook"
  ;  // Your webhook URL

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

      const { message: resMessage, success, toast, transaction_id } = response.data;

      if (toast) {
        setMessage(resMessage || "Payment request sent! Awaiting your M-Pesa PIN.");
        setStatus("pending");
        setTransactionId(transaction_id);

        const pollId = setInterval(() => checkPaymentStatus(transaction_id), 5000);
        setIntervalId(pollId);
      } else if (success) {
        setMessage(resMessage || "Payment request sent!");
        setStatus("success");
      } else {
        setMessage("Payment failed. Please try again.");
        setStatus("error");
      }

      if (success) {
        setPhone("");
        setAmount("");
      }
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Failed to send payment request.";
      setMessage(errMsg);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (txnId) => {
    try {
      const res = await axios.get(`http://localhost:6500/api/payment/mpesa/status/${txnId}`);
      const { status: paymentStatus, message: statusMessage } = res.data;

      if (paymentStatus === "success" || paymentStatus === "failed" || paymentStatus === "cancelled") {
        setMessage(statusMessage || `Payment ${paymentStatus}`);
        setStatus(paymentStatus);

        // Notify the backend via the webhook
        await notifyWebhook(txnId, paymentStatus);

        // Stop polling
        if (intervalId) {
          clearInterval(intervalId);
        }
      } else {
        setMessage("Payment is still pending...");
        setStatus("pending");
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const notifyWebhook = async (txnId, paymentStatus) => {
    try {
      const response = await axios.post(webhookUrl, {
        transactionId: txnId,
        status: paymentStatus,
      });
      console.log("Webhook notification sent:", response.data);
    } catch (error) {
      console.error("Error sending webhook notification:", error);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-xl rounded-lg p-8">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
        <FaMoneyBillWave className="inline-block mr-2 text-4xl" />
        Make a Payment
      </h2>

      {message && (
        <div
          className={`p-3 mb-4 rounded text-sm ${
            status === "success"
              ? "bg-green-100 text-green-800"
              : status === "cancelled"
              ? "bg-yellow-100 text-yellow-800"
              : status === "pending"
              ? "bg-blue-100 text-blue-800"
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
                if (/^\d{0,9}$/.test(val) && val.startsWith("7")) {
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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          disabled={loading}
        >
          {loading ? "Sending..." : (
            <>
              <FaMobileAlt className="inline-block mr-2" />
              Pay with M-Pesa
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Pay;
