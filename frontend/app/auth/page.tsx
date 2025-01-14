"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { motion } from "framer-motion";

import { useAuth } from "@/hooks/useAuth";

export default function AuthForm() {
  const { user, signUp, signIn, signOut, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleForm = () => {
    setIsSignUp((prev) => !prev);
    setLocalError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;

    try {
      if (isSignUp) {
        await signUp(email, password, email.split("@")[0], fullName);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setLocalError(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err: any) {
      setLocalError(err.message || "Failed to log out. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return user ? (
    <div className="text-center max-w-md mx-auto mt-16 p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Welcome, <span className="text-orange-500">{user.email}</span>
      </h2>
      <Button
        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
        onPress={handleSignOut}
      >
        Log Out
      </Button>
      {localError && <p className="text-red-500 mt-4">{localError}</p>}
    </div>
  ) : (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto mt-16 p-6 shadow-lg rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-100">
        {isSignUp ? "Create Your Account" : "Welcome Back"}
      </h2>

      {(error || localError) && (
        <p className="text-red-500 text-center mb-4">{localError ?? error}</p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {isSignUp && (
          <Input
            className="w-full"
            name="name"
            placeholder="Full Name"
            size="lg"
          />
        )}
        <Input
          className="w-full"
          name="email"
          placeholder="Email"
          size="lg"
          type="email"
        />
        <Input
          className="w-full"
          name="password"
          placeholder="Password"
          size="lg"
          type="password"
        />
        <Button
          className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white py-3 rounded-md hover:shadow-lg transition-transform transform hover:scale-105"
          type="submit"
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </Button>
      </form>

      <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
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
              className="text-orange-500 hover:underline font-medium"
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
