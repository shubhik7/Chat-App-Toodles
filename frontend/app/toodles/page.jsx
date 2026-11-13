"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useContext, useEffect, useRef, useState } from "react";
import { CREATE_USER } from "../services/user.service";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../components/AuthContext";
import AuthCard, {
  ErrorText,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "../components/AuthCard";

const Signup = () => {
  const router = useRouter();
  const formRef = useRef(null);
  const [validationError, setValidationError] = useState("");

  const { setCurrUser } = useContext(AuthContext);

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  const {
    mutate: createUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: CREATE_USER,
    meta: { inlineError: true },
    onSuccess: (user) => {
      formRef.current?.reset();
      setValidationError("");
      setCurrUser(user);
      router.push("/toodles/chats");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(formRef.current);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password");

    if (!name || !email || !password.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }

    setValidationError("");
    createUser({
      name,
      email,
      password,
    });
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join Toodles and start chatting."
      footer={
        <>
          Already have an account?{" "}
          <Link
            className="font-semibold text-orange-600 hover:text-orange-700"
            href="/toodles/login"
          >
            Log in
          </Link>
        </>
      }
    >
      <form
        ref={formRef}
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        {validationError && <ErrorText>{validationError}</ErrorText>}
        {isError && <ErrorText>{error.message}</ErrorText>}

        <button
          disabled={isPending}
          type="submit"
          className={`mt-2 ${primaryButtonClass}`}
        >
          {isPending ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Signup;
