import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="bg-gradient-to-b from-[#0A2342] to-[#117A7A] min-h-screen text-white">
      {/* Hero Section */}
      <div className="container mx-auto text-center py-20">
        <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Get in Touch</h1>
        <p className="text-lg max-w-3xl mx-auto opacity-80">
          Have questions or need assistance? We're here to help! Reach out to us through any of the options below.
        </p>
      </div>

      {/* Contact Info */}
      <div className="container mx-auto grid md:grid-cols-3 gap-12 px-6 md:px-20 py-12">
        {/* Phone */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 text-center">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaPhoneAlt />
          </div>
          <h3 className="text-xl font-semibold">Call Us</h3>
          <p className="text-gray-600 mt-2">+123 456 7890</p>
        </div>

        {/* Email */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 text-center">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaEnvelope />
          </div>
          <h3 className="text-xl font-semibold">Email Us</h3>
          <p className="text-gray-600 mt-2">support@chamapay.com</p>
        </div>

        {/* Location */}
        <div className="bg-white text-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 text-center">
          <div className="text-5xl text-[#0D9488] mb-4 flex justify-center">
            <FaMapMarkerAlt />
          </div>
          <h3 className="text-xl font-semibold">Visit Us</h3>
          <p className="text-gray-600 mt-2">123 Main Street, Nairobi, Kenya</p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="container mx-auto px-6 md:px-20 py-12">
        <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-xl max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#1E3A8A]">Send Us a Message</h2>
          <form className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold">Your Name</label>
              <input type="text" className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Email Address</label>
              <input type="email" className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]" placeholder="johndoe@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold">Your Message</label>
              <textarea rows="4" className="w-full p-3 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-[#0D9488]" placeholder="Write your message here..."></textarea>
            </div>
            <button className="w-full bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 rounded-lg transition duration-300">
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Call-To-Action */}
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Need Immediate Assistance?</h2>
        <p className="text-lg opacity-80 max-w-2xl mx-auto">
          Our support team is available 24/7 to help you. Call or email us for a quick response.
        </p>
        <button className="mt-6 bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 px-6 rounded-full text-lg shadow-md transition duration-300">
          Chat with Us
        </button>
      </div>
    </section>
  );
};

export default Contact;
