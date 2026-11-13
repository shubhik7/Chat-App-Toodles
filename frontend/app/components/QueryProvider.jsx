"use client";

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { showToast } from "../utilities/toast";

const shouldRetry = (failureCount, error) => {
  const status = error?.status;
  if (status && status < 500) return false;
  return failureCount < 2;
};

const makeQueryClient = () =>
  new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.inlineError) return;
        showToast(error.message);
      },
    }),
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined) {
          showToast(error.message);
        }
      },
    }),
    defaultOptions: {
      queries: { retry: shouldRetry },
    },
  });

function QueryProvider({ children }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default QueryProvider;
