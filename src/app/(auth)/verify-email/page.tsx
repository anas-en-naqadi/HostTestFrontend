"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  // const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "expired">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    
    const verifyEmail = async () => {
    setStatus("loading");
    try {
      await axios.post("http://localhost:3001/api/auth/verify-email", { token });
      setStatus("success");
      toast.success("Email verified successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const { message } = error.response.data;
          
          // Check if the error is due to token expiration/account deletion
          if (message.includes("Invalid or expired verification token")) {
            setStatus("expired");
            setErrorMessage("Your verification link has expired. Your account has been removed from our system for security reasons.");
            toast.error("Verification link expired. Please register again.");
          } else {
            setStatus("error");
            setErrorMessage(message || "Failed to verify email.");
            toast.error(message || "Failed to verify email.");
          }
        } else {
          setStatus("error");
          setErrorMessage("Unable to connect to the server. Please try again later.");
          toast.error("Unable to connect to the server. Please try again later.");
        }
      } else {
        setStatus("error");
        setErrorMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
    }
  };
  
  if (token) {
    verifyEmail();
  } else {
    setStatus("error");
    setErrorMessage("Invalid verification link");
  }
}, [token, router]);
  // const handleResend = async () => {
  //   if (!email) {
  //     toast.error("Email not provided. Please register again.");
  //     return;
  //   }

  //   setIsResending(true);
  //   try {
  //     await axios.post("http://localhost:3001/api/auth/resend-verification", {
  //       email,
  //     });
  //     toast.success("Verification email resent. Please check your inbox.");
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       if (error.response) {
  //         const { message } = error.response.data;
  //         // Check if user not found (likely deleted due to expiration)
  //         if (message.includes("User not found")) {
  //           setStatus("expired");
  //           setErrorMessage("Your account has been removed due to verification timeout. Please register again.");
  //           toast.error("Account not found. Please register again.");
  //         } else {
  //           toast.error(message || "Failed to resend verification email.");
  //         }
  //       } else {
  //         toast.error("Unable to connect to the server. Please try again later.");
  //       }
  //     } else {
  //       toast.error("An unexpected error occurred.");
  //     }
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  return (
    <div className="min-h-screen w-full bg-gradient-custom text-white flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg w-full max-w-[714px] p-6 sm:p-8 shadow-lg">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Loader / Success / Error Icon */}
        {status === "loading" ? (
          <div className="mb-6 flex justify-center">
            <div
              className="w-12 h-12 border-4 border-[#136A86] border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="Loading"
            />
          </div>
        ) : status === "success" ? (
          <div className="mb-6 text-[40px] text-[#71BF44]">
            <FaCheckCircle />
          </div>
        ) : (status === "error" || status === "expired") && (
          <div className="mb-6 text-[40px] text-red-500">
            <FaTimesCircle />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-[#136A86] mb-2">
          {status === "success" 
            ? "Your email has been confirmed" 
            : status === "expired" 
              ? "Verification Link Expired" 
              : "Verify Your Email"}
        </h1>

        <p className="text-sm sm:text-base text-black mb-6">
          {status === "success"
            ? "Thank you for validating your email. You can now continue to use FORGE."
            : status === "expired"
              ? "Your verification link has expired (valid for 24 hours from registration). For security reasons, your account has been removed from our system. Please register again to continue."
              : errorMessage || "Please verify your email to continue."}
        </p>

        {/* {status === "error" && (
          <div className="mb-6">
            <button
              onClick={handleResend}
              className="w-full sm:w-[280px] h-[48px] text-sm sm:text-base cursor-pointer bg-[#136A86] text-white px-6 py-2 rounded-md hover:opacity-90 transition"
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend Verification Email"}
            </button>
          </div>
        )} */}

        {status === "expired" && (
          <div className="mb-6">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-[280px] h-[48px] text-sm sm:text-base cursor-pointer bg-[#136A86] text-white px-6 py-2 rounded-md hover:opacity-90 transition"
            >
              REGISTER AGAIN
            </button>
          </div>
        )}

        {status === "success" && (
          <div className="flex justify-start">
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-[280px] h-[48px] text-sm sm:text-base cursor-pointer bg-[#136A86] text-white px-6 py-2 rounded-md hover:opacity-90 transition"
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}