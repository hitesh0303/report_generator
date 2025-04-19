import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from "react-icons/fa";
import { apiService } from "../utils/axiosConfig";

const AuthenticationPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    if (isSignup && formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }
  
    try {
      setIsLoading(true);
  
      if (isSignup) {
        const response = await apiService.register(formData);
        if (response.success) {
          setErrorMessage("");
          alert("Signup successful! Please login.");
          setIsSignup(false);
        } else {
          setErrorMessage(response.message || "Signup failed. Please try again.");
        }
      } else {
        const data = await apiService.login({
          email: formData.email,
          password: formData.password
        });
  
        if (data.token) {
          localStorage.setItem("token", data.token);
          login(data.token);
          console.log("Login successful. Token received and stored.");
          navigate("/dashboard");
        } else {
          setErrorMessage("Login failed: No token received from server");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
  
      if (error.response) {
        const status = error.response.status;
        const backendMsg = error.response.data?.message || error.message;
  
        if (status === 400) {
          setErrorMessage(
            isSignup
              ? backendMsg.includes("format")
                ? "Invalid email format. Please enter a valid email."
                : backendMsg.includes("exists")
                ? "An account with this email already exists."
                : "Signup failed. Please fill all required fields correctly."
              : "Login failed. Please check your email and password."
          );
        } else if (status === 401 || status === 403) {
          setErrorMessage(
            isSignup
              ? "Signup not allowed. Please contact support."
              : "Incorrect password. Please try again."
          );
        } else if (status === 404) {
          setErrorMessage("Server endpoint not found. Please contact support.");
        } else if (status >= 500) {
          setErrorMessage("Something went wrong on our end. Please try again later.");
        } else {
          setErrorMessage(
            `${isSignup ? "Signup" : "Login"} failed: ${backendMsg}`
          );
        }
      } else if (error.request) {
        setErrorMessage("No response from server. Please check your internet connection.");
      } else {
        setErrorMessage(`Unexpected error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-64px)]">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? "Create an account" : "Sign in to your account"}
          </h2>
        </div>
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" value="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            {isSignup && (
              <div>
                <label htmlFor="fullName" className="sr-only">
                  Full Name
                </label>
                <div className="flex items-center relative">
                  <span className="absolute left-3 text-gray-400">
                    <FaUser />
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={isSignup}
                    className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="flex items-center relative">
                <span className="absolute left-3 text-gray-400">
                  <FaEnvelope />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                    isSignup ? "" : "rounded-t-md"
                  } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="flex items-center relative">
                <span className="absolute left-3 text-gray-400">
                  <FaLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                    isSignup ? "" : "rounded-b-md"
                  } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  Confirm Password
                </label>
                <div className="flex items-center relative">
                  <span className="absolute left-3 text-gray-400">
                    <FaLock />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required={isSignup}
                    className="appearance-none rounded-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                {isSignup ? <FaUserPlus /> : <FaSignInAlt />}
              </span>
              {isLoading ? "Processing..." : isSignup ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrorMessage("");
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                {isSignup
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthenticationPage;
