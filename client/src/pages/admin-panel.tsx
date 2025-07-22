import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils";
import { formatCurrencyTamil, formatDateTamil } from "@/lib/i18n";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { Download, Plus, Edit, Trash2, LogOut, Settings } from "lucide-react";
import { type Donation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Modal } from "@/components/ui/modal";
import AdminLogin from "./admin-login";
import AdminSettings from "./admin-settings";
import DonationForm from "./donation-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(
    null,
  );
  const { language } = useLanguage();
  const t = useTranslation();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    dateRange: "all",
    community: "any",
    paymentMode: "all",
    amountRange: "all",
  });

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("https://temple-donation-bnuj.onrender.com/api/auth/status", {
  credentials: "include",
});
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUsername(data.username || "");
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("https://temple-donation-bnuj.onrender.com/api/auth/logout", {
  method: "POST",
  credentials: "include",
});
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setUsername("");
    },
  });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // Re-check authentication status to get username
    const checkAuth = async () => {
      try {
        const response = await fetch("https://temple-donation-bnuj.onrender.com/api/auth/status", {
  credentials: "include",
});
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUsername(data.username || "");
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  };

  const { data: donations = [], isLoading } = useQuery<Donation[]>({
    queryKey: ["/api/donations", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all" && value !== "any") {
          params.append(key, value);
        }
      });

      const response = await fetch(`https://temple-donation-bnuj.onrender.com/api/donations?${params}`, {
  credentials: "include",
});


      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      return response.json();
    },
    enabled: isAuthenticated === true, // Only run query when authenticated
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`https://temple-donation-bnuj.onrender.com/api/donations/${id}`, {
  method: "DELETE",
  credentials: "include",
});

      if (!response.ok) {
        throw new Error("Failed to delete donation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      toast({
        title: "Success",
        description: "Donation deleted successfully",
      });
      setDeletingDonation(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete donation",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDelete = (donation: Donation) => {
    setDeletingDonation(donation);
  };

  const confirmDelete = () => {
    if (deletingDonation) {
      deleteMutation.mutate(deletingDonation.id);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("https://temple-donation-bnuj.onrender.com/api/donations/export", {
  credentials: "include",
});


      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "donations.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const getPaymentModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      cash: "bg-green-100 text-green-800",
      upi: "bg-blue-100 text-blue-800",
      card: "bg-purple-100 text-purple-800",
      "bank-transfer": "bg-orange-100 text-orange-800",
      cheque: "bg-gray-100 text-gray-800",
    };
    return colors[mode] || "bg-gray-100 text-gray-800";
  };

  // Show login form if not authenticated
  if (isAuthenticated === false) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          {language === "en" ? "Loading..." : "ஏற்றுகிறது..."}
        </div>
      </div>
    );
  }

  // Show settings page if requested
  if (showSettings) {
    return <AdminSettings onBack={() => setShowSettings(false)} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">
          {language === "en"
            ? "Loading donations..."
            : "நன்கொடைகளை ஏற்றுகிறது..."}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
            {t("adminPanel")}
          </h2>
          <div className="text-sm text-gray-500">
            {language === "en"
              ? `Welcome, ${username}`
              : `வரவேற்கிறோம், ${username}`}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="bg-temple-primary hover:bg-temple-primary/90 text-sm sm:text-base h-10 sm:h-11"
            onClick={() => setShowManualEntry(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === "en" ? "Add Manual Entry" : "கைமுறை பதிவு சேர்"}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="text-sm sm:text-base h-10 sm:h-11"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="text-sm sm:text-base h-10 sm:h-11"
          >
            <Settings className="h-4 w-4 mr-2" />
            {language === "en" ? "Settings" : "அமைப்புகள்"}
          </Button>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-sm sm:text-base h-10 sm:h-11 text-red-600 hover:text-red-700"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {language === "en" ? "Logout" : "வெளியேறு"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-3 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {language === "en" ? "Filters" : "வடிகட்டிகள்"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, dateRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kulam
              </label>
              <Select
                value={filters.community}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, community: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Kulam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">
                    {language === "en" ? "Any" : "எதையும்"}
                  </SelectItem>
                  <SelectItem value="payiran">{t("payiran")}</SelectItem>
                  <SelectItem value="semban">{t("semban")}</SelectItem>
                  <SelectItem value="othaalan">{t("othaalan")}</SelectItem>
                  <SelectItem value="aavan">{t("aavan")}</SelectItem>
                  <SelectItem value="aadai">{t("aadai")}</SelectItem>
                  <SelectItem value="vizhiyan">{t("vizhiyan")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Mode
              </label>
              <Select
                value={filters.paymentMode}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, paymentMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Range
              </label>
              <Select
                value={filters.amountRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, amountRange: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Amounts</SelectItem>
                  <SelectItem value="0-1000">₹0 - ₹1,000</SelectItem>
                  <SelectItem value="1001-5000">₹1,001 - ₹5,000</SelectItem>
                  <SelectItem value="5001-10000">₹5,001 - ₹10,000</SelectItem>
                  <SelectItem value="10000+">₹10,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              All Donations
            </h3>
            <p className="text-sm text-gray-600">
              Showing {donations.length} record
              {donations.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="overflow-auto max-h-96 border-t">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                No donations found matching your criteria
              </p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kulam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation, index) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-temple-primary">
                      {donation.receiptNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {donation.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {donation.community || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {donation.location || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {(donation as any).address || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatPhoneNumber(donation.phone)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-temple-primary">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={getPaymentModeColor(donation.paymentMode)}
                      >
                        {donation.paymentMode.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {donation.inscription ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(donation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-temple-primary hover:text-temple-primary/80"
                          onClick={() => setEditingDonation(donation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(donation)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingDonation}
        onOpenChange={() => setDeletingDonation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this donation record? This action
              cannot be undone.
              <br />
              <br />
              <strong>Receipt:</strong> {deletingDonation?.receiptNo}
              <br />
              <strong>Donor:</strong> {deletingDonation?.name}
              <br />
              <strong>Amount:</strong>{" "}
              {deletingDonation && formatCurrency(deletingDonation.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeletingDonation(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <Modal
          isOpen={showManualEntry}
          onClose={() => setShowManualEntry(false)}
          title={language === "en" ? "Add Manual Entry" : "கைமுறை பதிவு சேர்"}
          size="xl"
        >
          <DonationForm
            onSuccess={() => {
              setShowManualEntry(false);
              queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
              toast({
                title: language === "en" ? "Success" : "வெற்றி",
                description: language === "en" 
                  ? "Manual donation entry added successfully!"
                  : "கைமுறை நன்கொடை பதிவு வெற்றிகரமாக சேர்க்கப்பட்டது!",
              });
            }}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editingDonation && (
        <Modal
          isOpen={!!editingDonation}
          onClose={() => setEditingDonation(null)}
          title="Edit Donation"
          size="xl"
        >
          <DonationForm
            initialData={editingDonation}
            onSuccess={() => {
              setEditingDonation(null);
              queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
            }}
          />
        </Modal>
      )}
    </div>
  );
}
