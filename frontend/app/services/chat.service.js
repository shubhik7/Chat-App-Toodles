import Api from "./api.service";

export const FETCH_CHATS = async () => {
  try {
    const res = await Api.get("/chats");
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const FETCH_MESSAGES = async (chatId) => {
  try {
    const res = await Api.get(`/chats/${chatId}/messages`);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const SEND_MESSAGE = async (msgPayload) => {
  try {
    const res = await Api.post("/chats/sendMessage", msgPayload);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const DELETE_CHAT = async (chatId) => {
  try {
    await Api.delete(`/chats/${chatId}`);
    return chatId;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const CLEAR_CHAT = async (chatId) => {
  try {
    await Api.post(`/chats/${chatId}/clear`);
    return chatId;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const ADD_PARTICIPANT = async ({ chatId, userId }) => {
  try {
    const res = await Api.post("/chats/addParticipant", null, {
      params: { chatId, userId },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const REMOVE_PARTICIPANT = async ({ chatId, userId }) => {
  try {
    const res = await Api.delete("/chats/removeParticipant", {
      params: { chatId, userId },
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const LEAVE_GROUP = async (chatId) => {
  try {
    const res = await Api.post(`/chats/${chatId}/leave`);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const MAKE_ADMIN = async ({ chatId, userId }) => {
  try {
    const res = await Api.post(`/chats/${chatId}/admins/${userId}`);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const CREATE_GROUP = async ({ groupName, participantIds }) => {
  try {
    const res = await Api.post("/chats/createGroup", {
      groupName,
      participantIds,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
