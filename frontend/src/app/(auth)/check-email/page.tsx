"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; 
import { Suspense } from "react";
import axiosClient from "@/lib/axios";

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckEmailContent />
    </Suspense>
  );
}

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [isLoading, setIsLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not provided. Please try logging in again.");
      return;
    }

    // Basic email format validation
    if (!emailRegex.test(email)) {
      toast.error("The provided email address is invalid...");
      return;
    }

    setIsLoading(true);
    try {
      await axiosClient.post("/auth/resend-verification", { email });
      toast.success("Verification email resent. Please check your inbox.");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error) {
      let errorMessage =
        "Unable to connect to the server. Please try again later.";

      if (axios.isAxiosError(error)) {
        if (error.response) {
          switch (error.response.status) {
            case 400:
              errorMessage =
                error.response.data.message || "Invalid request...";
              break;
            case 404:
              errorMessage = "Email address not found...";
              break;
            case 429:
              errorMessage = "Too many requests...";
              break;
            case 500:
              errorMessage = "Server error...";
              break;
            default:
              errorMessage =
                error.response.data.message || "Failed to resend...";
          }
        } else if (error.request) {
          errorMessage = "No response from server...";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-custom text-white flex items-center justify-center px-4 py-6">
      <div className="bg-white rounded-lg w-full max-w-[714px] p-6 sm:p-8 shadow-lg">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#136A86] mb-1">
            Verify your email address
          </h1>
          <p className="text-base sm:text-lg text-[#5CB5BD]">
            Welcome to {process.env.PLATFORM_NAME || "Forge"}
          </p>
        </div>

        <p className="text-sm sm:text-base text-black mb-6">
          Please click the button below to resend the verification email and
          activate your account.
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
