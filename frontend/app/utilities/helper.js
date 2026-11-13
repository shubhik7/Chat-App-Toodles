export const findChatName = (chat, currUser) => {
  if (chat?.type === "group") {
    return chat.name;
  } else {
    const receiver = chat?.participants?.filter((p) => p.id !== currUser?.id);
    return receiver?.[0]?.name;
  }
};
