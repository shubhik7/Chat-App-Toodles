"use client";

import { AuthContext } from "@/app/components/AuthContext";
import { CREATE_GROUP } from "@/app/services/chat.service";
import { GET_USERS } from "@/app/services/user.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import Header from "@/app/components/Header";
import Avatar from "@/app/components/Avatar";
import Loader from "@/app/components/Loader";
import { ArrowLeftIcon } from "@/app/components/Icons";
import {
  ErrorText,
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/app/components/AuthCard";

const CreateGroup = () => {
  const { currUser, authLoading, setSelectedChat, setSelectedUser } =
    useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = useRef();
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  const {
    data,
    isLoading,
    isError,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: GET_USERS,
  });

  const {
    mutate: createGroup,
    isPending,
    isError: createError,
    error,
  } = useMutation({
    mutationFn: CREATE_GROUP,
    meta: { inlineError: true },
    onSuccess: (chat) => {
      setSelectedChat(chat);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ["chats", currUser?.id] });
      router.push("/toodles/chats");
    },
  });

  if (isLoading) return <Loader fullPage />;
  if (isError)
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorText>{usersError.message}</ErrorText>
      </div>
    );

  const handleCreateGroup = (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const groupName = formData.get("grpName");
    const participantIds = formData.getAll("participants").map(Number);

    if (!groupName || participantIds.length === 0) {
      setValidationError("Please enter Group name and select participants");
      return;
    }

    setValidationError("");

    participantIds.push(currUser.id);
    createGroup({ groupName, participantIds });
  };

  if (authLoading) return <Loader fullPage />;
  if (!currUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-5xl font-bold text-slate-300">404</p>
        <p className="text-sm text-slate-500">Page not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link
          href="/toodles/chats"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeftIcon />
          Back to chats
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Create a group
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Give your group a name and pick who to invite.
          </p>

          <form
            className="mt-6 flex flex-col gap-5"
            ref={formRef}
            onSubmit={handleCreateGroup}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="grpName" className={labelClass}>
                Group name
              </label>
              <input
                id="grpName"
                name="grpName"
                className={inputClass}
                placeholder="e.g. Weekend plans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className={labelClass}>Select participants</span>
              <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                {(data || []).map((user) => {
                  if (user.id === currUser?.id) return null;
                  return (
                    <label
                      className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50 has-checked:bg-orange-50"
                      key={user.id}
                    >
                      <input
                        type="checkbox"
                        name="participants"
                        value={user.id}
                        className="h-4 w-4 accent-orange-500"
                      />
                      <Avatar name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        {user.email && (
                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {validationError && <ErrorText>{validationError}</ErrorText>}
            {createError && <ErrorText>{error.message}</ErrorText>}

            <button
              disabled={isPending}
              type="submit"
              className={primaryButtonClass}
            >
              {isPending ? "Creating…" : "Create group"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
