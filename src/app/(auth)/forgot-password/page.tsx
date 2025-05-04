"use client";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSendEmailVerification } from "@/lib/hooks/auth/useSendEmailVerification";

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
      <div id="side-image" className="relative w-[40%] h-full hidden md:block ">
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
        className="bg-cyan-100/70 h-full w-full xl:w-[60%] md:w-[60%] flex flex-col justify-around items-center rounded-l-xl md:rounded-l-none  rounded-r-xl"
      >
        <div id="icon" className=" mt-10">
          <Image
            src="/images/login/grande-chart.svg"
            alt="grande chart icon"
            width={125}
            height={101}
            
          />
        </div>
        <div
          id="login"
          className="flex flex-col xl:gap-17 gap-20 2xl:w-[674px] xl:w-[674px] p-10 xl:p-0 mt-20"
        >
          <div id="indicators" className="font-semibold">
            <h1 className="font-lora font-bold text-cyan-700 text-xl">
              Forgot your Password ?
            </h1>
            <p className="font-light">
              Enter your email address and we’ll send you a link to reset your
              password.
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-7"
            id="form"
          >
            {isError && error?.response?.status === 400 && (
              <div
                id="error"
                className="bg-red-100 text-sm text-red-700 p-3 rounded-t-md"
              >
                <p>{error?.response?.data?.message}.</p>
              </div>
            )}
            {isSuccess && (
              <div
                id="error"
                className="bg-green-100 text-sm text-green-700 p-3 rounded-t-md"
              >
                <p>
                  Email Verification link sent successfully, check your inbox.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block mb-2 font-semibold">
                Email
              </label>

              <input
                type="text"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
                placeholder="example@email.com"
                className="border-1 border-gray-300 rounded-md w-full h-[48px] px-3.5 py-3 outline-none bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-700 w-full flex justify-center items-center gap-2 mt-2 xl:mt-4 h-12 rounded-md text-white font-semibold"
            >
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              )}

              {isLoading ? "Loading..." : "SEND"}
            </button>
            <span className="text-right font-medium md:text-md -mt-2 text-sm">
              <Image
                src="/back-arrow.svg"
                alt="back arrow"
                width={8}
                height={6}
                className=" w-3 h-2 inline-block"
              />
              Back to {' '}
              <Link href="/login" className="text-cyan-700 font-bold">
                Login
              </Link>
            </span>
          </form>
        </div>
        <div id="signup" className="xl:mb-6 mb-3 sm:mb-4 md:-mb-6">
          <span className="font-light">
            Dont have an account ?  {' '}
            <Link href="/register" className="text-cyan-700 font-semibold">
               Sign Up
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
