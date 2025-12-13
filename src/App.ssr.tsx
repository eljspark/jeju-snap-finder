import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import { FeedbackButton } from "./components/FeedbackButton";

const queryClient = new QueryClient();

const App = ({ pageProps, packages, packageData }: { pageProps?: any, packages?: any[], packageData?: any }) => {
  // Extract data from pageProps (for SSG routes) or use direct props (for fallback)
  const actualPackageData = pageProps?.packageData || packageData;
  const actualPackages = pageProps?.packages || packages;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {actualPackageData ? (
          <PackageDetail packageData={actualPackageData} packageId={actualPackageData?.id} />
        ) : (
          <Packages packages={actualPackages} />
        )}
        <FeedbackButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;