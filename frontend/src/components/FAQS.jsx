import react from 'react'
import {useNavigate} from 'react-router-dom'
const FAQs = () => {

    const navigate = useNavigate()
    const faqData = [
      {
        question: "What is Chamapay?",
        answer:
          "Chamapay is a secure platform that allows users to manage, send, and receive payments with ease. It’s designed to simplify financial transactions for both individuals and businesses.",
      },
      {
        question: "Is Chamapay free to use?",
        answer:
          "Yes, creating an account and using basic services on Chamapay is completely free. Certain premium features or services may involve small transaction fees.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "To reset your password, click on the 'Forgot Password' link on the login page, and follow the instructions sent to your registered email address.",
      },
      {
        question: "Is my data secure with Chamapay?",
        answer:
          "Absolutely. We use top-level encryption and strict privacy policies to protect your data and financial transactions.",
      },
      {
        question: "Can I link multiple bank accounts?",
        answer:
          "Yes, Chamapay supports linking multiple bank accounts for easier and faster transactions, all managed in one secure dashboard.",
      },
    ];
  
    return (
      <section className="bg-gradient-to-b from-[#0A2342] to-[#117A7A] min-h-screen text-white">
        {/* Hero Section */}
        <div className="container mx-auto text-center py-20">
          <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Frequently Asked Questions</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-80">
            Got questions? We've got answers. Check out our most commonly asked questions below.
          </p>
        </div>
  
        {/* FAQ List */}
        <div className="container mx-auto px-6 md:px-20 py-12">
          <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-xl max-w-4xl mx-auto space-y-8">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h3 className="text-xl font-semibold text-[#1E3A8A] mb-2">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
  
        {/* Call-To-Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Didn't find your answer?</h2>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Our support team is here to assist you 24/7. Don’t hesitate to get in touch!
          </p>
          <button onClick={()=>navigate('/contact-support')} className="mt-6 bg-[#0D9488] hover:bg-[#117A7A] text-white font-semibold py-3 px-6 rounded-full text-lg shadow-md transition duration-300">
            Contact Support
          </button>
        </div>
      </section>
    );
  };
  
  export default FAQs;
  