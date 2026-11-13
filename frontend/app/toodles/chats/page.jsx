"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatArea from "../../components/ChatArea";
import ChatList from "../../components/ChatList";
import Header from "../../components/Header";
import UserList from "../../components/UserList";
import Loader from "../../components/Loader";
import { AuthContext } from "@/app/components/AuthContext";
import { useChatSocket } from "@/app/hooks/useChatSocket";

const panel =
  "flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs";

function PanelTitle({ children }) {
  return (
    <h2 className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </h2>
  );
}

export default function ToodlesPage() {
  const { currUser, authLoading } = useContext(AuthContext);
  const router = useRouter();
  useChatSocket(currUser?.id);

  useEffect(() => {
    if (!authLoading && !currUser) {
      router.replace("/toodles/login");
    }
  }, [authLoading, currUser, router]);

  if (authLoading || !currUser) return <Loader fullPage />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 md:h-screen">
      <Header />
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 md:flex-row">
        <aside className={`${panel} max-h-64 md:max-h-none md:w-72 md:shrink-0`}>
          <PanelTitle>Chats</PanelTitle>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <ChatList />
          </div>
        </aside>

        <main className={`${panel} min-h-[70vh] min-w-0 flex-1 md:min-h-0`}>
          <ChatArea />
        </main>

        <aside
          className={`${panel} max-h-64 md:max-h-none md:w-64 md:shrink-0 lg:w-72`}
        >
          <PanelTitle>People</PanelTitle>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            <UserList />
          </div>
        </aside>
      </div>
    </div>
  );
}
