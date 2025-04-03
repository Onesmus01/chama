import { useState } from "react";

const Payments = () => {
    const [payments, setPayments] = useState([
        { name: "John Doe", amount: 500, phone: "123-456-7890", status: "Completed", transaction: "TXN12345", date_paid: new Date().toLocaleDateString() },
        { name: "Jane Smith", amount: 700, phone: "987-654-3210", status: "Pending", transaction: "TXN67890", date_paid: new Date().toLocaleDateString() },
    ]);

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
