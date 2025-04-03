const settings = {
    siteName: "Admin Dashboard",
    currency: "KES",
    theme: {
        primary: "#4CAF50",
        secondary: "#8884d8",
        danger: "#ff4d4d",
        background: "#f8f9fa"
    },
    apiEndpoints: {
        members: "/api/members",
        payments: "/api/payments",
        requests: "/api/requests",
    },
    defaultChartOptions: {
        grid: { strokeDasharray: "3 3" },
        barSize: 40,
        areaFill: "#82ca9d"
    }
};

export default settings;
