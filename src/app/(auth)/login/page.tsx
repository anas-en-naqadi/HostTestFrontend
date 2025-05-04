"use client";
import Image from "next/image";
import { useState } from "react";
import { useLogin } from "@/lib/hooks/auth/useLogin";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from 'next/navigation'; // Use Next.js routing
import { navigate } from "@/lib/utils/navigator";
import { Loader2 } from "lucide-react";
import { isAxiosError } from 'axios';
import Link from "next/link";

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { mutateAsync: login, isError, error } = useLogin(); // React Query mutation
  const setAuth = useAuthStore((state) => state.setAuth); // Zustand to update global auth state
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await login({ email, password });

      setAuth(response.token, response.user);

      router.push('/intern/dashboard'); // Redirect to the dashboard
    } catch (err) {
      if (isAxiosError(err) && err.status === 403) {
        navigate("/check-email", { email });
      }
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
        className="bg-cyan-100/70 bg-opacity-10 h-full w-full xl:w-[60%] md:w-[60%] flex flex-col justify-around items-center rounded-r-xl "
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
          className="flex flex-col xl:gap-17 gap-20 2xl:w-[674px] xl:w-[674px] p-10 xl:p-0"
        >
          <div id="indicators" className="font-semibold">
            <h1 className="font-lora font-bold text-cyan-700 xl:text-2xl text-xl">
              Welcome back !
            </h1>
            <p className="font-light">
              Enter your email and password to access your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-7"
            id="form"
          >
            {isError &&
              (error?.response?.status === 401 ||
                error?.response?.status === 400) && (
                <div
                  id="error"
                  className="bg-red-100 text-sm text-red-700 p-3 rounded-t-md"
                >
                  <p>{error?.response?.data?.message}.</p>
                </div>
              )}
            <div className="">
              <label htmlFor="email" className="block mb-2 font-semibold">
                Email
              </label>

              <input
                type="text"
                id="email"
                required
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border-1 border-gray-300 rounded-md w-full h-[48px] px-3.5 py-3 outline-none bg-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  id="password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  placeholder="*******************"
                  className="border-1 border-gray-300 rounded-md w-full h-[48px] px-3.5 py-3 outline-none bg-white"
                />
                {isPasswordVisible ? (
                  <Image
                    onClick={() => setIsPasswordVisible(false)}
                    src="/eye-show.svg"
                    alt="hidden eye icon"
                    width={24}
                    height={24}
                    className="absolute right-3 top-4 cursor-pointer"
                  />
                ) : (
                  <Image
                    onClick={() => setIsPasswordVisible(true)}
                    src="/eye-hidden.svg"
                    alt="hidden eye icon"
                    width={24}
                    height={24}
                    className="absolute right-3 top-4 cursor-pointer"
                  />
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-cyan-800 flex items-center justify-center gap-2 w-full mt-2 xl:mt-4 h-12 rounded-md text-white font-semibold"
            >
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              )}

              {isLoading ? "Logging in..." : "Login"}
            </button>
            <Link
              href="/forgot-password"
              className="text-right font-medium md:text-md -mt-2 text-sm"
            >
              Forgot Password ?
            </Link>
          </form>
        </div>
        <div id="signup" className="xl:mb-6  mb-3 sm:mb-4 md:-mb-6">
          <span className="font-light">
            Don&apos;t have an account ?{" "}
            <Link href="/register" className="text-cyan-700 font-semibold">
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
