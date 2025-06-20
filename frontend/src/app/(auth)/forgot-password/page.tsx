"use client";
import Image from "next/image";
import { useState } from "react";
import { useSendEmailVerification } from "@/lib/hooks/auth/useSendEmailVerification";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function EmailVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [email, setEmail] = useState("");
  const {
    mutateAsync: sendEmailVerification,
    isError,
    error,
  } = useSendEmailVerification(); // React Query mutation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(isLoading) return ;
    setIsLoading(true);
    try {
      const response = await sendEmailVerification({ email });
      setIsSuccess(true);
      console.log(response);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="flex h-screen  p-6 overflow-hidden">
      <div
        id="side-image"
        className="relative hidden md:block md:w-2/5 lg:w-[40%] h-full"
      >
        {" "}
        <Image
          src="/images/login/login-side-image.jpg"
          alt="login side bar image"
          fill
          priority
          className="object-cover rounded-l-xl  h-full"
        />
      </div>
      <div
        id="login-form"
        className="bg-[#E4F4F9] bg-opacity-10 h-full w-full md:w-3/5 lg:w-[60%] flex flex-col justify-around items-center rounded-r-xl rounded-l-xl md:rounded-l-none"
      >
        <div
          id="icon"
          className="mt-6 sm:mt-8 md:mt-10 w-[90px] md:w-[105px] lg:w-[125px]"
        >
          <Image
            src="/images/login/grande-chart.svg"
            alt="grande chart icon"
            width={125}
            height={101}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div
          id="login"
          className="flex flex-col gap-8 sm:gap-10 md:gap-6 xl:gap-8 w-full max-w-[90%] sm:max-w-[80%] md:max-w-[85%] lg:max-w-[674px] xl:w-[674px] p-4 sm:p-6 md:p-8 xl:p-0"
        >
         {
          !isSuccess && (
            <div id="indicators" className="font-semibold">
            <h1 className="font-lora font-bold text-[#136A86] sm:text-lg xl:text-xl">
              Forgot your Password ?
            </h1>
            <p className="font-light text-sm sm:text-base">
              Enter your email address and we’ll send you a link to reset your
              password.
            </p>
          </div>
          )
         }
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 sm:gap-6 md:gap-7"
            id="form"
          >
            {isError && error?.response?.status === 400 && (
              <div
                id="error"
                className="bg-red-100 text-xs sm:text-sm text-red-700 p-2 sm:p-3 rounded-t-md"
              >
                <p>{error?.response?.data?.message}.</p>
              </div>
            )}
            {isSuccess && (
              <div
                id="error"
                className="bg-green-100  sm:text-sm text-green-700 p-6 rounded-t-md lg:text-base"
              >
                <p>
                  Forgot password reset link sent successfully, check your inbox.
                </p>
              </div>
            )}

          {!isSuccess && (
            <>
              <div>
              <label
                htmlFor="email"
                className="block mb-2 font-semibold text-sm sm:text-base"
              >
                Email
              </label>

              <input
                type="text"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                placeholder="example@email.com"
                className="border border-gray-300 rounded-md w-full h-10 sm:h-12 md:h-[48px] px-3 py-2 sm:px-3.5 sm:py-3 outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-[#136A86] flex items-center ${
                isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
              } justify-center gap-2 w-full mt-2 sm:mt-3 xl:mt-4 h-10 sm:h-11 md:h-12 rounded-md text-white font-semibold text-sm sm:text-base`}
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white" />
              )}

              {isLoading ? "Loading..." : "SEND"}
            </button>
            </>
          )}
            <span className="text-right flex items-center gap-1 justify-end font-medium md:text-md -mt-2 sm:-mt-1 text-xs sm:text-sm md:text-md">
              <Image
                src="/back-arrow.svg"
                alt="back arrow"
                width={6}
                height={10}
                className=" w-[4px] h-[8px]  sm:w-[6px] sm:h-[10px]  inline-block"
              />
              Back to
              <Link
                href="/login"
                className="text-[#136A86] font-bold cursor-pointer"
              >
                {" "}
                Login
              </Link>
            </span>
          </form>
        </div>
        <div id="signup" className="mb-4 sm:mb-5 md:mb-6 xl:mb-6">
          <span className="font-light text-sm sm:text-base">
            Dont have an account ?{"  "}
            <Link
              href="/register"
              className="text-[#136A86] font-semibold cursor-pointer"
            >
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
