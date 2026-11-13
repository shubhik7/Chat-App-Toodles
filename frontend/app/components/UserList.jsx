"use client";

import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { GET_USERS } from "../services/user.service";
import { AuthContext } from "./AuthContext";
import { FETCH_CHATS } from "../services/chat.service";
import Avatar from "./Avatar";
import Loader from "./Loader";

function UserList() {
  const { currUser, selectedUser, setSelectedUser, setSelectedChat } =
    useContext(AuthContext);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: GET_USERS,
  });

  const {
    data: chats,
    isLoading: chatLoading,
    isError: chatError,
    error: chatsError,
  } = useQuery({
    queryKey: ["chats", currUser?.id],
    queryFn: FETCH_CHATS,
  });

  const handleUserClick = (user) => {
    const existingChat = chats?.find(
      (chat) =>
        chat.type !== "group" &&
        chat.participants?.some((p) => p.id === user.id),
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
      setSelectedChat(null);
    }
  };

  const errorBox = (message) => (
    <p className="m-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
      {message}
    </p>
  );

  if (isLoading) return <Loader label="Loading people…" />;
  if (isError) return errorBox(error.message);

  if (chatLoading) return <Loader label="Loading people…" />;
  if (chatError) return errorBox(chatsError.message);

  const others = data.filter((user) => user.id != currUser?.id);

  if (others.length === 0)
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        No one else is here yet.
      </p>
    );

  return (
    <ul className="space-y-1">
      {others.map((user) => {
        const isActive = selectedUser?.id === user.id;
        return (
          <li key={user.id}>
            <div
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                isActive
                  ? "bg-orange-50 ring-1 ring-orange-200"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => {
                handleUserClick(user);
              }}
            >
              <Avatar name={user.name} />
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default UserList;
