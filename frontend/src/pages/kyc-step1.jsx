import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiArrowRightLine, RiUploadCloudLine } from "react-icons/ri";

export default function KYCStep1() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    fatherName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gender: "",
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("Only JPG or PNG images allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Max upload size is 2MB.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    if (!form.fullName || !form.dob || !form.fatherName || !form.address) {
      alert("Please fill all required fields.");
      return false;
    }
    if (!photo) {
      alert("Please upload a passport-size photo.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;

    // Save personal details
    localStorage.setItem("kycPersonal", JSON.stringify(form));

    // Save photo temporarily (Base64)
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("kycPhoto", reader.result);
      navigate("/kyc-step2");
    };
    reader.readAsDataURL(photo);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
      >
        <h2 className="text-blue-700 font-bold text-xl mb-2">Step 1 of 5</h2>
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
          Personal Information
        </h1>

        {/* GRID INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="fullName"
            placeholder="Full Name*"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <input
            name="dob"
            placeholder="Full Name*"
            type="date"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <input
            name="fatherName"
            placeholder="Father's Name*"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <select
            name="gender"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          <input
            name="city"
            placeholder="City"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <input
            name="state"
            placeholder="State"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />

          <input
            name="pincode"
            placeholder="Pincode"
            className="p-3 border rounded-xl"
            onChange={handleChange}
          />
        </div>

        {/* ADDRESS */}
        <textarea
          name="address"
          placeholder="Full Address*"
          rows="3"
          className="w-full p-3 border rounded-xl mt-4"
          onChange={handleChange}
        />

        {/* PASSPORT PHOTO UPLOAD */}
        <div className="mt-6">
          <label className="font-semibold text-gray-700">Passport-size Photo*</label>

          <div
            className="w-full mt-2 h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition"
            onClick={() => fileRef.current.click()}
          >
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            {!photoPreview ? (
              <div className="text-center text-gray-500">
                <RiUploadCloudLine className="mx-auto text-3xl text-blue-600" />
                <p>Upload Passport-size Photo</p>
              </div>
            ) : (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-full rounded-xl object-cover"
              />
            )}
          </div>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleNext}
          className="w-full mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 shadow-md"
        >
          Next <RiArrowRightLine size={22} />
        </button>
      </motion.div>
    </div>
  );
}
