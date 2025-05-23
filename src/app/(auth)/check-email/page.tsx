"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not provided. Please try logging in again.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("http://localhost:3001/api/auth/resend-verification", { email });
      toast.success("Verification email resent. Please check your inbox.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { message } = error.response.data;
        toast.error(message || "Failed to resend verification email.");
      } else {
        toast.error("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-custom text-white flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg w-full max-w-[714px] p-6 sm:p-8 shadow-lg">
        <ToastContainer position="top-right" autoClose={3000} />
        
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#136A86] mb-1">
            Verify your email address
          </h1>
          <p className="text-base sm:text-lg text-[#5CB5BD]">Welcome to FORGE</p>
        </div>

        <p className="text-sm sm:text-base text-black mb-6">
          Please click the button below to resend the verification email and activate your account.
        </p>

        {/* {email && (
          <p className="text-sm sm:text-base text-black mb-6">
            Email: {email}
          </p>
        )} */}

        <div className="flex justify-start">
          <button
            onClick={handleResend}
            className="w-full sm:w-[280px] h-[48px] text-sm sm:text-base cursor-pointer bg-[#136A86] text-white px-6 py-2 rounded-md hover:opacity-90 transition"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "RESEND EMAIL VERIFICATION"}
          </button>
        </div>
      </div>
    </div>
  );
}