import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Modal } from "@/components/ui/modal";
import { formatCurrency, formatDate, formatPhoneNumber } from "@/lib/utils";
import { formatCurrencyTamil, formatDateTamil } from "@/lib/i18n";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { type DonorSummary } from "@shared/schema";

export default function DonorLookup() {
  const { language } = useLanguage();
  const t = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [communityFilter, setCommunityFilter] = useState("all");
  const [selectedDonor, setSelectedDonor] = useState<DonorSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<"phone" | "name">("phone");

  // Clear search when mode changes
  const handleModeChange = (newMode: "phone" | "name") => {
    setSearchMode(newMode);
    setSearchQuery("");
  };

  const { data: donors = [], isLoading } = useQuery({
    queryKey: ["/api/donors/search", searchQuery, communityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (communityFilter && communityFilter !== "all")
        params.append("community", communityFilter);

      const response = await fetch(`https://temple-donation-bnuj.onrender.com/api/donors/search?${params}`, {
  credentials: "include",
});


      if (!response.ok) {
        throw new Error("Failed to fetch donors");
      }

      return response.json();
    },
    enabled: (searchMode === "phone" ? searchQuery.length === 10 : searchQuery.length >= 3) || communityFilter !== "",
  });

  const showDonorDetails = (donor: DonorSummary) => {
    setSelectedDonor(donor);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 lg:space-y-8">
      <Card className="shadow-lg border-0 sm:border">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 lg:mb-8">
            {t("donorLookupTitle")}
          </h2>

          {/* Search Mode Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <Label className="text-sm sm:text-base font-medium mb-3 block">
              {language === "en" ? "Search Method" : "தேடல் முறை"}
            </Label>
            <RadioGroup
              value={searchMode}
              onValueChange={handleModeChange}
              className="flex flex-row gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone-mode" />
                <Label htmlFor="phone-mode" className="text-sm cursor-pointer">
                  {language === "en"
                    ? "Search by Phone Number"
                    : "தொலைபேசி எண் மூலம் தேடு"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name" id="name-mode" />
                <Label htmlFor="name-mode" className="text-sm cursor-pointer">
                  {language === "en" ? "Search by Name" : "பெயர் மூலம் தேடு"}
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">
                {searchMode === "phone"
                  ? language === "en"
                    ? "Phone Number"
                    : "தொலைபேசி எண்"
                  : language === "en"
                    ? "Donor Name"
                    : "நன்கொடையாளர் பெயர்"}
              </Label>
              <Input
                type={searchMode === "phone" ? "tel" : "text"}
                placeholder={
                  searchMode === "phone"
                    ? language === "en"
                      ? "Enter phone number (e.g., 9876543210)"
                      : "தொலைபேசி எண்ணை உள்ளிடவும் (எ.கா., 9876543210)"
                    : language === "en"
                      ? "Enter donor name (e.g., Raman Kumar)"
                      : "நன்கொடையாளர் பெயரை உள்ளிடவும் (எ.கா., ராமன் குமார்)"
                }
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  // Validate input based on search mode
                  if (searchMode === "phone") {
                    // Only allow numbers for phone search, max 10 digits
                    if (/^\d*$/.test(value) && value.length <= 10) {
                      setSearchQuery(value);
                    }
                  } else {
                    // Allow letters, spaces, dots, and common name characters for name search
                    if (/^[a-zA-Z\s\.\-&]*$/.test(value)) {
                      setSearchQuery(value);
                    }
                  }
                }}
                className="text-sm sm:text-base border-2 border-temple-primary/30 focus:border-temple-primary h-11 sm:h-12"
              />
              <p className="text-xs sm:text-sm text-gray-500">
                {searchMode === "phone"
                  ? language === "en"
                    ? "Enter exactly 10 digits for phone number"
                    : "தொலைபேசி எண்ணுக்கு சரியாக 10 இலக்கங்களை உள்ளிடவும்"
                  : language === "en"
                    ? "Enter at least 3 characters (letters only)"
                    : "குறைந்தபட்சம் 3 எழுத்துகளை உள்ளிடவும் (எழுத்துகள் மட்டும்)"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium">
                {t("filterByCommunity")}
              </Label>
              <Select
                value={communityFilter}
                onValueChange={setCommunityFilter}
              >
                <SelectTrigger className="text-sm sm:text-base h-11 sm:h-12">
                  <SelectValue placeholder={t("allCommunities")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCommunities")}</SelectItem>
                  <SelectItem value="payiran">{t("payiran")}</SelectItem>
                  <SelectItem value="semban">{t("semban")}</SelectItem>
                  <SelectItem value="othaalan">{t("othaalan")}</SelectItem>
                  <SelectItem value="aavan">{t("aavan")}</SelectItem>
                  <SelectItem value="aadai">{t("aadai")}</SelectItem>
                  <SelectItem value="vizhiyan">{t("vizhiyan")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-500">{t("loading")}</p>
              </div>
            )}

            {!isLoading && ((searchMode === "phone" && searchQuery.length < 10) || (searchMode === "name" && searchQuery.length < 3)) && communityFilter === "" && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchMode === "phone"
                    ? language === "en"
                      ? "Enter exactly 10 digits for phone number search"
                      : "தொலைபேசி எண் தேடலுக்கு சரியாக 10 இலக்கங்களை உள்ளிடவும்"
                    : t("enterAtLeast3Digits")}
                </p>
              </div>
            )}

            {!isLoading &&
              ((searchMode === "phone" && searchQuery.length === 10) || (searchMode === "name" && searchQuery.length >= 3) || communityFilter !== "") &&
              donors.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t("noDonorsFound")}</p>
                </div>
              )}

            {donors.map((donor: DonorSummary) => (
              <div
                key={donor.phone}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => showDonorDetails(donor)}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                      {donor.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {formatPhoneNumber(donor.phone)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {donor.location}
                    </p>
                    {donor.community && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t("community")}: {donor.community}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="font-medium text-temple-primary text-sm sm:text-base">
                      {language === "ta"
                        ? formatCurrencyTamil(donor.totalAmount)
                        : formatCurrency(donor.totalAmount)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {donor.donationCount}{" "}
                      {language === "en" ? "donations" : "நன்கொடைகள்"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {t("lastDonation")}:{" "}
                      {language === "ta"
                        ? formatDateTamil(donor.lastDonation)
                        : formatDate(donor.lastDonation)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Donor Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={language === "en" ? "Donor Details" : "நன்கொடையாளர் விவரங்கள்"}
        size="xl"
      >
        {selectedDonor && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {selectedDonor.name}
                  </h4>
                  <p className="text-gray-600">
                    {formatPhoneNumber(selectedDonor.phone)}
                  </p>
                  <p className="text-gray-600">{selectedDonor.location}</p>
                  {selectedDonor.community && (
                    <p className="text-gray-600">
                      {t("community")}: {selectedDonor.community}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-temple-accent p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-temple-primary">
                      {formatCurrency(selectedDonor.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600">Total Donated</p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedDonor.donationCount}
                    </p>
                    <p className="text-sm text-gray-600">Total Visits</p>
                  </div>
                </div>
              </div>
            </div>

            <h4 className="font-medium text-gray-900 mb-4">Donation History</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Receipt No.</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Payment Mode</th>
                    <th className="px-4 py-2 text-left">Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedDonor.donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-4 py-2">
                        {formatDate(donation.createdAt)}
                      </td>
                      <td className="px-4 py-2">{donation.receiptNo}</td>
                      <td className="px-4 py-2 font-medium text-temple-primary">
                        {formatCurrency(donation.amount)}
                      </td>
                      <td className="px-4 py-2 capitalize">
                        {donation.paymentMode}
                      </td>
                      <td className="px-4 py-2">
                        {donation.inscription ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
