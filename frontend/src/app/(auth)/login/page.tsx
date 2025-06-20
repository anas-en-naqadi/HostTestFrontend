"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLogin } from "@/lib/hooks/auth/useLogin";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation"; // Use Next.js routing
import { navigate } from "@/lib/utils/navigator";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { toast } from "sonner";

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
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await login({ email, password });
      const role = response.user?.role;
      setAuth(response.token, response.user);
      if (role) router.push(`/${role}/dashboard`); // Redirect to the dashboard
    } catch (err) {
      if (isAxiosError(err) && err.status === 403) {
        toast.error(err.response?.data?.message, {
          duration: 1000,
          onAutoClose: () => {
            navigate("/check-email", { email })
          },
          onDismiss: () => {
            navigate("/check-email", { email });
          },
        });
        return;

      }
      if (isAxiosError(err) && err.status !== 400 && err.status !== 403 && err.message) {
        toast.error("Unexpected error has occured, pls try again later !!");
      }


    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isError && error && error.status === 400) toast.error(error?.response?.data?.message);
  }, [isError, error]);

  return (
    <main className="flex h-screen p-6 overflow-hidden">
      {/* Side image - hidden on small screens, visible from md breakpoint */}
      <div
        id="side-image"
        className="relative hidden md:block md:w-2/5 lg:w-[40%] h-full"
      >
        <Image
          src="/images/login/login-side-image.jpg"
          alt="login side bar image"
          fill
          priority
          className="object-cover rounded-l-xl h-full"
        />
      </div>

      {/* Login form container - full width on mobile, 60% on larger screens */}
      <div
        id="login-form"
        className="bg-[#E4F4F9] bg-opacity-10 h-full w-full md:w-3/5 lg:w-[60%] flex flex-col justify-around items-center rounded-r-xl rounded-l-xl md:rounded-l-none"
      >
        {/* Icon with responsive sizing */}
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

        {/* Login content container with responsive padding and width */}
        <div
          id="login"
          className="flex flex-col gap-8 sm:gap-10 md:gap-6 xl:gap-8 w-full max-w-[90%] sm:max-w-[80%] md:max-w-[85%] lg:max-w-[674px] xl:w-[674px] p-4 sm:p-6 md:p-8 xl:p-0"
        >
          {/* Welcome text with responsive typography */}
          <div id="indicators" className="font-semibold">
            <h1 className="font-lora font-bold text-[#136A86] text-lg sm:text-xl xl:text-2xl">
              Welcome back !
            </h1>
            <p className="font-light text-sm sm:text-base">
              Enter your email and password to access your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 sm:gap-6 md:gap-7"
            id="form"
          >

            <div>
              <label
                htmlFor="email"
                className="block mb-1 sm:mb-2 font-semibold text-sm sm:text-base"
              >
                Email
              </label>

              <input
                type="text"
                id="email"
                required
                placeholder="example@email.com"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border border-gray-300 rounded-md w-full h-10 sm:h-12 md:h-[48px] px-3 py-2 sm:px-3.5 sm:py-3 outline-none bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-1 sm:mb-2 font-semibold text-sm sm:text-base"
              >
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
                  className="border border-gray-300 rounded-md w-full h-10 sm:h-12 md:h-[48px] px-3 py-2 sm:px-3.5 sm:py-3 outline-none bg-white"
                />
                {isPasswordVisible ? (
                  <Image
                    onClick={() => setIsPasswordVisible(false)}
                    src="/eye-show.svg"
                    alt="hidden eye icon"
                    width={24}
                    height={24}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  />
                ) : (
                  <Image
                    onClick={() => setIsPasswordVisible(true)}
                    src="/eye-hidden.svg"
                    alt="hidden eye icon"
                    width={24}
                    height={24}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  />
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${isLoading ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                } bg-[#136A86] flex items-center justify-center gap-2 w-full mt-2 sm:mt-3 xl:mt-4 h-10 sm:h-11 md:h-12 rounded-md text-white font-semibold text-sm sm:text-base`}
            >
              {isLoading && (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white" />
              )}

              {isLoading ? "Logging in..." : "Login"}
            </button>
            <Link
              href="/forgot-password"
              className="text-right font-medium text-xs sm:text-sm md:text-md -mt-2 sm:-mt-1 cursor-pointer"
            >
              Forgot Password ?
            </Link>
          </form>
        </div>
        <div id="signup" className="mb-4 sm:mb-5 md:mb-6 xl:mb-6">
          <span className="font-light text-sm sm:text-base">
            Don&apos;t have an account ?{" "}
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
