import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from 'xlsx';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { storage } from "./storage-mongodb";
import { validateAdminCredentials } from "./admin-credentials";

const requireAuth = (req: any, res: any, next: any) => {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
    role?: string;
  }

  const session = req.session as SessionData;
  
  if (!session.isAuthenticated) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

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

export async function registerMongoDBRoutes(app: Express): Promise<Server> {
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
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    const session = req.session as any;
    res.json({
      isAuthenticated: !!session.isAuthenticated,
      username: session.username || null,
      role: session.role || null
    });
  });

  // Export donations as CSV (must be before /:id route)
  app.get("/api/donations/export", requireAuth, async (req, res) => {
    try {
      const donations = await storage.getAllDonations();
      
      // Create CSV content
      const headers = ['S.No', 'Receipt No', 'Name', 'Community', 'Location', 'Address', 'Phone', 'Amount', 'Payment Mode', 'Inscription', 'Date'];
      const csvContent = [
        headers.join(','),
        ...donations.map((donation, index) => [
          index + 1,
          donation.receiptNo,
          `"${donation.name}"`,
          `"${donation.community || ''}"`,
          `"${donation.location || ''}"`,
          `"${(donation as any).address || ''}"`,
          donation.phone,
          donation.amount,
          donation.paymentMode,
          donation.inscription ? 'Yes' : 'No',
          new Date(donation.createdAt).toLocaleDateString('en-GB')
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

      const fileName = req.file.originalname.toLowerCase();
      let records: any[] = [];

      // Parse CSV files
      if (fileName.endsWith('.csv')) {
        const csvString = req.file.buffer.toString('utf-8');
        const lines = csvString.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          return res.status(400).json({
            success: false,
            message: "CSV file must contain headers and at least one data row"
          });
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        console.log('CSV Headers found:', headers);

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.every(v => !v)) continue;

          const record: any = {};
          headers.forEach((header, index) => {
            const cleanHeader = header.replace(/["\s\.]/g, '').toLowerCase();
            record[cleanHeader] = values[index] || '';
          });
          
          records.push(record);
        }
      }
      // Parse Excel files
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          return res.status(400).json({
            success: false,
            message: "Excel file must contain headers and at least one data row"
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

      // Process and validate each record
      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      for (const [index, record] of records.entries()) {
        try {
          // Map flexible field names
          const donation: any = {
            receiptNo: record.receiptno || record.receipt || record.receiptNumber || '',
            name: record.name || record.donorname || '',
            phone: record.phone || record.phonenumber || record.mobile || '',
            community: record.community || record.kulam || record.caste || 'any',
            location: record.location || record.place || record.city || '',
            address: record.address || record.fulladdress || '',
            amount: 0,
            paymentMode: 'cash',
            inscription: false,
            donationDate: null
          };

          // Validate and convert amount
          const amountStr = String(record.amount || record.donationamount || '0').replace(/[₹,]/g, '');
          donation.amount = parseFloat(amountStr) || 0;

          if (!donation.receiptNo || !donation.name || !donation.phone || donation.amount <= 0) {
            errors.push(`Row ${index + 1}: Missing required fields (Receipt No, Name, Phone, Amount)`);
            failureCount++;
            continue;
          }

          // Validate phone number
          const phoneStr = String(donation.phone).replace(/\D/g, '');
          if (phoneStr.length !== 10) {
            errors.push(`Row ${index + 1}: Phone number must be exactly 10 digits, found: ${donation.phone}`);
            failureCount++;
            continue;
          }
          donation.phone = phoneStr;

          // Normalize community
          const communityMap: { [key: string]: string } = {
            'any': 'any', 'payiran': 'payiran', 'chozhan': 'chozhan', 
            'pandiyan': 'pandiyan', 'othaalan': 'othaalan', 'vizhiyan': 'vizhiyan',
            'aadai': 'aadai', 'aavan': 'aavan', 'odhaalan': 'odhaalan', 'semban': 'semban'
          };
          
          const normalizedCommunity = communityMap[donation.community.toLowerCase()] || 'any';
          donation.community = normalizedCommunity;

          // Normalize payment mode
          const paymentModeMap: { [key: string]: string } = {
            'cash': 'cash', 'card': 'card', 'upi': 'upi', 
            'banktransfer': 'bankTransfer', 'bank': 'bankTransfer',
            'cheque': 'cheque', 'check': 'cheque'
          };
          
          const paymentModeStr = String(record.paymentmode || record.payment || 'cash').toLowerCase().replace(/\s/g, '');
          donation.paymentMode = paymentModeMap[paymentModeStr] || 'cash';

          // Handle inscription
          const inscriptionStr = String(record.inscription || record.engraving || 'no').toLowerCase();
          donation.inscription = inscriptionStr === 'yes' || inscriptionStr === 'true' || inscriptionStr === '1';

          // Parse date if provided
          if (record.date || record.donationdate) {
            const dateStr = String(record.date || record.donationdate);
            
            // Handle Excel serial date numbers
            if (/^\d+(\.\d+)?$/.test(dateStr)) {
              const excelDate = parseFloat(dateStr);
              if (excelDate > 25569) { // Valid Excel date (after 1900)
                const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
                donation.donationDate = jsDate;
              }
            } else {
              // Handle DD/MM/YYYY and DD-MM-YYYY formats
              const dateRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
              const match = dateStr.match(dateRegex);
              if (match) {
                const [, day, month, year] = match;
                const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                if (!isNaN(parsedDate.getTime())) {
                  donation.donationDate = parsedDate;
                }
              }
            }
          }

          // Create donation in MongoDB
          await storage.createDonation(donation);
          successCount++;

        } catch (error: any) {
          console.error(`Error processing row ${index + 1}:`, error);
          errors.push(`Row ${index + 1}: ${error.message}`);
          failureCount++;
        }
      }

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

  // Get all donations with optional filters
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
      const donation = await storage.getDonationById(req.params.id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      res.json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donation" });
    }
  });

  // Create new donation
  app.post("/api/donations", async (req, res) => {
    try {
      const donation = await storage.createDonation(req.body);
      res.status(201).json(donation);
    } catch (error: any) {
      console.error('Create donation error:', error);
      res.status(400).json({ message: error.message || "Failed to create donation" });
    }
  });

  // Update donation
  app.put("/api/donations/:id", requireAuth, async (req, res) => {
    try {
      const donation = await storage.updateDonation(req.params.id, req.body);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      res.json(donation);
    } catch (error) {
      res.status(400).json({ message: "Failed to update donation" });
    }
  });

  // Delete donation
  app.delete("/api/donations/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDonation(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Donation not found" });
      }
      res.json({ message: "Donation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete donation" });
    }
  });

  // Donor search routes
  app.get("/api/donors/search", async (req, res) => {
    try {
      const { query, community } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const donors = await storage.searchDonors(query, community as string);
      res.json(donors);
    } catch (error) {
      res.status(500).json({ message: "Failed to search donors" });
    }
  });

  app.get("/api/donors/:phone", async (req, res) => {
    try {
      const donor = await storage.getDonorByPhone(req.params.phone);
      if (!donor) {
        return res.status(404).json({ message: "Donor not found" });
      }
      res.json(donor);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donor" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}