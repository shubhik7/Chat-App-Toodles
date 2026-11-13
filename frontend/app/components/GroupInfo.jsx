"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";
import { GET_USERS } from "../services/user.service";
import {
  ADD_PARTICIPANT,
  MAKE_ADMIN,
  REMOVE_PARTICIPANT,
} from "../services/chat.service";
import Avatar from "./Avatar";

function GroupInfo({ chat }) {
  const { currUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [newUserId, setNewUserId] = useState("");

  const adminIds = chat.adminIds || [];
  const amIAdmin = adminIds.includes(currUser?.id);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: GET_USERS,
    enabled: amIAdmin,
  });

  const refreshChats = () =>
    queryClient.invalidateQueries({ queryKey: ["chats", currUser?.id] });

  const { mutate: addParticipant, isPending: adding } = useMutation({
    mutationFn: ADD_PARTICIPANT,
    onSuccess: () => {
      setNewUserId("");
      refreshChats();
    },
  });

  const { mutate: removeParticipant } = useMutation({
    mutationFn: REMOVE_PARTICIPANT,
    onSuccess: refreshChats,
  });

  const { mutate: makeAdmin } = useMutation({
    mutationFn: MAKE_ADMIN,
    onSuccess: refreshChats,
  });

  const participants = chat.participants || [];
  const memberIds = new Set(participants.map((p) => p.id));
  const candidates = (users || []).filter((u) => !memberIds.has(u.id));

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Participants · {participants.length}
      </h3>

      <ul className="space-y-0.5">
        {participants.map((p) => {
          const isAdmin = adminIds.includes(p.id);
          const isMe = p.id === currUser?.id;

          return (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar name={p.name} size="sm" />
                <span className="truncate text-sm text-slate-800">
                  {isMe ? "You" : p.name}
                </span>
                {isAdmin && (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                    Admin
                  </span>
                )}
              </div>

              {amIAdmin && !isMe && (
                <div className="flex shrink-0 gap-1">
                  {!isAdmin && (
                    <button
                      type="button"
                      className="rounded-md px-2 py-1 text-xs font-medium text-sky-700 transition hover:bg-sky-50"
                      onClick={() =>
                        makeAdmin({ chatId: chat.id, userId: p.id })
                      }
                    >
                      Make admin
                    </button>
                  )}
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm(`Remove ${p.name} from the group?`)) {
                        removeParticipant({ chatId: chat.id, userId: p.id });
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {amIAdmin && (
        <div className="mt-3 flex gap-2">
          <select
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">Add participant…</option>
            {candidates.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!newUserId || adding}
            onClick={() =>
              addParticipant({ chatId: chat.id, userId: Number(newUserId) })
            }
            className="h-9 rounded-lg bg-orange-500 px-4 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default GroupInfo;
