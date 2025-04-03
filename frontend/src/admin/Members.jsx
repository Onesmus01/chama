import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaReceipt,
  FaMoneyBillWave,
  FaRegCalendarAlt,
} from "react-icons/fa";

const Members = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:6500/api/members/all/all_members");
        console.log("Members Response:", response.data);

        // Check if response is an object and contains a members array
        if (response.data && Array.isArray(response.data.members)) {
          setMembers(response.data.members);
        } else {
          setMembers([]); // Ensure it's an array to prevent map errors
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Members Management</h1>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white text-left">
              <th className="p-4 border">#</th>
              <th className="p-4 border"><FaUser className="inline mr-2" /> Member ID</th>
              <th className="p-4 border"><FaUser className="inline mr-2" /> Name</th>
              <th className="p-4 border"><FaReceipt className="inline mr-2" /> Transaction ID</th>
              <th className="p-4 border"><FaMoneyBillWave className="inline mr-2" /> Amount (KES)</th>
              <th className="p-4 border"><FaRegCalendarAlt className="inline mr-2" /> Date Paid</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr key={member.id} className="border bg-gray-50 hover:bg-gray-100 transition">
                <td className="p-4 border text-center">{index + 1}</td>
                <td className="p-4 border">{member.member_id}</td>
                <td className="p-4 border">{member.name}</td>
                <td className="p-4 border">{member.phone}</td>
                <td className="p-4 border text-green-600 font-semibold">
                  {member.amount ? member.amount.toLocaleString() : "0"}
                </td>
                <td className="p-4 border">{member.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Members;
