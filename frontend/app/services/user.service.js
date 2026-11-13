import Api from "./api.service";

export const GET_USERS = async () => {
  try {
    const res = await Api.get("/users");
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const CREATE_USER = async (user) => {
  try {
    const res = await Api.post("/auth/signup", user);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const LOGIN_USER = async (loginCred) => {
  try {
    const res = await Api.post("/auth/login", loginCred);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const LOGOUT_USER = async () => {
  try {
    await Api.post("/auth/logout");
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const FETCH_ME = async () => {
  const res = await Api.get("/auth/me");
  return res.data;
};
