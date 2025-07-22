import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, User, Building2, Eye, EyeOff } from "lucide-react";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { apiRequest, queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { language } = useLanguage();
  const t = useTranslation();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      return response.json();
    },
    onSuccess: () => {
      setError("");
      // Clear all queries and force fresh data
      queryClient.clear();
      onLoginSuccess();
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-temple-primary" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {language === "en" ? "Admin Login" : "நிர்வாக உள்நுழைவு"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {language === "en" 
              ? "Sign in to access the admin panel" 
              : "நிர்வாக பாட்டை அணுக உள்நுழைக"}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {language === "en" ? "Temple Admin Access" : "கோயில் நிர்வாக அணுகல்"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-sm font-medium">
                    {language === "en" ? "Username" : "பயனர் பெயர்"}
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder={language === "en" ? "Enter username" : "பயனர் பெயரை உள்ளிடவும்"}
                      className="pl-10 h-12"
                      {...form.register("username")}
                    />
                  </div>
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    {language === "en" ? "Password" : "கடவுச்சொல்"}
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={language === "en" ? "Enter password" : "கடவுச்சொல்லை உள்ளிடவும்"}
                      className="pl-10 pr-10 h-12"
                      {...form.register("password")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 
                        (language === "en" ? "Hide password" : "கடவுச்சொல்லை மறைக்க") : 
                        (language === "en" ? "Show password" : "கடவுச்சொல்லைக் காட்ட")
                      }
                    >
                      {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-temple-primary hover:bg-temple-primary/90 h-12 text-base font-semibold"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending
                  ? (language === "en" ? "Signing in..." : "உள்நுழைகிறது...")
                  : (language === "en" ? "Sign In" : "உள்நுழை")
                }
              </Button>
            </form>


          </CardContent>
        </Card>
      </div>
    </div>
  );
}