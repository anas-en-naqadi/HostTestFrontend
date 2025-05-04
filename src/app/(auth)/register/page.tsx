"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Eye, EyeOff } from "lucide-react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Image from "next/image";

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
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    specialChar: false,
  });

  const validateForm = () => {
    const newErrors: Partial<RegisterForm> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!emailRegex.test(form.email))
      newErrors.email = "Please enter a valid email address";
    if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
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
      await axios.post("http://localhost:3001/api/auth/register", {
        full_name: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        password_confirmation: form.confirmPassword,
      });

      toast.success("Registration successful! Please verify your email.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        const { message, errors: backendErrors } = data;

        if (status === 429) {
          toast.error(
            "Too many registration attempts. Please try again in a few minutes."
          );
          return;
        }

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // Update form state
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));

    // Clear the specific error when the user starts typing
    setErrors((prevErrors) => ({
      ...prevErrors,
      [id]: undefined,
    }));

    // Real-time validation for each field
    const newErrors: Partial<RegisterForm> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    // Validate based on the field that was changed
    switch (id) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Full name is required";
        }
        break;
      case "username":
        if (!value.trim()) {
          newErrors.username = "Username is required";
        } else if (value.length < 3 || value.length > 20) {
          newErrors.username = "Username must be 3-20 characters long";
        } else if (!usernameRegex.test(value)) {
          newErrors.username =
            "Username can only contain letters, numbers, and underscores";
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
        // Update password strength indicators
        setPasswordRules({
          length: value.length >= 8,
          uppercase: /[A-Z]/.test(value),
          lowercase: /[a-z]/.test(value),
          digit: /\d/.test(value),
          specialChar: /[@$!%*?&]/.test(value),
        });

        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
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
    <div className="min-h-screen flex overflow-hidden m-5">
      <div className="hidden md:flex md:flex-col md:justify-between md:w-1/2 h-full fixed">
        <div className="flex-grow overflow-hidden relative">
          {" "}
          {/* Must add 'relative' when using 'fill' */}
          <Image
            src="/register.jpg"
            alt="E-learning illustration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={true} // Recommended for above-the-fold images
          />
        </div>
        <div className="h-5 mt-5"></div>
      </div>

      <div className="w-full md:w-1/2 bg-[#E4F4F9] md:ml-auto min-h-screen p-5 md:p-8">
        <div className="max-w-2xl mx-auto md:p-5">
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="flex justify-center md:mt-[100px] mb-8">
            <Image
              src="/Group 237779.svg"
              alt="Forge logo"
              width={125}
              height={101.25}
              className="w-[125px] h-[101.25px]"
            />
          </div>

          <div className="mb-6 mt-[60px]">
            <h1 className="text-[26px] font-bold text-[#136A86]">
              Create an account
            </h1>
            <p className="text-[16px] text-[#000000] mt-1">
              Enter your personal details and start learning with us!
            </p>
          </div>

          <form className="space-y-6 mt-[60px]" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs text-[#000000]">
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
              </div>
              <div className="space-y-1">
                <Label htmlFor="username" className="text-xs text-[#000000]">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  className="border-[#DCDCDC] placeholder:text-[#A0A5AC] text-sm bg-white h-12"
                  aria-invalid={!!errors.username}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-red-600 text-xs">{errors.username}</p>
                )}
              </div>
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

              <div className="text-xs mt-1 space-y-1">
                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.length ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.length ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.length ? "text-red-500" : "hidden"
                    }
                  />
                  At least 8 characters
                </p>

                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.uppercase ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.uppercase ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.uppercase ? "text-red-500" : "hidden"
                    }
                  />
                  At least one uppercase letter
                </p>

                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.lowercase ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.lowercase ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.lowercase ? "text-red-500" : "hidden"
                    }
                  />
                  At least one lowercase letter
                </p>

                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.digit ? "text-[#71BF44]" : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.digit ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={!passwordRules.digit ? "text-red-500" : "hidden"}
                  />
                  At least one digit
                </p>

                <p
                  className={`flex items-center gap-2 ${
                    passwordRules.specialChar
                      ? "text-[#71BF44]"
                      : "text-red-500"
                  }`}
                >
                  <FaCheckCircle
                    className={
                      passwordRules.specialChar ? "text-[#71BF44]" : "hidden"
                    }
                  />
                  <FaTimesCircle
                    className={
                      !passwordRules.specialChar ? "text-red-500" : "hidden"
                    }
                  />
                  At least one special character (@$!%*?&)
                </p>
              </div>
              {/* {errors.password && (
                <p className="text-red-600 text-xs">{errors.password}</p>
              )} */}
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
                <p className="text-red-600 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="xl:h-[48px] cursor-pointer w-full bg-[#1B7D8C] hover:bg-[#136A86] text-white py-3 mt-6 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "SIGN UP"}
            </Button>
          </form>

          <div className="text-center mt-6 pb-8">
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
