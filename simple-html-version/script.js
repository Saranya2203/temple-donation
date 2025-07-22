// Temple Donation Management - Simple JavaScript

let currentLanguage = 'en';
let isLoggedIn = false;
let donations = JSON.parse(localStorage.getItem('donations') || '[]');
let receiptCounter = parseInt(localStorage.getItem('receiptCounter') || '1');

// Language translations
const translations = {
    en: {
        'New Donation': 'New Donation',
        'Donor Search': 'Donor Search',
        'Admin Panel': 'Admin Panel',
        'New Donation Entry': 'New Donation Entry',
        'Receipt Number': 'Receipt Number',
        'Name': 'Name',
        'Phone': 'Phone',
        'Community': 'Community',
        'Location': 'Location',
        'Address': 'Address',
        'Amount (₹)': 'Amount (₹)',
        'Payment Mode': 'Payment Mode',
        'Inscription Required': 'Inscription Required',
        'Save Donation': 'Save Donation',
        'Donor Search': 'Donor Search',
        'Enter name or phone number': 'Enter name or phone number',
        'Search': 'Search',
        'Admin Panel': 'Admin Panel',
        'Username': 'Username',
        'Password': 'Password',
        'Login': 'Login',
        'Total Collection': 'Total Collection',
        'Total Donors': 'Total Donors',
        'This Month': 'This Month',
        'Export CSV': 'Export CSV',
        'Import Data': 'Import Data',
        'Import Donation Data': 'Import Donation Data',
        'Import': 'Import',
        'Success': 'Success',
        'Error': 'Error'
    },
    ta: {
        'New Donation': 'புதிய நன்கொடை',
        'Donor Search': 'நன்கொடையாளர் தேடல்',
        'Admin Panel': 'நிர்வாக பாட்டு',
        'New Donation Entry': 'புதிய நன்கொடை பதிவு',
        'Receipt Number': 'ரசீது எண்',
        'Name': 'பெயர்',
        'Phone': 'தொலைபேசி',
        'Community': 'குலம்',
        'Location': 'இடம்',
        'Address': 'முகவரி',
        'Amount (₹)': 'தொகை (₹)',
        'Payment Mode': 'பணம் செலுத்தும் முறை',
        'Inscription Required': 'பொறிப்பு தேவை',
        'Save Donation': 'நன்கொடை சேமிக்க',
        'Donor Search': 'நன்கொடையாளர் தேடல்',
        'Enter name or phone number': 'பெயர் அல்லது தொலைபேசி எண்ணை உள்ளிடவும்',
        'Search': 'தேடல்',
        'Admin Panel': 'நிர்வாக பாட்டு',
        'Username': 'பயனர் பெயர்',
        'Password': 'கடவுச்சொல்',
        'Login': 'உள்நுழை',
        'Total Collection': 'மொத்த சேகரிப்பு',
        'Total Donors': 'மொத்த நன்கொடையாளர்கள்',
        'This Month': 'இந்த மாதம்',
        'Export CSV': 'CSV ஏற்றுமதி',
        'Import Data': 'தரவு இறக்குமதி',
        'Import Donation Data': 'நன்கொடை தரவு இறக்குமதி',
        'Import': 'இறக்குமதி',
        'Success': 'வெற்றி',
        'Error': 'பிழை'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    updateLanguage();
    generateReceiptNumber();
    updateDashboard();
});

// Language functions
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ta' : 'en';
    updateLanguage();
}

function updateLanguage() {
    const langBtn = document.getElementById('langBtn');
    langBtn.textContent = currentLanguage === 'en' ? 'தமிழ்' : 'English';
    
    // Update all elements with data attributes
    document.querySelectorAll('[data-en]').forEach(element => {
        const key = element.getAttribute(`data-${currentLanguage}`);
        if (key) element.textContent = key;
    });
    
    // Update placeholders
    document.querySelectorAll('[data-en-placeholder]').forEach(element => {
        const key = element.getAttribute(`data-${currentLanguage}-placeholder`);
        if (key) element.placeholder = key;
    });
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

// Receipt number generation
function generateReceiptNumber() {
    const year = new Date().getFullYear();
    const receiptNo = `${year}-${receiptCounter.toString().padStart(4, '0')}`;
    document.getElementById('receiptNo').value = receiptNo;
}

// Donation form handling
document.getElementById('donationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const donation = {
        id: Date.now(),
        receiptNo: document.getElementById('receiptNo').value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        community: document.getElementById('community').value,
        location: document.getElementById('location').value,
        address: document.getElementById('address').value || '',
        amount: parseFloat(document.getElementById('amount').value),
        paymentMode: document.getElementById('paymentMode').value,
        inscription: document.getElementById('inscription').checked,
        createdAt: new Date().toISOString()
    };
    
    // Validate phone number
    if (!/^\d{10}$/.test(donation.phone)) {
        showMessage('Phone number must be exactly 10 digits', 'error');
        return;
    }
    
    // Save donation
    donations.push(donation);
    localStorage.setItem('donations', JSON.stringify(donations));
    
    // Update receipt counter
    receiptCounter++;
    localStorage.setItem('receiptCounter', receiptCounter.toString());
    
    // Reset form and generate new receipt number
    e.target.reset();
    generateReceiptNumber();
    
    // Update dashboard
    updateDashboard();
    
    showMessage('Donation saved successfully!', 'success');
});

// Search functions
function searchDonors() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) {
        showMessage('Please enter a search term', 'error');
        return;
    }
    
    const results = donations.filter(donation => 
        donation.name.toLowerCase().includes(query) || 
        donation.phone.includes(query)
    );
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (results.length === 0) {
        container.innerHTML = '<p>No donors found matching your search.</p>';
        return;
    }
    
    // Group by phone number
    const donors = {};
    results.forEach(donation => {
        if (!donors[donation.phone]) {
            donors[donation.phone] = {
                ...donation,
                donations: [],
                totalAmount: 0
            };
        }
        donors[donation.phone].donations.push(donation);
        donors[donation.phone].totalAmount += donation.amount;
    });
    
    container.innerHTML = Object.values(donors).map(donor => `
        <div class="donor-card">
            <h3>${donor.name}</h3>
            <div class="donor-info">
                <span><strong>Phone:</strong> ${donor.phone}</span>
                <span><strong>Community:</strong> ${donor.community}</span>
                <span><strong>Location:</strong> ${donor.location}</span>
                <span><strong>Total Amount:</strong> ₹${donor.totalAmount.toLocaleString()}</span>
                <span><strong>Donations:</strong> ${donor.donations.length}</span>
            </div>
            <details>
                <summary>View Donation History</summary>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Receipt</th>
                                <th>Amount</th>
                                <th>Payment Mode</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${donor.donations.map(d => `
                                <tr>
                                    <td>${d.receiptNo}</td>
                                    <td>₹${d.amount.toLocaleString()}</td>
                                    <td>${d.paymentMode}</td>
                                    <td>${new Date(d.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </details>
        </div>
    `).join('');
}

// Admin functions
function adminLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple authentication (in real app, this would be server-side)
    if (username === 'admin' && password === 'temple123') {
        isLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        updateDashboard();
        loadDonationsTable();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid credentials', 'error');
    }
}

function updateDashboard() {
    if (!isLoggedIn) return;
    
    const totalCollection = donations.reduce((sum, d) => sum + d.amount, 0);
    const uniquePhones = new Set(donations.map(d => d.phone));
    const totalDonors = uniquePhones.size;
    
    const thisMonth = new Date();
    const firstOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
    const thisMonthDonations = donations.filter(d => new Date(d.createdAt) >= firstOfMonth);
    const thisMonthAmount = thisMonthDonations.reduce((sum, d) => sum + d.amount, 0);
    
    document.getElementById('totalCollection').textContent = `₹${totalCollection.toLocaleString()}`;
    document.getElementById('totalDonors').textContent = totalDonors;
    document.getElementById('thisMonth').textContent = `₹${thisMonthAmount.toLocaleString()}`;
}

function loadDonationsTable() {
    const container = document.getElementById('donationsTable');
    
    if (donations.length === 0) {
        container.innerHTML = '<p>No donations recorded yet.</p>';
        return;
    }
    
    const sortedDonations = [...donations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>S.No</th>
                        <th>Receipt</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Community</th>
                        <th>Location</th>
                        <th>Amount</th>
                        <th>Payment Mode</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedDonations.map((donation, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${donation.receiptNo}</td>
                            <td>${donation.name}</td>
                            <td>${donation.phone}</td>
                            <td>${donation.community}</td>
                            <td>${donation.location}</td>
                            <td>₹${donation.amount.toLocaleString()}</td>
                            <td>${donation.paymentMode}</td>
                            <td>${new Date(donation.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button onclick="deleteDonation(${donation.id})" style="background:#dc3545;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function deleteDonation(id) {
    if (confirm('Are you sure you want to delete this donation?')) {
        donations = donations.filter(d => d.id !== id);
        localStorage.setItem('donations', JSON.stringify(donations));
        loadDonationsTable();
        updateDashboard();
        showMessage('Donation deleted successfully!', 'success');
    }
}

// Export/Import functions
function exportData() {
    if (donations.length === 0) {
        showMessage('No data to export', 'error');
        return;
    }
    
    const headers = ['S.No', 'Receipt No', 'Name', 'Phone', 'Community', 'Location', 'Address', 'Amount', 'Payment Mode', 'Inscription', 'Date'];
    const csvContent = [
        headers.join(','),
        ...donations.map((donation, index) => [
            index + 1,
            donation.receiptNo,
            `"${donation.name}"`,
            donation.phone,
            donation.community,
            `"${donation.location}"`,
            `"${donation.address || ''}"`,
            donation.amount,
            donation.paymentMode,
            donation.inscription ? 'Yes' : 'No',
            new Date(donation.createdAt).toLocaleDateString()
        ].join(','))
    ].join('\n');
    
    downloadCSV(csvContent, 'temple-donations.csv');
    showMessage('Data exported successfully!', 'success');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function showImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
}

function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessage('Please select a file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
                showMessage('File must contain headers and at least one data row', 'error');
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
            let importCount = 0;
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                
                const donation = {
                    id: Date.now() + i,
                    receiptNo: values[headers.indexOf('receipt no')] || `IMPORT-${Date.now()}-${i}`,
                    name: values[headers.indexOf('name')] || '',
                    phone: values[headers.indexOf('phone')] || '',
                    community: values[headers.indexOf('community')] || 'any',
                    location: values[headers.indexOf('location')] || '',
                    address: values[headers.indexOf('address')] || '',
                    amount: parseFloat(values[headers.indexOf('amount')]) || 0,
                    paymentMode: values[headers.indexOf('payment mode')] || 'cash',
                    inscription: values[headers.indexOf('inscription')] === 'Yes',
                    createdAt: new Date().toISOString()
                };
                
                if (donation.name && donation.phone && donation.amount > 0) {
                    donations.push(donation);
                    importCount++;
                }
            }
            
            localStorage.setItem('donations', JSON.stringify(donations));
            loadDonationsTable();
            updateDashboard();
            closeImportModal();
            showMessage(`Successfully imported ${importCount} donations!`, 'success');
            
        } catch (error) {
            showMessage('Error reading file: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// Password visibility toggle
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const eyeIcon = field.nextElementSibling.querySelector('.eye-icon');
    
    if (field.type === 'password') {
        field.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        field.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    document.querySelectorAll('.message').forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert after the first card
    const firstCard = document.querySelector('.card');
    if (firstCard) {
        firstCard.parentNode.insertBefore(messageDiv, firstCard.nextSibling);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('importModal');
    if (event.target === modal) {
        closeImportModal();
    }
}

// Auto-generate receipt number when page loads
window.addEventListener('load', function() {
    generateReceiptNumber();
});