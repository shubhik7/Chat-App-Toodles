"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useContext, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LOGIN_USER } from "@/app/services/user.service";
import { AuthContext } from "@/app/components/AuthContext";
import AuthCard, {
  ErrorText,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/app/components/AuthCard";

const Login = () => {
  const router = useRouter();
  const formRef = useRef(null);
  const [validationError, setValidationError] = useState("");
  const { setCurrUser } = useContext(AuthContext);

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  const {
    mutate: loginUser,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: LOGIN_USER,
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
    const email = formData.get("email").trim();
    const password = formData.get("password");

    if (!email || !password.trim()) {
      setValidationError("Please fill in all fields.");
      return;
    }

    setValidationError("");
    loginUser({
      email,
      password,
    });
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue your conversations."
      footer={
        <>
          New to Toodles?{" "}
          <Link
            className="font-semibold text-orange-600 hover:text-orange-700"
            href="/toodles"
          >
            Create an account
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
          {isPending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
