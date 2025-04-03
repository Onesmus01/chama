import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { FaUsers, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import Sidebar from "./Sidebar";

const paymentData = [
    { month: 'Jan', payments: 50000 },
    { month: 'Feb', payments: 65000 },
    { month: 'Mar', payments: 80000 },
    { month: 'Apr', payments: 70000 },
    { month: 'May', payments: 90000 },
    { month: 'Jun', payments: 75000 },
    { month: 'Jul', payments: 85000 },
    { month: 'Aug', payments: 95000 },
    { month: 'Sep', payments: 72000 },
    { month: 'Oct', payments: 88000 },
    { month: 'Nov', payments: 94000 },
    { month: 'Dec', payments: 102000 },
];

const pieData = [
    { name: 'Completed', value: 400 },
    { name: 'Pending', value: 300 },
    { name: 'Failed', value: 100 }
];

const COLORS = ['#0088FE', '#FFBB28', '#FF4444'];

const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-6 bg-teal-500 text-white rounded-lg shadow-md flex items-center gap-4">
                        <FaUsers size={30} />
                        <div>
                            <h2 className="text-lg font-semibold">Total Members</h2>
                            <p className="text-2xl font-bold">120</p>
                        </div>
                    </div>
                    <div className="p-6 bg-blue-500 text-white rounded-lg shadow-md flex items-center gap-4">
                        <FaMoneyBillWave size={30} />
                        <div>
                            <h2 className="text-lg font-semibold">Total Payments</h2>
                            <p className="text-2xl font-bold">KES 500,000</p>
                        </div>
                    </div>
                    <div className="p-6 bg-red-400 text-white rounded-lg shadow-md flex items-center gap-4">
                        <FaExclamationTriangle size={30} />
                        <div>
                            <h2 className="text-lg font-semibold">Pending Requests</h2>
                            <p className="text-2xl font-bold">5</p>
                        </div>
                    </div>
                </div>

                {/* Payment Graphs */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">Monthly Payments Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bar Chart */}
                        <div className="bg-blue-50 p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Bar Chart</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={paymentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="payments" fill="#4CAF50" barSize={40} radius={[10, 10, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Line Chart */}
                        <div className="bg-blue-50 p-4 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-2">Line Chart</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={paymentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="payments" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Area Chart */}
                        <div className="bg-red-50 p-4 rounded-lg shadow col-span-2">
                            <h3 className="text-lg font-semibold mb-2">Area Chart</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={paymentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="payments" stroke="#82ca9d" fill="#82ca9d" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Members Table */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-xl font-bold mb-4">Recent Members</h2>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-blue-100">
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Phone</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border">
                                <td className="p-2 border">John Doe</td>
                                <td className="p-2 border">+254712345678</td>
                                <td className="p-2 border text-green-500">Active</td>
                            </tr>
                            <tr className="border bg-red-100">
                                <td className="p-2 border">Jane Smith</td>
                                <td className="p-2 border">+254798765432</td>
                                <td className="p-2 border text-red-500">Inactive</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Large Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Payment Status Overview</h2>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8" label>
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
