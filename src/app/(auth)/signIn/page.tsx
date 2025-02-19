"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Aclonica } from "next/font/google";
const aclonica = Aclonica({
  subsets: ["latin"],
  weight: "400",
});
const LoginPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [emailError, setEmailError] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    validateFields();
  }, [email, password]);

  const validateFields = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validasi sederhana untuk email
    setEmailError(!emailRegex.test(email));
    setPasswordError(password.length < 6);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (emailError || passwordError) {
      setError("Email atau Password yang kamu masukan mungkin salah");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/admin");
      } else {
        setError("Failed! Invalid email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white mx-5 md:mx-20">
      <div className="mt-5">
        <button
          onClick={() => router.push("/")}
          className="bg-primary-50 p-2 inline-flex items-center rounded-md text-primary font-medium"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Home
        </button>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <h1
          className={`${aclonica.className} text-xl md:text-[32px] my-4 text-primary`}
        >
          HR COMPUTER
        </h1>

        <div className="w-full custom-border bg-white rounded-md md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
              Sign in to your account
            </h1>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 md:space-y-6"
              action="#"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-gray-50 border ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                  placeholder="name@company.com"
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid email address.
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className={`bg-gray-50 border ${
                    passwordError ? "border-red-500" : "border-gray-300"
                  } text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-red-500 text-xs mt-1">
                    Password must be at least 6 characters.
                  </p>
                )}
              </div>
              {error && (
                <div className="w-full items-center text-red-500 font-medium bg-red-500/10 rounded-lg border border-red-500 text-sm mb-4 px-4 py-2 inline-flex">
                  <ExclamationCircleIcon className="w-6 h-6 mr-2" />
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                {isLoading ? "Loading..." : "Sign In"}
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link
                  href={"/signUp"}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
