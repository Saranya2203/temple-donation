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
import { Key, User, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";

const credentialsSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newUsername: z.string().min(3, "Username must be at least 3 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CredentialsForm = z.infer<typeof credentialsSchema>;

interface AdminSettingsProps {
  onBack: () => void;
}

export default function AdminSettings({ onBack }: AdminSettingsProps) {
  const { language } = useLanguage();
  const t = useTranslation();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      currentPassword: "",
      newUsername: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changeCredentialsMutation = useMutation({
    mutationFn: async (data: CredentialsForm) => {
      const response = await fetch("/api/auth/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change credentials");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setMessage({ type: "success", text: data.message });
      form.reset();
    },
    onError: (error: any) => {
      setMessage({ type: "error", text: error.message });
    },
  });

  const onSubmit = (data: CredentialsForm) => {
    setMessage(null);
    changeCredentialsMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack}>
          {language === "en" ? "← Back to Admin Panel" : "← நிர்வாக பாட்டுக்கு திரும்பு"}
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {language === "en" ? "Admin Settings" : "நிர்வாக அமைப்புகள்"}
        </h1>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-temple-primary" />
            {language === "en" ? "Change Admin Credentials" : "நிர்வாக அறிமுக தகவலை மாற்று"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <div className="flex items-center gap-2">
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </div>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  {language === "en" ? "Current Password" : "தற்போதைய கடவுச்சொல்"}
                </Label>
                <div className="relative mt-1">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={language === "en" ? "Enter current password" : "தற்போதைய கடவுச்சொல்லை உள்ளிடவும்"}
                    className="pl-10 pr-10 h-11"
                    {...form.register("currentPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    title={showCurrentPassword ? 
                      (language === "en" ? "Hide password" : "கடவுச்சொல்லை மறைக்க") : 
                      (language === "en" ? "Show password" : "கடவுச்சொல்லைக் காட்ட")
                    }
                  >
                    {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newUsername" className="text-sm font-medium">
                    {language === "en" ? "New Username" : "புதிய பயனர் பெயர்"}
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newUsername"
                      type="text"
                      placeholder={language === "en" ? "Enter new username" : "புதிய பயனர் பெயரை உள்ளிடவும்"}
                      className="pl-10 h-11"
                      {...form.register("newUsername")}
                    />
                  </div>
                  {form.formState.errors.newUsername && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.newUsername.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    {language === "en" ? "New Password" : "புதிய கடவுச்சொல்"}
                  </Label>
                  <div className="relative mt-1">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder={language === "en" ? "Enter new password" : "புதிய கடவுச்சொல்லை உள்ளிடவும்"}
                      className="pl-10 pr-10 h-11"
                      {...form.register("newPassword")}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      title={showNewPassword ? 
                        (language === "en" ? "Hide password" : "கடவுச்சொல்லை மறைக்க") : 
                        (language === "en" ? "Show password" : "கடவுச்சொல்லைக் காட்ட")
                      }
                    >
                      {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                  {form.formState.errors.newPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {language === "en" ? "Confirm New Password" : "புதிய கடவுச்சொல்லை உறுதிப்படுத்து"}
                </Label>
                <div className="relative mt-1">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={language === "en" ? "Confirm new password" : "புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்"}
                    className="pl-10 pr-10 h-11"
                    {...form.register("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 
                      (language === "en" ? "Hide password" : "கடவுச்சொல்லை மறைக்க") : 
                      (language === "en" ? "Show password" : "கடவுச்சொல்லைக் காட்ட")
                    }
                  >
                    {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-temple-primary hover:bg-temple-primary/90 h-12 text-base font-semibold"
                disabled={changeCredentialsMutation.isPending}
              >
                {changeCredentialsMutation.isPending
                  ? (language === "en" ? "Updating..." : "புதுப்பிக்கிறது...")
                  : (language === "en" ? "Update Credentials" : "அறிமுக தகவலை புதுப்பிக்கவும்")
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="h-12 px-8"
              >
                {language === "en" ? "Reset" : "மீட்டமை"}
              </Button>
            </div>
          </form>


        </CardContent>
      </Card>
    </div>
  );
}