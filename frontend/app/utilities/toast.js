let toasts = [];
let nextId = 1;
const listeners = new Set();

const emit = () => {
  for (const listener of listeners) listener();
};

export const showToast = (
  message,
  { type = "error", duration = 4000 } = {},
) => {
  if (toasts.some((t) => t.message === message)) return;

  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => dismissToast(id), duration);
};

export const dismissToast = (id) => {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

export const subscribeToasts = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getToasts = () => toasts;
const EMPTY = [];
export const getServerToasts = () => EMPTY;
