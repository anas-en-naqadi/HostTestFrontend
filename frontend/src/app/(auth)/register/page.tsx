"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Image from "next/image";
import axiosClient from "@/lib/axios";

interface RegisterForm {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });
  const [hasInteractedWithPassword, setHasInteractedWithPassword] =
    useState(false);

  const validateForm = () => {
    const newErrors: Partial<RegisterForm> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // In the validateForm function:
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (/[^a-zA-Z\s]/.test(form.fullName)) {
      newErrors.fullName =
        "Full name should not contain special characters or numbers";
    } else if (form.fullName.trim().length < 3) {
      newErrors.fullName = "Please enter at least 3 characters";
    }
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!emailRegex.test(form.email))
      newErrors.email = "Please enter a valid email address";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (!form.password.trim() && hasInteractedWithPassword)
      newErrors.password = "Password is required";
    if (!form.confirmPassword.trim())
      newErrors.confirmPassword = "Confirm password is required";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axiosClient.post("/auth/register", {
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });
      setIsSuccess(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errors: backendErrors } = data;

        const newErrors: Partial<RegisterForm> = {};

        // Handle structured errors from backend (e.g., 422, 400)
        if (backendErrors) {
          if (backendErrors.full_name)
            newErrors.fullName = backendErrors.full_name;
          if (backendErrors.username)
            newErrors.username = backendErrors.username;
          if (backendErrors.email) newErrors.email = backendErrors.email;
          if (backendErrors.password)
            newErrors.password = backendErrors.password;
          if (backendErrors.password_confirmation)
            newErrors.confirmPassword = backendErrors.password_confirmation;
        }
        // Handle simple message string errors
        else if (message) {
          if (message.toLowerCase().includes("email")) {
            newErrors.email = message;
          } else if (message.toLowerCase().includes("username")) {
            newErrors.username = message;
          } else if (message.toLowerCase().includes("password")) {
            newErrors.password = message;
          } else if (message.toLowerCase().includes("name")) {
            newErrors.fullName = message;
          } else {
            toast.error(message || "Registration failed. Please try again.");
          }
        } else {
          toast.error("Registration failed. Please try again.");
        }

        setErrors(newErrors);
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const generateUsername = (fullName: string) => {
    if (!fullName) return "";

    // Replace spaces with underscores and convert to lowercase
    const baseUsername = "@" + fullName.toLowerCase().replace(/\s+/g, "_");

    // Add random 3-digit number for uniqueness
    const randomNum = Math.floor(Math.random() * 900) + 100; // Random number between 100-999

    return `${baseUsername}${randomNum}`;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,

      ...(id === "fullName" && { username: generateUsername(value) }),
    }));

    // Clear the specific error when the user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: undefined,
    }));

    // Real-time validation for each field
    const newErrors: Partial<RegisterForm> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate based on the field that was changed
    switch (id) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Full name is required";
        } else if (/[^a-zA-Z\s]/.test(value)) {
          newErrors.fullName =
            "Full name should not contain special characters or numbers";
        }

        break;
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Please enter a valid email address";
        }
        break;
      case "password":
        if (!hasInteractedWithPassword) {
          setHasInteractedWithPassword(true);
        }

        // Update password strength indicators
        setPasswordRules({
          length: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          lowercase: /[a-z]/.test(value),
          digit: /\d/.test(value),
          specialChar: /[@$!%*?&]/.test(value),
        });

        if (!value && !hasInteractedWithPassword) {
          newErrors.password = "Password is required";
        }

        // Also check if confirm password now matches
        if (form.confirmPassword && value !== form.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (form.confirmPassword) {
          // Clear confirm password error if they now match
          setErrors((prevErrors) => ({
            ...prevErrors,
            confirmPassword: undefined,
          }));
        }
        break;
      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== form.password) {
          newErrors.confirmPassword = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    // Update errors for the changed field
    setErrors((prevErrors) => ({
      ...prevErrors,
      ...newErrors,
    }));
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden md:flex md:flex-col md:justify-between md:w-1/2 h-full fixed">
        <div className="flex-grow overflow-hidden relative m-5">
          {" "}
          <Image
            src="/register.jpg"
            alt="E-learning illustration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true} // Recommended for above-the-fold images
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-[#E4F4F9] md:ml-auto p-5 md:p-8 m-5 overflow-auto max-h-screen">
        <div className="max-w-2xl mx-auto md:p-5 flex flex-col">
          <div className="flex justify-center mt-2 mb-4 md:mt-4">
            <Image
              src="/Group 237779.svg"
              alt={`${process.env.PLATFORM_NAME || "Forge"} logo`}
              width={100}
              height={81}
              className="w-[80px] h-[65px] sm:w-[90px] sm:h-[73px] md:w-[100px] md:h-[81px]"
            />
          </div>

          {isSuccess && (
            <div className="w-full  h-full flex flex-col justify-center items-center mt-[40%] bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <FaCheckCircle className="text-green-500 text-2xl mr-2" />
                <h3 className="text-lg font-semibold text-green-800">
                  Registration Successful!
                </h3>
              </div>
              <p className="text-green-700">
                Please check your inbox to verify your account before signing
                in.
              </p>
            </div>
          )}
          {!isSuccess && (
            <>
              <div className="mb-4 mt-6">
                <h1 className="text-[22px] font-bold text-[#136A86]">
                  Create an account
                </h1>
                <p className="text-[14px] text-[#000000] mt-1">
                  Enter your personal details and start learning with us!
                </p>
              </div>

              <form className="space-y-6 mt-[40px]" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label
                      htmlFor="fullName"
                      className="text-xs text-[#000000]"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.fullName}
                      onChange={handleChange}
                      className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm bg-white h-12"
                      aria-invalid={!!errors.fullName}
                      disabled={isLoading}
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-xs">{errors.fullName}</p>
                    )}
                    <p className="text-amber-600 dark:text-amber-400 text-xs font-medium mt-1">
                      ⚠️ Enter your full legal name for certificate issuance
                    </p>
                  </div>
                  {/* <div className="space-y-1">
                <Label htmlFor="username" className="text-xs text-[#000000]">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  disabled
                  onChange={handleChange}
                  className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm bg-white h-12"
                  aria-invalid={!!errors.username}
                />
                {errors.username && (
                  <p className="text-red-600 text-xs">{errors.username}</p>
                )}
              </div> */}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs text-[#000000]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm bg-white h-12"
                    aria-invalid={!!errors.email}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs text-[#000000]">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={form.password}
                      onChange={handleChange}
                      className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm pr-10 bg-white h-12"
                      aria-invalid={!!errors.password}
                      disabled={isLoading}
                    />
                    {showPassword ? (
                      <Image
                        onClick={() => setShowPassword(false)}
                        src="/eye-show.svg"
                        alt="show password icon"
                        width={24}
                        height={24}
                        className="absolute right-3 top-4 cursor-pointer"
                      />
                    ) : (
                      <Image
                        onClick={() => setShowPassword(true)}
                        src="/eye-hidden.svg"
                        alt="hide password icon"
                        width={24}
                        height={24}
                        className="absolute right-3 top-4 cursor-pointer"
                      />
                    )}
                  </div>

                  {hasInteractedWithPassword && (
                    <div className="text-xs mt-1 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-x-1 gap-y-0.5">
                      <p
                        className={`flex items-center gap-1 ${
                          passwordRules.length
                            ? "text-[#71BF44]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordRules.length ? (
                          <FaCheckCircle size={12} />
                        ) : (
                          <FaTimesCircle size={12} />
                        )}
                        Min 8 chars
                      </p>
                      <p
                        className={`flex items-center gap-1 ${
                          passwordRules.uppercase
                            ? "text-[#71BF44]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordRules.uppercase ? (
                          <FaCheckCircle size={12} />
                        ) : (
                          <FaTimesCircle size={12} />
                        )}
                        Uppercase (A-Z)
                      </p>
                      <p
                        className={`flex items-center gap-1 ${
                          passwordRules.lowercase
                            ? "text-[#71BF44]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordRules.lowercase ? (
                          <FaCheckCircle size={12} />
                        ) : (
                          <FaTimesCircle size={12} />
                        )}
                        Lowercase (a-z)
                      </p>
                      <p
                        className={`flex items-center gap-1 ${
                          passwordRules.digit
                            ? "text-[#71BF44]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordRules.digit ? (
                          <FaCheckCircle size={12} />
                        ) : (
                          <FaTimesCircle size={12} />
                        )}
                        Number (0-9)
                      </p>
                      <p
                        className={`flex items-center gap-1 ${
                          passwordRules.specialChar
                            ? "text-[#71BF44]"
                            : "text-red-500"
                        }`}
                      >
                        {passwordRules.specialChar ? (
                          <FaCheckCircle size={12} />
                        ) : (
                          <FaTimesCircle size={12} />
                        )}
                        Symbol (@$!%*?&)
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-red-600 text-xs">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-xs text-[#000000]"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm pr-10 bg-white h-12"
                      aria-invalid={!!errors.confirmPassword}
                      disabled={isLoading}
                    />
                    {showConfirmPassword ? (
                      <Image
                        onClick={() => setShowConfirmPassword(false)}
                        src="/eye-show.svg"
                        alt="show password icon"
                        width={24}
                        height={24}
                        className="absolute right-3 top-4 cursor-pointer"
                      />
                    ) : (
                      <Image
                        onClick={() => setShowConfirmPassword(true)}
                        src="/eye-hidden.svg"
                        alt="hide password icon"
                        width={24}
                        height={24}
                        className="absolute right-3 top-4 cursor-pointer"
                      />
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-xs">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="xl:h-[48px] cursor-pointer w-full bg-[#136A86] hover:bg-[#5CB5BD] text-white py-3 mt- rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "SIGN UP"}
                </Button>
              </form>
            </>
          )}

          <div className="text-center mt-6 pb-2">
            <p className="text-[16px] text-black">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#136A86] font-bold hover:text-[#1B7D8C]"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
