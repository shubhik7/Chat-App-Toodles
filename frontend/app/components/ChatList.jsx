"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DELETE_CHAT, FETCH_CHATS } from "../services/chat.service";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { findChatName } from "../utilities/helper";
import Avatar from "./Avatar";
import Loader from "./Loader";
import { TrashIcon } from "./Icons";

function ChatList() {
  const { setSelectedUser, setSelectedChat, selectedChat, currUser } =
    useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["chats", currUser?.id],
    queryFn: FETCH_CHATS,
  });

  const { mutate: deleteChat } = useMutation({
    mutationFn: DELETE_CHAT,
    onSuccess: (chatId) => {
      queryClient.setQueryData(["chats", currUser?.id], (old) =>
        (old || []).filter((c) => c.id !== chatId),
      );
      queryClient.removeQueries({ queryKey: ["chat_messages", chatId] });
      if (selectedChat?.id === chatId) setSelectedChat(null);
    },
  });

  if (isLoading) return <Loader label="Loading chats…" />;
  if (isError)
    return (
      <p className="m-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        {error.message}
      </p>
    );

  if (!data?.length)
    return (
      <p className="px-4 py-10 text-center text-sm text-slate-500">
        No chats yet. Pick someone from People to start one.
      </p>
    );

  return (
    <ul className="space-y-1">
      {data.map((chat) => {
        const chatName = findChatName(chat, currUser);
        const amIMember = chat.participants?.some((p) => p.id === currUser?.id);
        const canDelete = chat.type !== "group" || !amIMember;
        const isGroup = chat.type === "group";
        const isActive = selectedChat?.id === chat.id;

        return (
          <li key={chat.id}>
            <div
              className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                isActive
                  ? "bg-orange-50 ring-1 ring-orange-200"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => {
                setSelectedChat(chat);
                setSelectedUser(null);
              }}
            >
              <Avatar name={chatName} group={isGroup} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  {chatName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {isGroup
                    ? `Group · ${chat.participants?.length ?? 0} members`
                    : "Direct message"}
                </p>
              </div>
              {canDelete && (
                <button
                  type="button"
                  title="Delete chat"
                  aria-label={`Delete chat ${chatName}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete chat "${chatName}"?`)) {
                      deleteChat(chat.id);
                    }
                  }}
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ChatList;
