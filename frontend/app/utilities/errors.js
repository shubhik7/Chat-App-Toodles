export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  if (error?.response) {
    const data = error.response.data;
    if (data && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    return messageForStatus(error.response.status) ?? fallback;
  }

  if (error?.request) {
    if (error.code === "ECONNABORTED") {
      return "The server took too long to respond. Please try again.";
    }
    return "Can't reach the server. Check your connection and try again.";
  }

  return error?.message || fallback;
};

const messageForStatus = (status) =>
  ({
    400: "The request was invalid.",
    401: "Please log in to continue.",
    403: "You don't have permission to do this.",
    404: "Not found.",
    409: "This conflicts with existing data.",
    500: "Something went wrong on our side. Please try again.",
    502: "The server is unavailable. Please try again shortly.",
    503: "The server is unavailable. Please try again shortly.",
  })[status];
