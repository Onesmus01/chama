const ContactSupport = () => {
    return (
      <section className="bg-gradient-to-b from-[#0A2342] to-[#117A7A] min-h-screen text-white">
        {/* Hero */}
        <div className="container mx-auto text-center py-20">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Contact Support</h1>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            Need help with something? Our support team is ready to assist you. Please choose a category and fill out the form below.
          </p>
        </div>
  
        {/* Support Categories */}
        <div className="container mx-auto grid md:grid-cols-3 gap-8 px-6 md:px-20 pb-12">
          {[
            { title: "Account Issues", desc: "Help with login, registration, or password." },
            { title: "Payment Problems", desc: "Troubleshooting transactions or billing issues." },
            { title: "Technical Support", desc: "Report bugs or platform-related problems." },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300"
            >
              <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
  
        {/* Support Form */}
        <div className="container mx-auto px-6 md:px-20 py-12">
          <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-xl max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-[#1E3A8A] mb-6">Submit a Support Request</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Email Address</label>
                <input
                  type="email"
                  className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="jane@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Support Category</label>
                <select className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]">
                  <option value="">-- Select Category --</option>
                  <option value="account">Account Issues</option>
                  <option value="payment">Payment Problems</option>
                  <option value="technical">Technical Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold">Describe Your Issue</label>
                <textarea
                  rows="4"
                  className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]"
                  placeholder="Write your issue in detail..."
                ></textarea>
              </div>
              <button className="w-full bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 rounded-lg transition duration-300">
                Submit Request
              </button>
            </form>
          </div>
        </div>
  
        {/* Footer Note */}
        <div className="text-center py-12">
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            We typically respond within 24 hours. For urgent issues, please call our support line.
          </p>
          <p className="mt-4 font-semibold text-white">+123 456 7890 &bull; support@chamapay.com</p>
        </div>
      </section>
    );
  };
  
  export default ContactSupport;
  