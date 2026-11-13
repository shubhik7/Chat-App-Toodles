import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  CLEAR_CHAT,
  DELETE_CHAT,
  FETCH_CHATS,
  FETCH_MESSAGES,
  LEAVE_GROUP,
  SEND_MESSAGE,
} from "../services/chat.service";
import { AuthContext } from "./AuthContext";
import { findChatName } from "../utilities/helper";
import GroupInfo from "./GroupInfo";
import Avatar from "./Avatar";
import Loader from "./Loader";
import {
  ChatBubbleIcon,
  EraserIcon,
  LogoutIcon,
  SendIcon,
  TrashIcon,
  UsersIcon,
} from "./Icons";

const headerButton =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition";

function ChatArea() {
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const infoRef = useRef(null);
  const infoButtonRef = useRef(null);
  const queryClient = useQueryClient();
  const [showInfo, setShowInfo] = useState(false);

  const {
    selectedChat,
    selectedUser,
    setSelectedUser,
    setSelectedChat,
    currUser,
  } = useContext(AuthContext);
  const chatId = selectedChat?.id ?? null;

  const showChat = selectedChat || selectedUser;

  const {
    data: messages,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["chat_messages", chatId],
    queryFn: ({ queryKey }) => FETCH_MESSAGES(queryKey[1]),
    enabled: Boolean(chatId),
  });

  const { data: chats } = useQuery({
    queryKey: ["chats", currUser?.id],
    queryFn: FETCH_CHATS,
  });
  const fullChat = chats?.find((c) => c.id === chatId) ?? selectedChat;
  const isGroup = fullChat?.type === "group";
  const isMember = fullChat?.participants?.some((p) => p.id === currUser?.id);
  const isRemoved = isGroup && !isMember;

  const { mutate: sendMessage, isPending: sending } = useMutation({
    mutationFn: SEND_MESSAGE,
    onSuccess: (msg) => {
      inputRef.current.value = "";
      if (msg.chatId != null) {
        setSelectedChat({ id: msg.chatId });
        setSelectedUser(null);
      }
      queryClient.invalidateQueries({ queryKey: ["chats", currUser?.id] });
    },
  });

  const { mutate: clearChat } = useMutation({
    mutationFn: CLEAR_CHAT,
    onSuccess: (clearedId) => {
      queryClient.setQueryData(["chat_messages", clearedId], []);
    },
  });

  const { mutate: deleteChat } = useMutation({
    mutationFn: DELETE_CHAT,
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["chats", currUser?.id], (old) =>
        (old || []).filter((c) => c.id !== deletedId),
      );
      queryClient.removeQueries({ queryKey: ["chat_messages", deletedId] });
      setSelectedChat(null);
    },
  });

  const { mutate: leaveGroup } = useMutation({
    mutationFn: LEAVE_GROUP,
    onSuccess: () => {
      setShowInfo(false);
      queryClient.invalidateQueries({ queryKey: ["chats", currUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["chat_messages", chatId] });
    },
  });

  const handleSendMessage = () => {
    const payload = {
      content: inputRef.current.value,
      ...(selectedChat != null
        ? { chatId: selectedChat.id }
        : { receiverId: selectedUser?.id }),
    };

    sendMessage(payload);
  };

  useEffect(() => {
    setSelectedChat(null);
    setSelectedUser(null);
  }, []);

  useEffect(() => {
    setShowInfo(false);
  }, [chatId]);

  // Close the participants panel on any click outside it.
  useEffect(() => {
    if (!showInfo) return;

    const handleClickOutside = (e) => {
      if (
        infoRef.current?.contains(e.target) ||
        infoButtonRef.current?.contains(e.target)
      ) {
        return;
      }
      setShowInfo(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);

  // Keep the newest message in view.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  if (isLoading) return <Loader label="Loading messages…" />;
  if (isError)
    return (
      <p className="m-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
        {error.message}
      </p>
    );

  if (!showChat)
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
          <ChatBubbleIcon className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Select a conversation
        </h2>
        <p className="max-w-xs text-sm text-slate-500">
          Pick a chat on the left, or choose someone from People to start a
          new one.
        </p>
      </div>
    );

  const chatName = findChatName(fullChat, currUser);
  const title = selectedChat ? chatName : selectedUser.name;
  const subtitle = !selectedChat
    ? "New conversation"
    : isGroup
      ? `${fullChat?.participants?.length ?? 0} members`
      : "Direct message";

  const exitNotice = isRemoved
    ? [...(messages || [])].reverse().find((m) => m.type === "SYSTEM")
    : null;
  const iLeft = exitNotice?.sender?.id === currUser?.id;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={title} group={isGroup} />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>

        {selectedChat && isGroup && !isRemoved && (
          <div className="flex shrink-0 gap-1.5">
            <button
              ref={infoButtonRef}
              type="button"
              title="Participants"
              className={`${headerButton} ${
                showInfo
                  ? "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setShowInfo((v) => !v)}
            >
              <UsersIcon />
              <span className="hidden lg:inline">Participants</span>
            </button>
            <button
              type="button"
              title="Clear chat"
              className={`${headerButton} text-slate-600 hover:bg-slate-100`}
              onClick={() => {
                if (window.confirm(`Clear all messages in "${chatName}"?`)) {
                  clearChat(chatId);
                }
              }}
            >
              <EraserIcon />
              <span className="hidden lg:inline">Clear chat</span>
            </button>
            <button
              type="button"
              title="Leave group"
              className={`${headerButton} text-red-600 hover:bg-red-50`}
              onClick={() => {
                if (window.confirm(`Leave "${chatName}"?`)) {
                  leaveGroup(chatId);
                }
              }}
            >
              <LogoutIcon />
              <span className="hidden lg:inline">Leave group</span>
            </button>
          </div>
        )}
      </div>

      {showInfo && isGroup && !isRemoved && (
        <div
          ref={infoRef}
          className="max-h-72 overflow-y-auto border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5"
        >
          <GroupInfo chat={fullChat} />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-4 py-4 sm:px-5">
        {(messages || []).length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No messages yet. Say hi 👋
          </p>
        )}

        <div className="space-y-2">
          {(messages || []).map((msg) => {
            if (msg.type === "SYSTEM") {
              return (
                <div key={msg.id} className="py-1 text-center">
                  <span className="inline-block rounded-full bg-slate-200/70 px-3 py-1 text-xs text-slate-600">
                    {msg.content}
                  </span>
                </div>
              );
            }

            const isMine = msg.sender?.id === currUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-xs ${
                    isMine
                      ? "rounded-br-md bg-orange-500 text-white"
                      : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                  }`}
                >
                  {isGroup && !isMine && msg.sender?.name && (
                    <p className="mb-0.5 text-xs font-semibold text-orange-600">
                      {msg.sender.name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {isRemoved ? (
        <div className="border-t border-slate-200 bg-white p-4 text-center">
          <p className="text-sm font-medium text-slate-700">
            {iLeft ? "You left this group" : "You were removed from this group"}
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
            onClick={() => {
              if (window.confirm(`Delete "${chatName}" for you?`)) {
                deleteChat(chatId);
              }
            }}
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Delete chat
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message"
            className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
          />
          <button
            type="button"
            disabled={sending}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-orange-500 px-4 text-sm font-medium text-white shadow-xs transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => handleSendMessage()}
          >
            <SendIcon />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatArea;
