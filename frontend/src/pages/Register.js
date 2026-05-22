import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/users/register",
        formData
      );

      console.log("REGISTER SUCCESS:", response.status, response.data);

      alert(
        response?.data?.message ||
          "Registration successful. Verification email sent to your inbox."
      );

      navigate("/");
    } catch (error) {
      console.log("REGISTER ERROR:", error);

      if (error.response) {
        console.log("ERROR STATUS:", error.response.status);
        console.log("ERROR DATA:", error.response.data);

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          "Registration Failed";

        alert(errorMessage);
      } else if (error.request) {
        console.log("NO RESPONSE RECEIVED:", error.request);
        alert("Server did not respond");
      } else {
        console.log("REQUEST SETUP ERROR:", error.message);
        alert(error.message || "Registration Failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create Account
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6">
          Already have an account?
          <Link to="/" className="text-blue-600 font-semibold ml-2">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;