import { QueryClientProvider } from "@tanstack/react-query";
import { Home } from "./Home";
import { GlobalStyles } from "./styles/globalStyles";
import { queryClient } from "./trpc";

export const App = () => (
  <>
    <GlobalStyles />
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  </>
);
