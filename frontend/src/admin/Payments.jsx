import { useState, useEffect } from "react";
import axios from "axios";

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentsAndMembers = async () => {
            try {
                const [paymentsRes, membersRes] = await Promise.all([
                    axios.get("http://localhost:6500/api/payment/mpesa/pay"),
                    axios.get("http://localhost:6500/api/members/all/all_members")
                ]);

                // Validate and extract data
                const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : paymentsRes.data?.payments || [];
                const membersData = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data?.members || [];

                // Create a map for member ID to name
                const memberMap = membersData.reduce((acc, member) => {
                    acc[member._id] = member.name || "Unknown";
                    return acc;
                }, {});

                // Enhance payment data with member names
                const enrichedPayments = paymentsData.map(payment => ({
                    ...payment,
                    name: memberMap[payment.member_id] || "Unknown",
                }));

                setPayments(enrichedPayments);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch payment or member data");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentsAndMembers();
    }, []);

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-600 text-center p-4">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Payments</h2>
            <div className="overflow-x-auto">
                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Amount (KES)</th>
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
                                <td className="p-3">{payment.amount}</td>
                                <td className="p-3">{payment.phone}</td>
                                <td className={`p-3 font-semibold ${payment.status === "Completed" ? "text-green-600" : "text-red-600"}`}>
                                    {payment.status}
                                </td>
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
