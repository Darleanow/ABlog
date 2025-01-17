"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { motion } from "framer-motion";
import { useRouter, redirect } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

export default function AuthForm() {
  const router = useRouter();
  const { user, signUp, signIn, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if user is already logged in
  if (!loading && user) {
    redirect("/");
  }

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;

    if (!email || !password || (isSignUp && !fullName)) {
      setLocalError("Please fill in all required fields");

      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password, email.split("@")[0], fullName);
      } else {
        await signIn(email, password);
      }
      router.push("/");
    } catch (err: any) {
      setLocalError(err.message || "Authentication failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-16 p-6 bg-content1 shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isSignUp ? "Create Your Account" : "Welcome Back"}
      </h2>

      {(error || localError) && (
        <p className="text-danger text-center mb-4">{localError ?? error}</p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignUp && (
          <Input
            isRequired
            classNames={{
              input: "bg-transparent",
              innerWrapper: "bg-transparent",
            }}
            label="Full Name"
            name="name"
            placeholder="Enter your full name"
            size="lg"
          />
        )}
        <Input
          isRequired
          classNames={{
            input: "bg-transparent",
            innerWrapper: "bg-transparent",
          }}
          label="Email"
          name="email"
          placeholder="Enter your email"
          size="lg"
          type="email"
        />
        <Input
          isRequired
          classNames={{
            input: "bg-transparent",
            innerWrapper: "bg-transparent",
          }}
          label="Password"
          name="password"
          placeholder="Enter your password"
          size="lg"
          type="password"
        />
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500"
          size="lg"
          type="submit"
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </Button>
      </form>

      <div className="text-center mt-6 text-sm text-default-600">
        {isSignUp ? (
          <p>
            Already have an account?{" "}
            <button
              className="text-orange-500 hover:underline font-medium"
              type="button"
              onClick={toggleForm}
            >
              Log In
            </button>
          </p>
        ) : (
          <p>
            Don&apos;t have an account?{" "}
            <button
              className="text-primary hover:underline font-medium"
              type="button"
              onClick={toggleForm}
            >
              Sign Up
            </button>
          </p>
        )}
      </div>
    </motion.div>
  );
}
