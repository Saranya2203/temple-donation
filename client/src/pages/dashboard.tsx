import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsCard } from "@/components/ui/stats-card";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { formatCurrencyTamil, formatDateTamil } from "@/lib/i18n";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { Coins, Users, Calendar, TrendingUp, Download } from "lucide-react";
import { type DashboardStats } from "@shared/schema";

export default function Dashboard() {
  const { language } = useLanguage();
  const t = useTranslation();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const handleExport = async () => {
    try {
      const response = await fetch('/api/donations/export', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'donations.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Collection Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Collection Dashboard</h2>
        <div className="flex space-x-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="bg-temple-primary hover:bg-temple-primary/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title={t("totalCollection")}
          value={language === "ta" ? formatCurrencyTamil(stats.totalCollection) : formatCurrency(stats.totalCollection)}
          icon={<Coins className="h-6 w-6 text-temple-primary" />}
          iconBgColor="bg-temple-accent"
          change={{ value: language === "en" ? "12% from last month" : "கடந்த மாதத்திலிருந்து 12%", positive: true }}
        />

        <StatsCard
          title={t("totalDonors")}
          value={stats.totalDonors.toString()}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          change={{ value: language === "en" ? "8% from last month" : "கடந்த மாதத்திலிருந்து 8%", positive: true }}
        />

        <StatsCard
          title={t("thisMonth")}
          value={language === "ta" ? formatCurrencyTamil(stats.thisMonth) : formatCurrency(stats.thisMonth)}
          icon={<Calendar className="h-6 w-6 text-green-600" />}
          iconBgColor="bg-green-100"
          subtitle={`${stats.recentDonations.length} ${language === "en" ? "donations" : "நன்கொடைகள்"}`}
        />

        <StatsCard
          title={t("averageDonation")}
          value={language === "ta" ? formatCurrencyTamil(stats.avgDonation) : formatCurrency(stats.avgDonation)}
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          change={{ value: language === "en" ? "5% from last month" : "கடந்த மாதத்திலிருந்து 5%", positive: true }}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t("paymentModeDistribution")}</h3>
            <div className="space-y-3 sm:space-y-4">
              {stats.paymentModeDistribution.map((mode) => (
                <div key={mode.mode}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs sm:text-sm text-gray-600 capitalize">{mode.mode}</span>
                    <span className="text-xs sm:text-sm font-medium">{mode.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-temple-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${mode.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-3 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{t("recentDonations")}</h3>
            <div className="space-y-3 sm:space-y-4">
              {stats.recentDonations.length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">{language === "en" ? "No recent donations" : "சமீபத்திய நன்கொடைகள் இல்லை"}</p>
              ) : (
                stats.recentDonations.map((donation, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100 last:border-0 space-y-1 sm:space-y-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{donation.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {language === "ta" ? formatDateTamil(donation.createdAt) : formatDateTime(donation.createdAt)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="font-medium text-temple-primary text-sm sm:text-base">
                        {language === "ta" ? formatCurrencyTamil(donation.amount) : formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">{donation.paymentMode}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
