import { FaQuoteLeft } from "react-icons/fa";

const Testimonials = () => {
  return (
    <section className="bg-gradient-to-r from-[#0D9488] to-[#1E3A8A] py-16 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold">What Our Users Say</h2>
        <p className="text-gray-300 mt-4">Real stories from real customers.</p>

        {/* Decorative HR */}
        <div className="flex justify-center my-6">
          <div className="w-16 h-1 bg-[#FACC15] rounded-lg"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {/* Testimonial 1 */}
          <div className="bg-white text-[#1E3A8A] p-6 rounded-lg shadow-lg">
            <FaQuoteLeft className="text-4xl text-[#0D9488] mb-4" />
            <p className="text-lg">
              "ChamaPay has completely transformed how our group saves money. Super easy to use!"
            </p>
            <h4 className="mt-4 font-bold">— Jane M., Nairobi</h4>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white text-[#0D9488] p-6 rounded-lg shadow-lg">
            <FaQuoteLeft className="text-4xl text-[#1E3A8A] mb-4" />
            <p className="text-lg">
              "Security and transparency are key for us, and ChamaPay delivers on both."
            </p>
            <h4 className="mt-4 font-bold">— David K., Mombasa</h4>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white text-[#1E3A8A] p-6 rounded-lg shadow-lg">
            <FaQuoteLeft className="text-4xl text-[#0D9488] mb-4" />
            <p className="text-lg">
              "The best financial tool for groups. Highly recommend!"
            </p>
            <h4 className="mt-4 font-bold">— Aisha O., Kisumu</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;