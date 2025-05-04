"use client";
import { navigate } from "@/lib/utils/navigator";
import Image from "next/image";
import { useState } from "react";
import { resetPassword } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { Loader2, Check, X } from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";

export default function ResetPassword() {
  const token = useSearchParams().get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const rules = [
    {
      label: "At least 8 characters",
      valid: newPassword.length >= 8,
    },
    {
      label: "At least one lowercase letter",
      valid: /[a-z]/.test(newPassword),
    },
    {
      label: "At least one uppercase letter",
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: "At least one number",
      valid: /\d/.test(newPassword),
    },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];
  const match_rule = [
    {
      label:
        newPassword !== confirmPassword
          ? "Passwords must match"
          : "Passwords match",
      valid: newPassword === confirmPassword,
    },
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if(!newPassword && !confirmPassword){
        toast.warning("Please fill the inputs", {
          duration: 3000, // Duration in milliseconds
        });
        return ;
      }
      if ([...rules, ...match_rule].some((rule) => !rule.valid)) {
        toast.warning("Please match the rules", {
          duration: 3000, // Duration in milliseconds
        });
      
        return;
      }
      await resetPassword({
        new_password: newPassword,
        password_confirmation: confirmPassword,
        token,
      });
      toast.success("Password updated successfully !!", {
        duration: 1500, // Duration in milliseconds
        onAutoClose: () => {
          navigate("/login");
        },
      });
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        toast.error(
          "the token is expired, we will redirect you to verify your email again !! ",
          {
            duration: 2500, // Duration in milliseconds
            onAutoClose: () => {
              navigate("/forgot-password");
            },
          }
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="bg-[url('/images/reset-password/background.jpg')] flex items-center justify-center bg-cover bg-center min-h-screen">
      <div
        id="container"
        className="rounded-xl bg-white/90 max-w-[577px] max-h-full p-6 m-6  flex flex-col justify-center items-center gap-10"
      >
        <div id="header" className="w-full ">
          <h1 className="text-cyan-700 font-bold text-lg sm:text-xl md:text-2xl">
            Reset your Password
          </h1>
          <div className="flex gap-3 mt-3 items-center">
            <div>
              <Image
                src="/images/reset-password/lock.svg"
                alt="lock icon"
                width={20}
                height={20}
                className="w-6 "
              />
            </div>
            <div>
              <h4>Please kindly set your new password.</h4>
              <p className=" text-cyan-700/70  font-light text-sm">
                Strong passwords include numbers, letters and punctuation marks
              </p>
            </div>
          </div>
        </div>
        <form
          id="form"
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6"
        >
          <div className="w-full">
            <label htmlFor="new_password" className="block mb-2 font-semibold text-sm md:text-lg">
              New Password
            </label>

            <div className="relative">
              <input
                type={isNewPasswordVisible ? "text" : "password"}
                id="new_password"
                placeholder="**************"
                required
                onClick={() => setShowValidation(true)}
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                className="border-1 border-gray-300 rounded-md w-full h-[48px] px-3.5 py-3 outline-none bg-white"
              />
              {isNewPasswordVisible ? (
                <Image
                  onClick={() => setIsNewPasswordVisible(false)}
                  src="/eye-show.svg"
                  alt="show eye icon"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              ) : (
                <Image
                  src="/eye-hidden.svg"
                  onClick={() => setIsNewPasswordVisible(true)}
                  alt="hidden eye icon"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              )}
            </div>
            {showValidation && (
              <ul className="mt-1.5 list-none text-xs md:text-sm space-y-1">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {rule.valid ? (
                      <Check className="text-green-600 w-4 h-4" />
                    ) : (
                      <X className="text-red-500 w-4 h-4" />
                    )}
                    <span
                      className={clsx(
                        rule.valid ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="">
            <label
              htmlFor="confirm_password"
              className="block mb-2 font-semibold text-sm md:text-lg"
            >
              Confirm New Password
            </label>

            <div className="relative">
              <input
                type={isConfirmPasswordVisible ? "text" : "password"}
                id="confirm_password"
                placeholder="**************"
                required
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="border-1 border-gray-300 rounded-md w-full h-12 px-3.5 py-3 outline-none bg-white"
              />
              {isConfirmPasswordVisible ? (
                <Image
                  onClick={() => setIsConfirmPasswordVisible(false)}
                  src="/eye-show.svg"
                  alt="show eye icon"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              ) : (
                <Image
                  src="/eye-hidden.svg"
                  onClick={() => setIsConfirmPasswordVisible(true)}
                  alt="hidden eye icon"
                  width={24}
                  height={24}
                  className="absolute right-3 top-4 cursor-pointer"
                />
              )}
            </div>
            <ul className="mt-1.5 list-none text-xs md:text-sm space-y-1">
              <li className="flex items-center gap-2">
                {match_rule[0].valid ? (
                  <Check className="text-green-600 w-4 h-4" />
                ) : (
                  <X className="text-red-500 w-4 h-4" />
                )}
                <span
                  className={clsx(
                    match_rule[0].valid ? "text-green-600" : "text-red-600"
                  )}
                >
                  {match_rule[0].label}
                </span>
              </li>
            </ul>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-cyan-800 w-full flex text-sm md:text-md justify-center items-center gap-2 xl:mt-4 h-12 rounded-md text-white font-semibold"
          >
            {isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            )}

            {isLoading ? "Loading..." : "RESET PASSWORD"}
          </button>
        </form>
      </div>
    </main>
  );
}
