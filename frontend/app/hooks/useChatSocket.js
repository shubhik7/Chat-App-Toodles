"use client";

import { Client } from "@stomp/stompjs";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const socketUrl = () => {
  const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
  if (!url.startsWith("/")) return url;
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${url}`;
};

export const useChatSocket = (currentUserId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentUserId) return;

    const client = new Client({
      brokerURL: socketUrl(),
      reconnectDelay: 5000,
      //   debug: (str) => console.log("[STOMP]", str),
      //   onWebSocketError: (event) => console.error("[WS error]", event),
      //   onWebSocketClose: (event) =>
      //     console.warn("[WS closed]", event.code, event.reason),
      //   onStompError: (frame) =>
      //     console.error("[STOMP error]", frame.headers["message"], frame.body),
      onConnect: () => {
        client.subscribe("/user/queue/messages", (frame) => {
          const msg = JSON.parse(frame.body);
          queryClient.setQueryData(["chat_messages", msg.chatId], (old) => {
            if (!old) return old;
            if (old.some((m) => m.id === msg.id)) return old;
            return [...old, msg];
          });

          const chats = queryClient.getQueryData(["chats", currentUserId]);
          if (!chats?.some((c) => c.id === msg.chatId)) {
            queryClient.invalidateQueries({
              queryKey: ["chats", currentUserId],
            });
          }
        });

        client.subscribe("/user/queue/chats", (frame) => {
          const chat = JSON.parse(frame.body);

          queryClient.setQueryData(["chats", currentUserId], (old) => {
            if (!old) return old;
            if (old.some((c) => c.id === chat.id)) {
              return old.map((c) => (c.id === chat.id ? chat : c));
            }
            return [...old, chat];
          });

          queryClient.invalidateQueries({
            queryKey: ["chat_messages", chat.id],
          });
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [currentUserId, queryClient]);
};
