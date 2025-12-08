import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { RiShieldCheckLine, RiBankLine, RiUserLine } from "react-icons/ri";
import HDFCLogo from "../assets/hdfc-logo.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 flex flex-col items-center text-white">
      
      {/* NAVBAR */}
      <header className="w-full py-4 px-8 flex justify-between items-center bg-blue-900/40 backdrop-blur-sm">
        <h1 className="text-2xl font-bold tracking-wide flex items-center gap-2">
  <img 
    src={HDFCLogo} 
    alt="HDFC Logo" 
    className="w-8 h-8 object-contain"
  />
   HDFC Digital KYC
</h1>

        <nav className="space-x-6 text-sm">
          <Link to="/" className="hover:text-blue-200 transition">Home</Link>
          <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
          <Link to="/register" className="hover:text-blue-200 transition">Register</Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-extrabold mb-4 drop-shadow-lg"
        >
          Seamless Digital KYC Verification
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-lg text-blue-100 max-w-2xl mb-8"
        >
          Complete your KYC securely, quickly, and 100% online.  
          Designed with HDFC-grade security and a premium user experience.
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex space-x-4"
        >
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-100 transition"
          >
            Register
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-900/70 border border-white rounded-xl shadow-lg font-semibold hover:bg-blue-900 transition"
          >
            Login
          </Link>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full bg-white text-gray-800 py-12 px-8 mt-10 rounded-t-3xl shadow-2xl"
      >
        <h2 className="text-center text-3xl font-bold mb-10">Why Choose HDFC Digital KYC?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">

          <FeatureCard
            icon={<RiShieldCheckLine className="text-blue-700" size={40} />}
            title="Bank-Level Security"
            subtitle="Your documents & personal data are protected with enterprise-grade encryption."
          />

          <FeatureCard
            icon={<RiBankLine className="text-blue-700" size={40} />}
            title="Instant Verification"
            subtitle="Upload your ID and get verification updates in real-time."
          />

          <FeatureCard
            icon={<RiUserLine className="text-blue-700" size={40} />}
            title="Simple & Paperless"
            subtitle="No branch visit required. No forms. Complete KYC digitally in minutes."
          />

        </div>
      </motion.section>

      <footer className="text-blue-100 py-6">
        © 2025 HDFC Bank — Digital KYC System.
      </footer>
    </div>
  );
}

/* FEATURE CARD COMPONENT */
function FeatureCard({ icon, title, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="p-6 rounded-2xl shadow-lg border border-blue-100 bg-white hover:bg-blue-50 transition"
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </motion.div>
  );
}
