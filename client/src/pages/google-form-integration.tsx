import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { ExternalLink, Copy, RefreshCw, Phone } from "lucide-react";

export default function GoogleFormIntegration() {
  const { language } = useLanguage();
  const t = useTranslation();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [isGeneratingForm, setIsGeneratingForm] = useState(false);

  const googleFormTemplate = `
🕉️ TEMPLE DONATION FORM - Manual Receipt Entry

Please copy this template to create your Google Form:

FORM TITLE: Temple Donation Collection Form

FORM DESCRIPTION: 
"Submit your donation details through this form. Please ensure all required fields are completed accurately. Your donation receipt will be processed manually by our temple administration."

FORM FIELDS:

1. Receipt Number (Text - Required)
   - Question: "Receipt Number"
   - Description: "Enter the receipt number provided by temple administration (e.g., 1, 2, A001, etc.)"
   - Validation: Required

2. Donor Name (Text - Required)
   - Question: "Full Name"
   - Description: "Enter your complete name as it should appear on the receipt"
   - Validation: Required

3. Phone Number (Text - Required)
   - Question: "Mobile/Phone Number"
   - Description: "Enter 10-digit mobile number (e.g., 9876543210)"
   - Validation: Required, Regular expression: ^[0-9]{10}$

4. Community/Kulam (Multiple Choice - Required)
   - Question: "Community (Kulam)"
   - Options:
     • Any / எதுவும்
     • Payiran / பயிரான்
     • Semban / செம்பன்
     • Othaalan / ஓதாளன் 
     • Aavan / ஆவான்
     • Aadai / ஆடை
     • Vizhiyan / விழியன்
   - Validation: Required

5. Location (Text - Required)
   - Question: "City/Village"
   - Description: "Enter your city or village name"
   - Validation: Required

6. Donation Amount (Number - Required)
   - Question: "Donation Amount (₹)"
   - Description: "Enter donation amount in rupees (numbers only)"
   - Validation: Required, Number, Greater than 0

7. Payment Mode (Multiple Choice - Required)
   - Question: "Payment Method"
   - Options:
     • Cash
     • Card (Debit/Credit)
     • UPI
     • Bank Transfer
     • Cheque
   - Validation: Required

8. Inscription Required (Multiple Choice - Required)
   - Question: "Inscription Required?"
   - Description: "Do you require inscription service?"
   - Options:
     • Yes
     • No
   - Validation: Required

9. Donation Date (Date - Optional)
   - Question: "Donation Date"
   - Description: "Select the date of donation (leave blank for today's date)"
   - Type: Date
4. Set up Apps Script trigger to send data to our webhook
5. Use the webhook URL: ${window.location.origin}/api/google-form-webhook
`;

  const generateFormCode = () => {
    const code = `
// Google Apps Script Code for Temple Donation Form Integration
// This script automatically sends form submissions to your temple donation system

function onFormSubmit(e) {
  const responses = e.namedValues;
  
  // Extract form data - Field names match the Google Form setup
  const donationData = {
    receiptNo: responses['Receipt Number'] ? responses['Receipt Number'][0] : null,
    name: responses['Full Name'][0],
    phone: responses['Mobile/Phone Number'][0],
    community: mapCommunity(responses['Community (Kulam)'][0]),
    location: responses['City/Village'][0],
    amount: parseInt(responses['Donation Amount (₹)'][0]),
    paymentMode: mapPaymentMode(responses['Payment Method'][0]),
    inscription: responses['Inscription Required?'][0].toLowerCase() === 'yes',
    donationDate: responses['Donation Date'] ? responses['Donation Date'][0] : null
  };
  
  // Send to your temple website's webhook endpoint
  const webhookUrl = '${window.location.origin}/api/google-form-webhook';
  
  const options = {
    'method': 'POST',
    'headers': {
      'Content-Type': 'application/json',
    },
    'payload': JSON.stringify(donationData)
  };
  
  try {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    if (response.getResponseCode() === 200) {
      console.log('✅ Donation submitted successfully to temple system');
      console.log('Receipt Number:', donationData.receiptNo);
    } else {
      console.error('❌ Error response:', response.getContentText());
    }
  } catch (error) {
    console.error('❌ Failed to submit donation:', error);
    // You can add email notification here for failed submissions
  }
}

// Helper function to map community names to system values
function mapCommunity(community) {
  const communityMap = {
    'Any / எதுவும்': 'any',
    'Payiran / பயிரான்': 'payiran',
    'Semban / செம்பன்': 'semban',
    'Othaalan / ஓதாளன்': 'othaalan',
    'Aavan / ஆவான்': 'aavan',
    'Aadai / ஆடை': 'aadai',
    'Vizhiyan / விழியன்': 'vizhiyan'
  };
  return communityMap[community] || 'any';
}

// Helper function to map payment modes to system values
function mapPaymentMode(paymentMode) {
  const paymentMap = {
    'Cash': 'cash',
    'Card (Debit/Credit)': 'card',
    'UPI': 'upi',
    'Bank Transfer': 'bank_transfer',
    'Cheque': 'cheque'
  };
  return paymentMap[paymentMode] || 'cash';
}
`;
    return code;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    });
  };

  const testWebhook = async () => {
    try {
      const testData = {
        receiptNo: "TEST001",
        name: "Test Donor",
        phone: "9999999999",
        community: "local",
        location: "Test Location",
        amount: 1000,
        paymentMode: "upi",
        inscription: false
      };

      const response = await apiRequest("POST", "/api/google-form-webhook", testData);
      toast({
        title: "Test Successful",
        description: "Webhook is working correctly",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Webhook test failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Google Form Integration</h2>
        <Badge variant="outline" className="bg-temple-accent text-temple-primary">
          <Phone className="h-3 w-3 mr-1" />
          Phone Primary Search
        </Badge>
      </div>

      {/* Step-by-Step Form Creation Guide */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Create Your Google Form Now</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2">✅ Google Form Setup Steps</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.open('https://forms.google.com/create', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Create Form Now
                </Button>
                <span className="text-sm text-blue-700">Click to start creating your form</span>
              </div>
              
              <div className="text-sm text-blue-800">
                <p><strong>Step 1: Create the Form</strong></p>
                <p><strong>Title:</strong> Temple Donation Collection Form</p>
                <p><strong>Description:</strong> Submit your donation details through this form. Please ensure all required fields are completed accurately.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-temple-primary pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Step 1: Form Setup</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> Temple Donation Collection Form</p>
                <p><strong>Description:</strong> Submit your donation details through this form. Please ensure all required fields are completed accurately.</p>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Step 2: Add These Fields</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Full Name</strong> – Short answer, Required</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <p><strong>Mobile/Phone Number</strong> – Short answer, Required</p>
                  <p className="text-xs text-gray-600 mt-1">Use Regular expression for validation: <code>^\d{10}$</code></p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <p><strong>Community (Kulam)</strong> – Multiple choice, Required</p>
                  <p className="text-xs text-blue-600 mt-1">Add community options with Tamil text</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>City/Village</strong> – Short answer, Required</p>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <p><strong>Donation Amount (₹)</strong> – Number, Required</p>
                  <p className="text-xs text-green-600 mt-1">Set validation to: Greater than 0</p>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <p><strong>Payment Method</strong> – Multiple choice, Required</p>
                  <p className="text-xs text-purple-600 mt-1">Add 5 payment options</p>
                </div>
                <div className="bg-orange-50 p-3 rounded border border-orange-200">
                  <p><strong>Inscription Required?</strong> – Multiple choice, Required</p>
                  <p className="text-xs text-orange-600 mt-1">Options: Yes, No</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>Donation Date</strong> – Date, Optional</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800"><strong>✅ Once done:</strong> Click "Send" → choose the link icon → copy the link to your form.</p>
              </div>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">Step 3: Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-temple-accent rounded-lg">
                  <div className="text-2xl font-bold text-temple-primary mb-2">📋</div>
                  <h4 className="font-medium">Copy Template</h4>
                  <p className="text-sm text-gray-600">Get field details below</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">⚙️</div>
                  <h4 className="font-medium">Add Apps Script</h4>
                  <p className="text-sm text-gray-600">Copy integration code</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">✅</div>
                  <h4 className="font-medium">Test Form</h4>
                  <p className="text-sm text-gray-600">Verify data flow</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Information */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Webhook Configuration</h3>
          <div className="space-y-4">
            <div>
              <Label>Webhook URL (Use this in your Apps Script)</Label>
              <div className="flex space-x-2 mt-1">
                <Input 
                  value={`${window.location.origin}/api/google-form-webhook`}
                  readOnly 
                  className="bg-gray-50"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}/api/google-form-webhook`, "Webhook URL")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={testWebhook} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Webhook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Template */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Google Form Template</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(googleFormTemplate, "Form template")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Template
            </Button>
          </div>
          <Textarea 
            value={googleFormTemplate}
            readOnly
            className="min-h-[300px] bg-gray-50 text-sm font-mono"
          />
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Phone number is the primary identifier - ensure it's validated for 10 digits</li>
              <li>• Existing donors will be automatically detected by phone number</li>
              <li>• Community and location are optional but recommended for better organization</li>
              <li>• All payment modes are supported in the system</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Visual Form Creation Guide */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Field-by-Field Setup Guide</h3>
          
          <div className="space-y-4">
            {/* Field 1 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                <h4 className="font-semibold text-gray-900">Receipt Number</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Short answer</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Validation:</strong> None</div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Description:</strong> "Enter the receipt number provided by temple administration (e.g., 1, 2, A001, etc.)"
              </div>
            </div>

            {/* Field 2 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                <h4 className="font-semibold text-gray-900">Full Name</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Short answer</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Validation:</strong> None</div>
              </div>
            </div>

            {/* Field 3 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                <h4 className="font-semibold text-gray-900">Mobile/Phone Number</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Short answer</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Validation:</strong> Regular expression</div>
              </div>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Validation Pattern:</strong> <code>^[0-9]{10}$</code><br/>
                <strong>Error Message:</strong> "Please enter a valid 10-digit phone number"
              </div>
            </div>

            {/* Field 4 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                <h4 className="font-semibold text-gray-900">Community (Kulam)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Multiple choice</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Options:</strong> 7 choices</div>
              </div>
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong>Add these options:</strong><br/>
                • Any / எதுவும்<br/>
                • Payiran / பயிரான்<br/>
                • Semban / செம்பன்<br/>
                • Othaalan / ஓதாளன்<br/>
                • Aavan / ஆவான்<br/>
                • Aadai / ஆடை<br/>
                • Vizhiyan / விழியன்
              </div>
            </div>

            {/* Field 5 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</div>
                <h4 className="font-semibold text-gray-900">City/Village</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Short answer</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Validation:</strong> None</div>
              </div>
            </div>

            {/* Field 6 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">6</div>
                <h4 className="font-semibold text-gray-900">Donation Amount (₹)</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Number</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Validation:</strong> Greater than 0</div>
              </div>
            </div>

            {/* Field 7 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">7</div>
                <h4 className="font-semibold text-gray-900">Payment Method</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Multiple choice</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Options:</strong> 5 choices</div>
              </div>
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <strong>Add these options:</strong><br/>
                • Cash<br/>
                • Card (Debit/Credit)<br/>
                • UPI<br/>
                • Bank Transfer<br/>
                • Cheque
              </div>
            </div>

            {/* Field 8 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-temple-primary text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">8</div>
                <h4 className="font-semibold text-gray-900">Inscription Required?</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Multiple choice</div>
                <div><strong>Required:</strong> ✅ Yes</div>
                <div><strong>Options:</strong> 2 choices</div>
              </div>
              <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                <strong>Add these options:</strong><br/>
                • Yes<br/>
                • No
              </div>
            </div>

            {/* Field 9 */}
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">9</div>
                <h4 className="font-semibold text-gray-900">Donation Date</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><strong>Type:</strong> Date</div>
                <div><strong>Required:</strong> ❌ Optional</div>
                <div><strong>Validation:</strong> None</div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Description:</strong> "Select the date of donation (leave blank for today's date)"
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Final Steps After Creating Form:</h4>
            <ol className="text-sm text-green-700 list-decimal list-inside space-y-1">
              <li>Click "Send" to get the form link</li>
              <li>Go to the 3-dot menu → Script editor</li>
              <li>Paste the Apps Script code from below</li>
              <li>Set up the trigger for form submissions</li>
              <li>Test the form with sample data</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Apps Script Code */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Apps Script Integration Code</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(generateFormCode(), "Apps Script code")}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
          <Textarea 
            value={generateFormCode()}
            readOnly
            className="min-h-[400px] bg-gray-50 text-sm font-mono"
          />
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Complete Setup Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
              <li><strong>Create Google Form:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  <li>Go to <a href="https://forms.google.com" target="_blank" className="underline">forms.google.com</a></li>
                  <li>Click "+" to create a new form</li>
                  <li>Set title: "Temple Donation Collection Form"</li>
                </ul>
              </li>
              <li><strong>Add Form Fields:</strong> Use the template above to create each field with exact names and validation</li>
              <li><strong>Set Up Apps Script:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  <li>In your form, click the 3-dot menu → Script editor</li>
                  <li>Delete default code and paste the Apps Script code above</li>
                  <li>Save with name "DonationWebhook"</li>
                </ul>
              </li>
              <li><strong>Create Trigger:</strong>
                <ul className="ml-4 mt-1 list-disc">
                  <li>In Apps Script, click Triggers (clock icon)</li>
                  <li>Add trigger → Function: onFormSubmit → Event source: From form → Event type: On form submit</li>
                  <li>Save and authorize permissions</li>
                </ul>
              </li>
              <li><strong>Test Integration:</strong> Submit a test response to verify data appears in your temple system</li>
            </ol>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Important Notes:</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Ensure receipt numbers are coordinated with temple administration</li>
              <li>Test the form before sharing with donors</li>
              <li>Form responses will automatically sync to your donation system</li>
              <li>Monitor Apps Script execution logs for any issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-temple-primary">Automated Processing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic receipt number generation</li>
                <li>• Real-time donor history detection via phone</li>
                <li>• Instant dashboard updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-temple-primary">Smart Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Phone number as primary identifier</li>
                <li>• Automatic donor data prefilling</li>
                <li>• Collection statistics tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}