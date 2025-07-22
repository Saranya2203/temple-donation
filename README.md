# Temple Donation Management System
## பக்தர் நன்கொடை நிர்வாக அமைப்பு

A comprehensive bilingual (English/Tamil) temple donation management system with phone-based donor tracking, real-time analytics, and Google Forms integration.

## Features / அம்சங்கள்

### Core Features
- **Bilingual Support** - English and Tamil interface
- **Phone-First Donor Management** - Quick lookup by phone number
- **Automatic Receipt Generation** - Sequential numbering by year
- **Real-time Dashboard** - Collection statistics and analytics
- **Google Forms Integration** - Remote donation collection
- **Export Functionality** - CSV downloads for records
- **Mobile Responsive** - Works on all devices

### Tamil Language Support / தமிழ் மொழி ஆதரவு
- Complete Tamil translations for all interface elements
- Tamil currency formatting (₹ symbols with Tamil numerals)
- Tamil date formatting
- Proper Tamil font rendering (Noto Sans Tamil)
- Language toggle for instant switching

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for data fetching
- React Hook Form for form management
- Shadcn/ui components

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL
- Zod for validation

### Database
- PostgreSQL with automated migrations
- Phone number as primary donor identifier
- Receipt number generation with yearly sequences

## Quick Start

### Option 1: Deploy on Replit (Recommended)
1. Click the "Deploy" button in the Replit interface
2. Replit automatically handles:
   - PostgreSQL database setup
   - Environment variable configuration
   - SSL certificates and domain management
   - Automatic scaling and backups

### Option 2: Self-Hosting
1. **Prerequisites:**
   - Node.js 18+
   - PostgreSQL 12+
   - 1GB RAM minimum

2. **Installation:**
   ```bash
   git clone [repository-url]
   cd temple-donation-system
   npm install
   ```

3. **Environment Setup:**
   Create `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/temple_donations
   NODE_ENV=production
   PORT=5000
   ```

4. **Database Setup:**
   ```bash
   npm run db:push
   ```

5. **Start Application:**
   ```bash
   npm run build
   npm start
   ```

## Usage Guide / பயன்பாட்டு வழிகாட்டி

### Adding Donations / நன்கொடை சேர்ப்பு
1. Navigate to "New Donation" / "புதிய நன்கொடை"
2. Enter phone number - system automatically detects existing donors
3. Fill in donation details
4. System generates receipt number automatically

### Donor Lookup / நன்கொடையாளர் தேடல்
1. Go to "Donor Lookup" / "நன்கொடையாளர் தேடல்"
2. Enter phone number (minimum 3 digits)
3. View complete donation history
4. See total contributions and visit count

### Dashboard Analytics / புள்ளிவிவர டாஷ்போர்டு
- Total collection amounts
- Donor statistics
- Payment mode distribution
- Recent donation activity
- Monthly trends

### Google Forms Integration
1. Visit "Google Form Setup" page
2. Copy the provided form template
3. Set up Apps Script integration
4. Configure webhook for automatic data sync

## Language Toggle / மொழி மாற்றம்

Switch between English and Tamil using the language toggle in the top navigation:
- **English**: Full English interface
- **தமிழ்**: Complete Tamil translation with proper fonts

## API Endpoints

### Core Endpoints
- `POST /api/donations` - Create new donation
- `GET /api/donors/:phone` - Get donor by phone
- `GET /api/donors/search` - Search donors
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/google-form-webhook` - Google Forms webhook

### Export
- `GET /api/donations/export` - Download CSV of all donations

## Database Schema

### Donations Table
```sql
donations (
  id SERIAL PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  community TEXT,
  location TEXT,
  amount INTEGER NOT NULL,
  payment_mode TEXT NOT NULL,
  inscription BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

## Security Features

- Input validation with Zod schemas
- SQL injection prevention with Drizzle ORM
- Environment variable protection
- CORS configuration
- Rate limiting ready

## Deployment Considerations

### Production Requirements
- PostgreSQL database with backup strategy
- SSL certificate for HTTPS
- Regular database backups
- Environment variable security
- Log monitoring

### Scaling
- Database connection pooling configured
- Stateless application design
- CDN-ready static assets
- Mobile-first responsive design

## Support

### Browser Compatibility
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Tamil Font Support
- Automatic Noto Sans Tamil font loading
- Fallback to system Tamil fonts
- Proper Unicode Tamil rendering

## Contributing

1. Fork the repository
2. Create feature branch
3. Add bilingual translations for new features
4. Test on both languages
5. Submit pull request

## License

MIT License - see LICENSE file for details

---

## Credits / நன்றி

Built with modern web technologies for Tamil temples worldwide.
Built for efficient donor management with cultural sensitivity.

**Template:** React + TypeScript + Tailwind CSS + PostgreSQL
**Fonts:** Noto Sans Tamil, Inter
**UI Components:** Shadcn/ui
**Database:** Drizzle ORM + PostgreSQL