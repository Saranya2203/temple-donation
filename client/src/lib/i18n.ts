export type Language = 'en' | 'ta';

export const translations = {
  en: {
    // Navigation
    newDonation: "New Donation",
    donorLookup: "Donor Lookup",
    dashboard: "Dashboard",
    importData: "Import Data",
    googleFormSetup: "Google Form Setup",
    adminPanel: "Admin Panel",
    
    // Common
    name: "Name",
    phone: "Phone Number",
    community: "Kulam",
    location: "Location",
    address: "Address",
    amount: "Amount",
    paymentMode: "Payment Mode",
    inscription: "Inscription",
    yes: "Yes",
    no: "No",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    search: "Search",
    export: "Export",
    loading: "Loading...",
    
    // Donation Form
    donationFormTitle: "New Donation Entry",
    donationFormSubtitle: "Enter donor information and donation details",
    receiptNumber: "Receipt Number",
    phoneRequired: "Phone Number *",
    phoneHelp: "Enter 10-digit phone number",
    nameRequired: "Donor Name *",
    donationAmount: "Donation Amount *",
    inscriptionRequired: "Inscription Required",
    addDonation: "Add Donation",
    adding: "Adding...",
    
    // Communities
    payiran: "Payiran",
    semban: "Semban",
    othaalan: "Othaalan",
    aavan: "Aavan",
    aadai: "Aadai",
    vizhiyan: "Vizhiyan",
    
    // Payment Modes
    cash: "Cash",
    card: "Debit/Credit Card",
    upi: "UPI",
    bankTransfer: "Bank Transfer",
    cheque: "Cheque",
    
    // Donor History
    donorHistory: "Donor History",
    previousDonations: "Previous donations",
    lastDonation: "Last donation",
    totalVisits: "Total visits",
    
    // Dashboard
    collectionDashboard: "Collection Dashboard",
    totalCollection: "Total Collection",
    totalDonors: "Total Donors",
    thisMonth: "This Month",
    averageDonation: "Average Donation",
    paymentModeDistribution: "Payment Mode Distribution",
    recentDonations: "Recent Donations",
    
    // Lookup
    donorLookupTitle: "Donor Lookup",
    searchByPhone: "Search by Phone",
    filterByCommunity: "Filter by Kulam",
    allCommunities: "Any",
    noDonorsFound: "No donors found matching your search criteria",
    enterAtLeast3Digits: "Enter at least 3 digits to search or select a community filter",
    
    // Success/Error Messages
    success: "Success",
    error: "Error",
    donationSuccess: "Donation recorded successfully!",
    donationError: "Failed to create donation",
    validationError: "Please check the form for errors",
    receiptNumberLabel: "Receipt number:",
    
    // Import functionality
    importDataTitle: "Import Data",
    uploadCsvFile: "Upload CSV File",
    csvTemplate: "CSV Template",
    downloadTemplate: "Download Template",
    importingData: "Importing...",
    selectFile: "Select File",
    removeFile: "Remove",
    importSuccess: "Data imported successfully",
    importError: "Failed to import data",
    
    // Temple
    templeTitle: "Temple Donation System",
    templeSubtitle: "Manage donations with phone-based donor tracking",
  },
  ta: {
    // Navigation
    newDonation: "புதிய நன்கொடை",
    donorLookup: "நன்கொடையாளர் தேடல்",
    dashboard: "டாஷ்போர்டு",
    importData: "தரவு இறக்குமதி",
    googleFormSetup: "கூகிள் படிவ அமைப்பு",
    adminPanel: "நிர்வாக பாட்டு",
    
    // Common
    name: "பெயர்",
    phone: "தொலைபேசி எண்",
    community: "குலம்",
    location: "இடம்",
    address: "முகவரி",
    amount: "தொகை",
    paymentMode: "கட்டண முறை",
    inscription: "கல்வெட்டு",
    yes: "ஆம்",
    no: "இல்லை",
    save: "சேமி",
    cancel: "ரத்து செய்",
    reset: "மீட்டமை",
    search: "தேடு",
    export: "ஏற்றுமதி",
    loading: "ஏற்றுகிறது...",
    
    // Donation Form
    donationFormTitle: "புதிய நன்கொடை பதிவு",
    donationFormSubtitle: "நன்கொடையாளர் தகவல் மற்றும் நன்கொடை விவரங்களை உள்ளிடவும்",
    receiptNumber: "ரசீது எண்",
    phoneRequired: "தொலைபேசி எண் *",
    phoneHelp: "10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்",
    nameRequired: "நன்கொடையாளர் பெயர் *",
    donationAmount: "நன்கொடை தொகை *",
    inscriptionRequired: "கல்வெட்டு",
    addDonation: "நன்கொடை சேர்",
    adding: "சேர்க்கிறது...",
    
    // Communities
    payiran: "பயிரன்",
    semban: "செம்பன்",
    othaalan: "ஓதாளன்",
    aavan: "ஆவன்",
    aadai: "ஆடை",
    vizhiyan: "விழியன்",
    
    // Payment Modes
    cash: "ரொக்கம்",
    card: "அட்டை",
    upi: "யூபிஐ",
    bankTransfer: "வங்கி பரிமாற்றம்",
    cheque: "காசோலை",
    
    // Donor History
    donorHistory: "நன்கொடையாளர் வரலாறு",
    previousDonations: "முந்தைய நன்கொடைகள்",
    lastDonation: "கடைசி நன்கொடை",
    totalVisits: "மொத்த வருகைகள்",
    
    // Dashboard
    collectionDashboard: "வசூல் டாஷ்போர்டு",
    totalCollection: "மொத்த வசூல்",
    totalDonors: "மொத்த நன்கொடையாளர்கள்",
    thisMonth: "இந்த மாதம்",
    averageDonation: "சராசரி நன்கொடை",
    paymentModeDistribution: "கொடுப்பன முறை விநியோகம்",
    recentDonations: "சமீபத்திய நன்கொடைகள்",
    
    // Lookup
    donorLookupTitle: "நன்கொடையாளர் தேடல்",
    searchByPhone: "தொலைபேசி மூலம் தேடு",
    filterByCommunity: "குலம் மூலம் வடிகட்டு",
    allCommunities: "ஏதேனும்",
    noDonorsFound: "உங்கள் தேடல் நிபந்தனைகளுக்கு பொருந்தும் நன்கொடையாளர்கள் இல்லை",
    enterAtLeast3Digits: "தேட குறைந்தது 3 இலக்கங்களை உள்ளிடவும் அல்லது குல வடிகட்டியை தேர்ந்தெடுக்கவும்",
    
    // Success/Error Messages
    success: "வெற்றி",
    error: "பிழை",
    donationSuccess: "நன்கொடை வெற்றிகரமாக பதிவு செய்யப்பட்டது!",
    donationError: "நன்கொடை உருவாக்குவதில் தோல்வி",
    validationError: "படிவத்தில் பிழைகளை சரிபார்க்கவும்",
    receiptNumberLabel: "ரசீது எண்:",
    
    // Import functionality
    importDataTitle: "தரவு இறக்குமதி",
    uploadCsvFile: "CSV கோப்பை பதிவேற்று",
    csvTemplate: "CSV டெம்ப்ளேட்",
    downloadTemplate: "டெம்ப்ளேட் பதிவிறக்கு",
    importingData: "இறக்குமதி செய்கிறது...",
    selectFile: "கோப்பைத் தேர்ந்தெடு",
    removeFile: "அகற்று",
    importSuccess: "தரவு வெற்றிகரமாக இறக்குமதி செய்யப்பட்டது",
    importError: "தரவு இறக்குமதி செய்வதில் தோல்வி",
    
    // Temple
    templeTitle: "கோவில் நன்கொடை அமைப்பு",
    templeSubtitle: "தொலைபேசி அடிப்படையில் நன்கொடையாளர் கண்காணிப்புடன் நன்கொடைகளை நிர்வகிக்கவும்",
  }
};

export const getTranslation = (key: keyof typeof translations.en, language: Language): string => {
  return translations[language][key as keyof typeof translations.ta] || translations.en[key];
};

export const formatCurrencyTamil = (amount: number): string => {
  return `₹${amount.toLocaleString('ta-IN')}`;
};

export const formatDateTamil = (date: string | Date): string => {
  return new Intl.DateTimeFormat('ta-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};