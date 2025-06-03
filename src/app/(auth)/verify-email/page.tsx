"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import axiosClient from "@/lib/axios";
import { navigate } from "@/lib/utils/navigator";


export default function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const hashedId = searchParams.get("ref") || "";
  // const email = searchParams.get("email") || "";
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "expired" | "verified"
  >("idle");

  // const [isResending, setIsResending] = useState(false);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current || !token || !hashedId) return;

    hasVerified.current = true;

    const verifyEmail = async () => {
      setStatus("loading");
      try {
        await axiosClient.post("/auth/verify-email", { token, hashedId });
        setStatus("success");
        toast.success("Email verified successfully!", {
          duration: 1200,
          onAutoClose: () => {
            navigate("/login");
          },
          onDismiss: () => {
            navigate("/login");
          },
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            const { message } = error.response.data;

            // Check if the error is due to token expiration/account deletion
            if (
              message.includes("Invalid or expired verification token") ||
              message.includes("Invalid user ID")
            ) {
              setStatus("expired");
            } else if (message.includes("Email already verified")) {
              setStatus("verified");
              toast.error(message);
            } else {
              setStatus("error");
              toast.error(message || "Failed to verify email.");
            }
          } else {
            setStatus("error");

            toast.error(
              "Unable to connect to the server. Please try again later."
            );
          }
        } else {
          setStatus("error");

          toast.error("An unexpected error occurred.");
        }
      }
    };

    if (token && hashedId) {
      verifyEmail();
    } else {
      toast.error("Invalid verification link");
    }
  }, [token, hashedId, router]);

  return (
    <div className="min-h-screen w-full bg-gradient-custom text-white flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg w-full max-w-[714px] p-6 sm:p-8 shadow-lg">
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
        ) : (
          <div className="mb-6 text-[40px] text-red-500">
            <FaTimesCircle />
          </div>
        )}

      {status !== "loading" && (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#136A86] mb-2">
          {status === "success"
            ? "Your email has been verified"
            : status === "expired"
            ? "Verification Link Expired"
            : status === "verified"
            ? "Your Email already verified, ready to login in "
            : "Error !!"}
        </h1>

        <p className="text-sm sm:text-base text-black mb-6">
          {status === "success"
            ? "Thank you for validating your email. You can redirect to login to continue use FORGE."
            : status === "expired"
            ? "Your verification link has expired (valid for 24 hours from registration). For security reasons, your account has been removed from our system. Please register again to continue."
            : status === "verified"
            ? "Your Email is Already Verified"
            : "Oops, something went wrong !!"}
        </p>

        {status === "expired" && (
          <div className="mb-6">
            <button
              onClick={() => router.push("/register")}
              className="w-full sm:w-[280px] h-[48px] text-sm sm:text-base cursor-pointer bg-[#136A86] text-white px-6 py-2 rounded-md hover:opacity-90 transition"
            >
              REGISTER AGAIN
            </button>
          </div>
        )}</>
      )}
      </div>
    </div>
  );
}
