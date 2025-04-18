import react from 'react'
import {useNavigate} from 'react-router-dom'
const PrivacyPolicy = () => {
    const navigate = useNavigate()
    return (
      <section className="bg-gradient-to-b from-[#0A2342] to-[#117A7A] min-h-screen text-white">
        {/* Header Section */}
        <div className="container mx-auto text-center py-20">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Privacy Policy</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-80">
            Your privacy is important to us. Read through our policies below to understand how we collect, use, and protect your information.
          </p>
        </div>
  
        {/* Policy Content */}
        <div className="container mx-auto px-6 md:px-20 py-12">
          <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-8">
            
            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">1. Information We Collect</h2>
              <p className="text-gray-700">
                We may collect personal identification information, including names, email addresses, phone numbers, and other relevant data when users interact with our platform.
              </p>
            </div>
  
            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">2. How We Use Your Information</h2>
              <p className="text-gray-700">
                The information we collect is used to improve user experience, provide better services, personalize content, and communicate important updates or promotional content.
              </p>
            </div>
  
            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">3. Data Security</h2>
              <p className="text-gray-700">
                We implement strict security measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
              </p>
            </div>
  
            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">4. Third-Party Services</h2>
              <p className="text-gray-700">
                We may use third-party services for analytics and communication. These providers are bound by confidentiality and data protection obligations.
              </p>
            </div>
  
            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">5. Changes to This Policy</h2>
              <p className="text-gray-700">
                We reserve the right to update our privacy policy at any time. Any changes will be posted on this page with an updated date.
              </p>
            </div>
  
            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A8A] mb-2">6. Contact Us</h2>
              <p className="text-gray-700">
                If you have any questions or concerns about our privacy practices, please feel free to contact us at <span className="text-[#0D9488]">support@chamapay.com</span>.
              </p>
            </div>
          </div>
        </div>
  
        {/* Call-To-Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            We value transparency and are always here to help. Reach out if you need further clarification.
          </p>
          <button onClick={()=>navigate('/contact-support')} className="mt-6 bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 px-6 rounded-full text-lg shadow-md transition duration-300">
            Contact Support
          </button>
        </div>
      </section>
    );
  };
  
  export default PrivacyPolicy;
  