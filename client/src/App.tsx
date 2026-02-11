import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import Codes from "@/pages/Codes";
import Orders from "@/pages/Orders";
import AdminPanel from "@/pages/AdminPanel";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "next-themes";
import { SparkBackground, PhantomShapes } from "@/components/BackgroundEffects";
import { LanguageProvider } from "@/lib/LanguageContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/codes" component={Codes} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <TooltipProvider>
            <div className="min-h-screen flex flex-col bg-background font-body selection:bg-primary selection:text-white overflow-x-hidden transition-colors duration-500">
              <SparkBackground />
              <PhantomShapes />
              <Navbar />
              <main className="flex-grow relative z-10">
                <Router />
              </main>
              <Footer />
              <Toaster />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
