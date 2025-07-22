import React, { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Menu, Building2, Languages, Plus, Search, BarChart3, Upload, Link, Settings, LogOut } from "lucide-react";
import { LanguageProvider, useLanguage, useTranslation } from "@/contexts/LanguageContext";

import DonationForm from "@/pages/donation-form";
import DonorLookup from "@/pages/donor-lookup";
import Dashboard from "@/pages/dashboard";
import ImportData from "@/pages/import-data";
import AdminPanel from "@/pages/admin-panel";
import AdminLogin from "@/pages/admin-login";
import GoogleFormIntegration from "@/pages/google-form-integration";
import NotFound from "@/pages/not-found";
// Removed InstallPrompt - no longer using PWA functionality


// Define authentication status type
interface AuthStatus {
  isAuthenticated: boolean;
  username?: string;
  role?: string;
}

function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation();
  
  // Check authentication status
  const { data: authStatus } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // Refresh auth status
      queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { path: "/", label: t("newDonation"), icon: "Plus" },
    { path: "/lookup", label: t("donorLookup"), icon: "Search" },
    { path: "/dashboard", label: t("dashboard"), icon: "BarChart3" },
    { path: "/import", label: t("importData"), icon: "Upload" },
    { path: "/google-form", label: t("googleFormSetup"), icon: "Link" },
    { path: "/admin", label: t("adminPanel"), icon: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-temple-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">{t("templeTitle")}</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden lg:block truncate">{t("templeSubtitle")}</p>
            </div>
          </div>
          
          {/* Navigation and Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Logout Button for Authenticated Users */}
            {authStatus && authStatus.isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm h-8 sm:h-9 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-medium hidden sm:inline">{language === 'en' ? 'Logout' : 'வெளியேற'}</span>
              </Button>
            )}
            
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-2 py-1 text-xs sm:text-sm h-8 sm:h-9"
            >
              <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-medium hidden sm:inline">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </Button>
            
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex space-x-1">
              {navItems.map((item) => {
                const IconComponent = {
                  Plus,
                  Search,
                  BarChart3,
                  Upload,
                  Link,
                  Settings
                }[item.icon] || Plus;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={`px-2 py-1 text-sm font-medium transition-colors h-8 ${
                      isActive(item.path)
                        ? "text-temple-primary border-b-2 border-temple-primary bg-temple-accent"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setLocation(item.path)}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    <span className="hidden 2xl:inline">{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Tablet Navigation - Icons Only */}
            <nav className="hidden lg:flex xl:hidden space-x-1">
              {navItems.map((item) => {
                const IconComponent = {
                  Plus,
                  Search,
                  BarChart3,
                  Upload,
                  Link,
                  Settings
                }[item.icon] || Plus;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    className={`p-1 transition-colors h-8 w-8 ${
                      isActive(item.path)
                        ? "text-temple-primary bg-temple-accent"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setLocation(item.path)}
                    title={item.label}
                  >
                    <IconComponent className="h-4 w-4" />
                  </Button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 h-8 w-8"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="px-3 py-2 space-y-1 max-h-64 overflow-y-auto">
              {navItems.map((item) => {
                const IconComponent = {
                  Plus,
                  Search,
                  BarChart3,
                  Upload,
                  Link,
                  Settings
                }[item.icon] || Plus;
                
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={`w-full justify-start px-3 py-2 text-sm font-medium rounded-lg h-10 ${
                      isActive(item.path)
                        ? "text-temple-primary bg-temple-accent border-l-4 border-temple-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setLocation(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// Protected Route Component
function ProtectedRoute({ component: Component, ...props }: any) {
  const [location, setLocation] = useLocation();
  const { data: authStatus, isLoading } = useQuery<AuthStatus>({
    queryKey: ["/api/auth/status"],
    retry: false,
    staleTime: 0, // Always fresh
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-temple-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authStatus?.isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => {
      // Force page reload to ensure authentication state is fresh
      window.location.reload();
    }} />;
  }

  return <Component {...props} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <DonationForm />} />
      <Route path="/donation" component={() => <DonationForm />} />
      <Route path="/lookup" component={DonorLookup} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/import" component={() => <ProtectedRoute component={ImportData} />} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminPanel} />} />
      <Route path="/google-form" component={GoogleFormIntegration} />
      <Route path="/login" component={() => <AdminLogin onLoginSuccess={() => window.location.href = "/dashboard"} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 min-h-screen">
              <Router />
            </main>
          </div>
          {/* Removed InstallPrompt - no longer using PWA functionality */}
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
