import { useState, useEffect } from "react";
import axios from "axios";  // Import Axios

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch payment data from the backend when the component mounts
        const fetchPayments = async () => {
            try {
                const response = await axios.get("http://localhost:6500/api/payment/mpesa/pay"); // Replace with your API endpoint
                setPayments(response.data); // Assuming the data returned is an array of payments
            } catch (err) {
                setError("Error fetching payment data");
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Payments</h2>
            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Amount ($)</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Transaction</th>
                            <th className="p-3 text-left">Date Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment, index) => (
                            <tr key={index} className="border-b hover:bg-gray-100">
                                <td className="p-3">{payment.name}</td>
                                <td className="p-3">${payment.amount}</td>
                                <td className="p-3">{payment.phone}</td>
                                <td className={`p-3 font-semibold ${payment.status === "Completed" ? "text-green-600" : "text-red-600"}`}>{payment.status}</td>
                                <td className="p-3">{payment.transaction}</td>
                                <td className="p-3">{payment.date_paid}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Payments;
