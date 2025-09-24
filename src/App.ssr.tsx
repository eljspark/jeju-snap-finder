import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";

const queryClient = new QueryClient();

const App = ({ pageProps, packages, packageData, packageId }: { pageProps?: any, packages?: any[], packageData?: any, packageId?: string }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {packageData ? (
        <PackageDetail packageData={packageData} packageId={packageId} />
      ) : (
        <Packages packages={packages} />
      )}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;