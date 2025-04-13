import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaReceipt,
  FaMoneyBillWave,
  FaRegCalendarAlt,
  FaTrashAlt,
  FaEdit,
} from "react-icons/fa";

const Edit = () => {
  const [members, setMembers] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    amount: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all members from the API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:6500/api/members/all/all_members"
        );
        setMembers(Array.isArray(data.members) ? data.members : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load members.");
      }
    };

    fetchMembers();
  }, []);

  // Handle input changes in the form
  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle member selection for editing
  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      phone: member.phone,
      amount: member.amount,
      date: member.date,
    });
    setEditModalOpen(true);
  };

  // Update the member data
  const handleUpdate = async () => {
    if (!selectedMember || !formData.name || !formData.phone || !formData.amount || !formData.date) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const { status } = await axios.put(
        `http://localhost:6500/api/members/updating/${selectedMember.id}/updated`,
        formData
      );

      if (status === 200) {
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member.id === selectedMember.id ? { ...member, ...formData } : member
          )
        );
        closeModal();
      }
    } catch (error) {
      console.error("Error updating member:", error);
      setError("Failed to update member.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a member
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const { status } = await axios.delete(
          `http://localhost:6500/api/members/${id}/delete`
        );

        if (status === 200) {
          setMembers((prevMembers) => prevMembers.filter((member) => member.id !== id));
        }
      } catch (error) {
        console.error("Error deleting member:", error);
        setError("Failed to delete member.");
      }
    }
  };

  // Close the edit modal
  const closeModal = () => {
    setEditModalOpen(false);
    setSelectedMember(null);
    setFormData({ name: "", phone: "", amount: "", date: "" });
    setError(null);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Members Management</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {/* Members Table */}
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
              <th className="p-4 border text-center">Actions</th>
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
                <td className="p-4 border text-center">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-4 transition"
                    onClick={() => handleEdit(member)}
                  >
                    <FaEdit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 transition"
                    onClick={() => handleDelete(member.id)}
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Member Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Member</h2>
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone"
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Edit;
