import { useState } from "react";
import { useTranslation } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload, FileText, Download, AlertCircle, CheckCircle } from "lucide-react";
import * as XLSX from 'xlsx';

interface ImportResult {
  success: boolean;
  totalRecords: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export default function ImportData() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const t = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/donations/import', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (result: ImportResult) => {
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: t("success"),
          description: `Successfully imported ${result.successCount} of ${result.totalRecords} donations`,
        });
        // Invalidate donations cache to refresh data
        queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      } else {
        toast({
          title: t("error"),
          description: `Import completed with errors. ${result.successCount}/${result.totalRecords} records imported.`,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Import error:', error);
      toast({
        title: t("error"),
        description: "Failed to import data. Please check the file format and try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type - accept CSV and Excel files
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const isValidFile = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidFile) {
        toast({
          title: t("error"),
          description: "Please select a CSV (.csv) or Excel (.xlsx, .xls) file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: t("error"),
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }
    
    importMutation.mutate(selectedFile);
  };

  const downloadTemplate = (format: 'csv' | 'excel' = 'csv') => {
    const headers = [
      'S.No',
      'Receipt No',
      'Name',
      'Community',
      'Location',
      'Address',
      'Phone',
      'Amount',
      'Payment Mode',
      'Inscription',
      'Date'
    ];
    
    const sampleData = [
      [1, 'R001', 'John Doe', 'payiran', 'Chennai', '123 Temple Street', '9876543210', 1000, 'cash', 'No', '30/06/2025'],
      [2, 'R002', 'Jane Smith', 'chozhan', 'Madurai', '456 Anna Nagar', '8765432109', 2000, 'upi', 'Yes', '29/06/2025'],
      [3, 'R003', 'Ram Kumar', 'any', 'Trichy', '789 Gandhi Road', '9123456789', 500, 'card', 'No', '28/06/2025']
    ];

    if (format === 'excel') {
      // Create Excel file
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
      
      // Download Excel file
      XLSX.writeFile(workbook, 'donation_import_template.xlsx');
    } else {
      // Create CSV file
      const csvContent = [
        headers.join(','),
        ...sampleData.map(row => 
          row.map(cell => 
            typeof cell === 'string' && cell.includes(',') 
              ? `"${cell}"` 
              : cell
          ).join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'donation_import_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("importData")}
          </h1>
          <p className="text-gray-600 mt-2">
            Import donation data from CSV or Excel files. Download the template below for the correct format.
          </p>
          
          {/* Instructions Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h3 className="font-medium text-blue-900 mb-2">File Format Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Required fields:</strong> Name, Phone, Amount</li>
              <li>• <strong>Phone:</strong> Must be exactly 10 digits</li>
              <li>• <strong>Amount:</strong> Numbers only (no currency symbols)</li>
              <li>• <strong>Community:</strong> any, payiran, chozhan, pandiyan, othaalan, vizhiyan, aadai, aavan, odhaalan, semban</li>
              <li>• <strong>Payment Mode:</strong> cash, card, upi, bankTransfer, cheque</li>
              <li>• <strong>Inscription:</strong> Yes/No</li>
              <li>• <strong>Date format:</strong> DD/MM/YYYY (e.g., 30/06/2025) or DD-MM-YYYY (e.g., 30-06-2025)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileText className="h-12 w-12 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to select CSV or Excel file or drag and drop
                </span>
              </label>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Remove
                </Button>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!selectedFile || importMutation.isPending}
              className="w-full"
            >
              {importMutation.isPending ? "Importing..." : "Import Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Template Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Download Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Download sample templates with the correct format and headers.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Required Columns:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• receiptNo (unique receipt number)</li>
                <li>• name (donor name)</li>
                <li>• phone (10-digit phone number)</li>
                <li>• location (donor location)</li>
                <li>• address (donor address, optional)</li>
                <li>• community (any, payiran, semban, othaalan, aavan, aadai, vizhiyan)</li>
                <li>• amount (donation amount as number)</li>
                <li>• paymentMode (cash, card, upi, bankTransfer, cheque)</li>
                <li>• inscription (Yes/No)</li>
                <li>• date (M/D/YYYY format, optional)</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  downloadTemplate('csv');
                }}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV Template
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  downloadTemplate('excel');
                }}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Excel Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              )}
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.totalRecords}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.successCount}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.failureCount}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((importResult.successCount / importResult.totalRecords) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium text-sm mb-3 text-red-600 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Detailed Error Report ({importResult.errors.length} errors)</span>
                  </h4>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-3 bg-gray-50">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                        <div className="text-sm text-red-700 font-medium mb-1">
                          {error.split(':')[0]}:
                        </div>
                        <div className="text-xs text-red-600 pl-2">
                          {error.split(':').slice(1).join(':').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">Common Issues:</h5>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Phone numbers must be exactly 10 digits</li>
                      <li>• Amount must be a valid number greater than 0</li>
                      <li>• Payment mode must be: cash, card, upi, bankTransfer, or cheque</li>
                      <li>• Community must be one of the valid options</li>
                      <li>• Name and Receipt Number are required fields</li>
                      <li>• Date must be in DD/MM/YYYY format (e.g., 30/06/2025) or DD-MM-YYYY format</li>
                      <li>• Excel files: Format date cells as text to avoid serial number conversion</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}