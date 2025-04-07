import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

const Savings = () => {
  const [savings, setSavings] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [name, setName] = useState("");
  const componentRef = useRef();

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:6500/api/members", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, savings: savingsData } = response.data;

        setName(name || "User");
        setSavings(savingsData || []);

        const total = (savingsData || []).reduce((acc, entry) => acc + (entry.amount || 0), 0);
        setTotalSavings(total);
      } catch (error) {
        console.error("Error fetching savings:", error);
      }
    };

    fetchSavings();
  }, []);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });


  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`http://localhost:6500/api/members/{member_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, savings: savingsData } = response.data;

        setName(name || "User");
        setSavings(savingsData || []);

        const total = (savingsData || []).reduce((acc, entry) => acc + (entry.amount || 0), 0);
        setTotalSavings(total);
      } catch (error) {
        console.error("Error fetching savings:", error);
      }
    };

    fetchSavings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-10 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold text-center text-[#1E3A8A] mb-2">
        Welcome {name}, Your Savings
      </h2>
      <p className="text-lg text-center font-semibold text-[#0D9488] mb-4">
        Total Savings: ${totalSavings.toFixed(2)}
      </p>
      <div ref={componentRef} className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#117A7A] text-white">
              <th className="p-3">Date</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {savings.length > 0 ? (
              savings.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-3">
                    {new Date(entry.payment_date).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-green-600 font-semibold">
                    {entry.amount != null ? `$${entry.amount.toFixed(2)}` : "$0.00"}
                  </td>
                  <td className="p-3">{entry.payment_method}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-5">
                  No savings records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={handlePrint}
        className="mt-6 px-6 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#0D9488]"
      >
        Print Savings Report
      </button>
    </div>
  );
};

export default Savings;
