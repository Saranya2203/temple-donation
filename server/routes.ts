import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDonationSchema } from "@shared/schema";
import { z } from "zod";
import { validateAdminCredentials, generateSecurePassword, validatePasswordStrength, getAllAdmins, SECURITY_RECOMMENDATIONS } from "./admin-credentials";
import multer from "multer";
import csv from "csv-parser";
import * as XLSX from "xlsx";

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: any) => {
  if (req.session?.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
};

declare module 'express-session' {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
    role?: string;
  }
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const validMimeTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    
    if (validMimeTypes.includes(file.mimetype) || 
        validExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext))) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {

  // Admin authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = validateAdminCredentials(username, password);
      if (admin) {
        req.session.isAuthenticated = true;
        req.session.username = username;
        req.session.role = admin.role;
        res.json({ 
          success: true, 
          message: "Login successful",
          role: admin.role 
        });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
      } else {
        res.json({ success: true, message: "Logout successful" });
      }
    });
  });

  app.get("/api/auth/status", (req, res) => {
    res.json({ 
      isAuthenticated: !!req.session?.isAuthenticated,
      username: req.session?.username,
      role: req.session?.role
    });
  });

  // Get admin users list
  app.get("/api/auth/admins", requireAuth, async (req, res) => {
    try {
      const admins = getAllAdmins();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  // Generate secure password
  app.get("/api/auth/generate-password", requireAuth, async (req, res) => {
    try {
      const password = generateSecurePassword(16);
      const validation = validatePasswordStrength(password);
      res.json({ password, validation });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate password" });
    }
  });

  // Get security recommendations
  app.get("/api/auth/security-recommendations", (req, res) => {
    const language = req.query.lang as string || 'en';
    res.json(SECURITY_RECOMMENDATIONS[language as keyof typeof SECURITY_RECOMMENDATIONS] || SECURITY_RECOMMENDATIONS.en);
  });

  // Validate password strength
  app.post("/api/auth/validate-password", (req, res) => {
    try {
      const { password } = req.body;
      const validation = validatePasswordStrength(password);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate password" });
    }
  });
  
  // Check if receipt number exists
  app.get("/api/donations/check-receipt/:receiptNo", async (req, res) => {
    try {
      const { receiptNo } = req.params;
      const donations = await storage.getAllDonations();
      const exists = donations.some(donation => donation.receiptNo === receiptNo);
      res.json({ exists });
    } catch (error) {
      res.status(500).json({ message: "Failed to check receipt number" });
    }
  });

  // Create a new donation
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      
      // Check for duplicate receipt number
      const donations = await storage.getAllDonations();
      const existingDonation = donations.find(donation => donation.receiptNo === donationData.receiptNo);
      
      if (existingDonation) {
        return res.status(400).json({ 
          message: "Receipt number already exists",
          field: "receiptNo",
          code: "DUPLICATE_RECEIPT"
        });
      }
      
      const donation = await storage.createDonation(donationData);
      res.json(donation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        res.status(400).json({ 
          message: "Receipt number already exists",
          field: "receiptNo",
          code: "DUPLICATE_RECEIPT"
        });
      } else {
        res.status(500).json({ message: "Failed to create donation" });
      }
    }
  });

  // Export donations as CSV (must be before /:id route)
  app.get("/api/donations/export", requireAuth, async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      
      // Create CSV content
      const headers = ['S.No', 'Receipt No', 'Name', 'Community', 'Location', 'Phone', 'Amount', 'Payment Mode', 'Inscription', 'Date'];
      const csvContent = [
        headers.join(','),
        ...donations.map((donation, index) => [
          index + 1,
          donation.receiptNo,
          `"${donation.name}"`,
          `"${donation.community || ''}"`,
          `"${donation.location || ''}"`,
          donation.phone,
          donation.amount,
          donation.paymentMode,
          donation.inscription ? 'Yes' : 'No',
          new Date(donation.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=donations.csv');
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: "Failed to export donations" });
    }
  });

  // Import donations from CSV or Excel (protected admin route)
  app.post("/api/donations/import", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No file uploaded" 
        });
      }

      const errors: string[] = [];
      let successCount = 0;
      let failureCount = 0;
      let records: any[] = [];

      const fileName = req.file.originalname.toLowerCase();
      
      // Parse file based on type
      if (fileName.endsWith('.csv')) {
        // Parse CSV file
        const csvText = req.file.buffer.toString('utf8');
        const lines = csvText.split('\n').filter(line => line.trim().length > 0);
        
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            message: "File must contain header row and at least one data row"
          });
        }

        // Parse CSV header
        const headerLine = lines[0];
        const headers = headerLine.split(',').map(h => h.replace(/"/g, '').trim());
        
        console.log('CSV Headers found:', headers);

        // Process each CSV data row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV row with proper quote handling
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim());

          // Create record object
          const record: any = {};
          headers.forEach((header, index) => {
            const cleanHeader = header.replace(/["\s\.]/g, '').toLowerCase();
            record[cleanHeader] = values[index] || '';
          });
          
          records.push(record);
        }
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Excel file must contain header row and at least one data row"
          });
        }

        const headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        console.log('Excel Headers found:', headers);

        // Process each Excel data row
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.every(cell => !cell)) continue;

          const record: any = {};
          headers.forEach((header, index) => {
            const cleanHeader = header.replace(/["\s\.]/g, '').toLowerCase();
            record[cleanHeader] = String(row[index] || '').trim();
          });
          
          records.push(record);
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "Unsupported file format. Please upload CSV or Excel files."
        });
      }

      console.log(`Processing ${records.length} records from ${fileName}`);

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        
        try {
          // Helper function to parse dates properly
          const parseDate = (dateValue: any): string | undefined => {
            if (!dateValue) return undefined;
            
            const dateStr = String(dateValue).trim();
            if (!dateStr) return undefined;
            
            // Handle Excel serial date numbers (days since 1900-01-01)
            if (/^\d{5,6}$/.test(dateStr)) {
              const serialDate = parseInt(dateStr);
              // Excel epoch starts from 1900-01-01, but with a leap year bug
              const excelEpoch = new Date(1900, 0, 1);
              const actualDate = new Date(excelEpoch.getTime() + (serialDate - 2) * 24 * 60 * 60 * 1000);
              return actualDate.toISOString().split('T')[0];
            }
            
            // Handle common date formats
            try {
              // Try parsing as DD/MM/YYYY or DD-MM-YYYY
              if (dateStr.includes('/') || dateStr.includes('-')) {
                const separator = dateStr.includes('/') ? '/' : '-';
                const parts = dateStr.split(separator);
                if (parts.length === 3) {
                  const [day, month, year] = parts;
                  // DD/MM/YYYY or DD-MM-YYYY format
                  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  if (!isNaN(date.getTime()) && date.getFullYear() == parseInt(year)) {
                    return date.toISOString().split('T')[0];
                  }
                }
              }
              
              // Try parsing as YYYY-MM-DD (fallback)
              if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const date = new Date(dateStr);
                if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
                }
              }
              
              // If all else fails, try direct parsing
              const date = new Date(dateStr);
              if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
                return date.toISOString().split('T')[0];
              }
            } catch (error) {
              console.log(`Date parsing failed for '${dateStr}':`, error);
            }
            
            return undefined;
          };

          // Map fields to donation data with flexible field names
          const donationData = {
            receiptNo: record.receiptno || record.receiptNumber || `R${Date.now()}-${i}`,
            name: record.name,
            phone: record.phone,
            location: record.location || '',
            address: record.address || '',
            community: record.community || 'any',
            amount: parseFloat(record.amount) || 0,
            paymentMode: (record.paymentmode || record.paymentMethod || 'cash').replace('bankTransfer', 'bankTransfer').replace('bank_transfer', 'bankTransfer'),
            inscription: record.inscription === 'Yes' || record.inscription === 'true',
            donationDate: parseDate(record.date || record.donationdate)
          };

          console.log(`Mapped donation data for row ${i + 1}:`, donationData);

          // Detailed validation with specific error messages
          const validationErrors: string[] = [];

          // Check name field
          if (!donationData.name || donationData.name.trim() === '') {
            validationErrors.push('Name is required and cannot be empty');
          }

          // Check phone field
          if (!donationData.phone || donationData.phone.trim() === '') {
            validationErrors.push('Phone number is required');
          } else if (!/^[0-9]{10}$/.test(donationData.phone.trim())) {
            validationErrors.push(`Phone number '${donationData.phone}' must be exactly 10 digits (current: ${donationData.phone.length} characters)`);
          }

          // Check amount field
          if (!record.amount || record.amount.trim() === '') {
            validationErrors.push('Amount is required');
          } else if (isNaN(parseFloat(record.amount)) || parseFloat(record.amount) <= 0) {
            validationErrors.push(`Amount '${record.amount}' must be a valid number greater than 0`);
          }

          // Check payment mode
          const validPaymentModes = ['cash', 'card', 'upi', 'bankTransfer', 'cheque'];
          const currentPaymentMode = donationData.paymentMode.toLowerCase();
          if (!validPaymentModes.includes(currentPaymentMode) && currentPaymentMode !== 'banktransfer') {
            validationErrors.push(`Payment mode '${donationData.paymentMode}' is invalid. Must be one of: ${validPaymentModes.join(', ')}`);
          }

          // Check community
          const validCommunities = ['any', 'payiran', 'chozhan', 'pandiyan', 'othaalan', 'vizhiyan', 'aadai', 'aavan', 'odhaalan', 'semban'];
          const currentCommunity = donationData.community.toLowerCase();
          if (!validCommunities.includes(currentCommunity)) {
            validationErrors.push(`Community '${donationData.community}' is not recognized. Valid options: ${validCommunities.join(', ')}`);
          }

          // Check receipt number format
          if (!donationData.receiptNo || donationData.receiptNo.trim() === '') {
            validationErrors.push('Receipt number is required');
          }

          // Check inscription field
          if (record.inscription && !['Yes', 'No', 'true', 'false', ''].includes(record.inscription)) {
            validationErrors.push(`Inscription '${record.inscription}' must be 'Yes' or 'No'`);
          }

          // Check date field if provided
          if ((record.date || record.donationdate) && !donationData.donationDate) {
            const originalDate = record.date || record.donationdate;
            validationErrors.push(`Date '${originalDate}' is not in a valid format. Use DD/MM/YYYY format (e.g., 30/06/2025) or DD-MM-YYYY format (e.g., 30-06-2025)`);
          }

          // If there are validation errors, throw detailed error
          if (validationErrors.length > 0) {
            throw new Error(validationErrors.join('; '));
          }

          // Fix payment mode format
          if (donationData.paymentMode === 'banktransfer' || donationData.paymentMode === 'bank_transfer') {
            donationData.paymentMode = 'bankTransfer';
          }

          // Validate with schema and create
          const validatedData = insertDonationSchema.parse(donationData);
          await storage.createDonation(validatedData);
          successCount++;

        } catch (error: any) {
          failureCount++;
          let errorMsg = `Row ${i + 1}: `;
          
          // Provide specific error messages based on error type
          if (error.name === 'ZodError') {
            const issues = error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
            errorMsg += `Validation failed - ${issues.join(', ')}`;
          } else if (error.message.includes('duplicate key')) {
            errorMsg += `Duplicate entry - this phone number or receipt number already exists`;
          } else if (error.message.includes('foreign key')) {
            errorMsg += `Database constraint error - invalid reference`;
          } else if (error.message.includes('not null')) {
            errorMsg += `Required field missing - ${error.message}`;
          } else if (error.message.includes('invalid input')) {
            errorMsg += `Invalid data format - ${error.message}`;
          } else {
            errorMsg += error.message;
          }
          
          // Add actual row data for debugging
          const rowData = Object.keys(record).map(key => `${key}: '${record[key]}'`).join(', ');
          errorMsg += ` (Data: ${rowData})`;
          
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(`Import completed: ${successCount} success, ${failureCount} failed`);

      res.json({
        success: successCount > 0,
        totalRecords: records.length,
        successCount,
        failureCount,
        errors: errors.slice(0, 20)
      });

    } catch (error: any) {
      console.error('Import error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to import data: " + error.message,
        errors: [error.message]
      });
    }
  });

  // Get all donations with optional filters (allow public access for donation entry)
  app.get("/api/donations", async (req, res) => {
    try {
      const { dateRange, community, paymentMode, amountRange } = req.query;
      
      const donations = await storage.getDonationsByFilters({
        dateRange: dateRange as string,
        community: community as string,
        paymentMode: paymentMode as string,
        amountRange: amountRange as string,
      });
      
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  // Get donation by ID
  app.get("/api/donations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donation ID" });
      }
      const donation = await storage.getDonationById(id);
      
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation" });
    }
  });

  // Update donation (protected admin route)
  app.put("/api/donations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donation ID" });
      }

      const updateData = insertDonationSchema.parse(req.body);
      const updatedDonation = await storage.updateDonation(id, updateData);
      
      if (!updatedDonation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json(updatedDonation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update donation" });
    }
  });

  // Delete donation (protected admin route)
  app.delete("/api/donations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid donation ID" });
      }

      const deleted = await storage.deleteDonation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Donation not found" });
      }
      
      res.json({ message: "Donation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete donation" });
    }
  });

  // Google Form webhook endpoint (public for form submissions)
  app.post("/api/google-form-webhook", async (req, res) => {
    try {
      console.log("📝 Received Google Form submission:", req.body);
      
      const formData = req.body;
      
      // Validate required fields from Google Form
      if (!formData.receiptNo || !formData.name || !formData.phone || !formData.amount) {
        console.error("❌ Missing required fields in form submission");
        return res.status(400).json({ 
          message: "Missing required fields", 
          required: ["receiptNo", "name", "phone", "amount"] 
        });
      }

      // Transform Google Form data to donation format
      const donationData: any = {
        receiptNo: formData.receiptNo,
        name: formData.name,
        phone: formData.phone,
        community: formData.community || 'any',
        location: formData.location || '',
        amount: parseInt(formData.amount),
        paymentMode: formData.paymentMode || 'cash',
        inscription: formData.inscription || false
      };

      // Only add donationDate if provided
      if (formData.donationDate) {
        donationData.donationDate = formData.donationDate;
      }

      // Validate the transformed data
      const validatedData = insertDonationSchema.parse(donationData);
      
      // Create donation in database
      const donation = await storage.createDonation(validatedData);
      
      console.log(`✅ Google Form donation created successfully - Receipt: ${donation.receiptNo}`);
      
      res.json({ 
        success: true, 
        message: "Donation submitted successfully",
        receiptNo: donation.receiptNo,
        donationId: donation.id
      });
      
    } catch (error) {
      console.error("❌ Google Form webhook error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid form data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: "Failed to process donation from Google Form" 
      });
    }
  });

  // Search donors
  app.get("/api/donors/search", async (req, res) => {
    try {
      const { q, community } = req.query;
      
      // Validate phone number if query is provided and looks like a phone number
      if (q && /^\d+$/.test(q as string)) {
        // If it's all digits, treat as phone search and validate length
        if ((q as string).length !== 10) {
          return res.status(400).json({ 
            message: "Phone number must be exactly 10 digits" 
          });
        }
      }
      
      const donors = await storage.searchDonors(q as string, community as string);
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: "Failed to search donors" });
    }
  });

  // Get donor by phone number
  app.get("/api/donors/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;
      const donor = await storage.getDonorByPhone(phone);
      
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      
      res.json(donor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donor" });
    }
  });

  // Get dashboard statistics (protected admin route)
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });





  // Google Form webhook endpoint
  app.post("/api/google-form-webhook", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      res.json({ 
        success: true, 
        donation,
        message: `Donation recorded successfully. Receipt: ${donation.receiptNo}` 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false,
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false,
          message: "Failed to process donation from Google Form" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
