import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import CategoryPage, { OccasionKey } from "./pages/CategoryPage";
import { FeedbackButton } from "./components/FeedbackButton";

const queryClient = new QueryClient();

interface AppProps {
  pageProps?: any;
  packages?: any[];
  packageData?: any;
  occasionFilter?: OccasionKey;
}

const App = ({ pageProps, packages, packageData, occasionFilter }: AppProps) => {
  // Extract data from pageProps (for SSG routes) or use direct props (for fallback)
  const actualPackageData = pageProps?.packageData || packageData;
  const actualPackages = pageProps?.packages || packages;
  const actualOccasionFilter: OccasionKey | undefined = pageProps?.occasionFilter || occasionFilter;

  let content: JSX.Element;
  if (actualOccasionFilter) {
    content = <CategoryPage occasion={actualOccasionFilter} packages={actualPackages} />;
  } else if (actualPackageData) {
    content = <PackageDetail packageData={actualPackageData} packageId={actualPackageData?.id} />;
  } else {
    content = <Packages packages={actualPackages} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {content}
        {!actualPackageData && <FeedbackButton />}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
