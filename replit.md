# Temple Donation Management System

## Overview

A comprehensive bilingual (English/Tamil) temple donation management web application designed for efficient tracking of donations with phone-based donor identification, real-time analytics, and Google Forms integration. The application serves temple administrators to manage donations, generate receipts, track donor history, and maintain detailed records through a standard web interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Internationalization**: Custom language context supporting English and Tamil with proper font rendering

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the stack
- **Database ORM**: Drizzle ORM providing type-safe database operations
- **Validation**: Zod schemas for API request/response validation
- **Session Management**: Express session middleware for authentication
- **Security**: Admin credential management with password strength validation

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless configuration
- **Schema Strategy**: Phone number as primary donor identifier for quick lookups
- **Receipt System**: Sequential numbering with yearly reset for organized tracking
- **Migration Support**: Drizzle Kit for automated database migrations

## Key Components

### Donation Management
- **New Donation Entry**: Form-based donation recording with automatic receipt generation
- **Donor Lookup**: Phone-based search with comprehensive donation history
- **Receipt Generation**: Sequential numbering system (format: YYYY-NNNN)
- **Multi-mode Payments**: Support for cash, card, UPI, bank transfer, and cheque

### Dashboard Analytics
- **Real-time Statistics**: Total collections, donor counts, and trends
- **Filter Capabilities**: Date range, community, payment mode, and amount filters
- **Export Functionality**: CSV download for external reporting
- **Performance Metrics**: Dashboard stats with aggregated data

### User Management
- **Admin Authentication**: Secure login system with session-based authentication
- **Role-based Access**: Admin and superadmin roles with different permissions
- **Protected Dashboard**: Password-protected access to collection analytics and admin functions
- **Credential Management**: Predefined secure admin accounts with strong passwords
- **Security Features**: Session timeouts, secure cookies, and protected API endpoints
- **Bilingual Login**: Admin login form supports both English and Tamil languages

### Integration Features
- **Google Forms Integration**: Template and webhook setup for remote donations
- **Bilingual Support**: Complete English/Tamil interface switching
- **Mobile Responsive**: Touch-friendly interface for tablet/mobile use
- **Print-ready Receipts**: Formatted receipt generation for physical printing

## Data Flow

### Donation Processing Flow
1. **Input Validation**: Form data validated using Zod schemas
2. **Donor Lookup**: Phone number checked against existing donor database
3. **Receipt Generation**: Sequential receipt number generated for current year
4. **Database Storage**: Donation record created with donor association
5. **Response**: Success confirmation with receipt details returned

### Authentication Flow
1. **Login Request**: Credentials validated against predefined admin accounts
2. **Session Creation**: Express session established with user role
3. **Route Protection**: Middleware checks authentication for protected endpoints
4. **Session Management**: Automatic logout on timeout or manual logout

### Data Retrieval Flow
1. **Query Processing**: TanStack Query manages caching and background updates
2. **Database Access**: Drizzle ORM executes type-safe queries
3. **Response Formatting**: Data transformed for frontend consumption
4. **Caching Strategy**: Intelligent cache invalidation for real-time updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI components foundation
- **wouter**: Lightweight routing for React applications

### Development Dependencies
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### External Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Google Forms**: Optional integration for remote donation collection
- **Replit**: Development and deployment platform

## Deployment Strategy

### Replit Deployment
- **Environment**: Node.js 20 with PostgreSQL 16 module
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Port Configuration**: Application runs on port 5000, exposed on port 80
- **Database**: Automatic PostgreSQL provisioning through Replit modules

### Production Configuration
- **Session Security**: Secure session configuration with HTTP-only cookies
- **Environment Variables**: Database URL and admin credentials via environment
- **Error Handling**: Comprehensive error logging and user-friendly messages
- **Performance**: Connection pooling and query optimization

### Scaling Considerations
- **Database Connections**: Limited connection pool for serverless compatibility
- **Session Storage**: In-memory sessions suitable for single-instance deployment
- **Static Assets**: Vite-optimized asset bundling and compression
- **Caching**: Client-side caching via TanStack Query reduces server load

## Changelog
- June 26, 2025: Initial setup
- June 26, 2025: Implemented automated receipt numbering system (1-999, A0001-A9999, B0001-B9999, etc.)
- June 26, 2025: Added manual receipt entry capability with toggle option
- June 26, 2025: Fixed donation form validation and date handling
- June 26, 2025: Reset receipt sequence to start from 1 for production use
- June 26, 2025: Removed manual receipt entry functionality per user request
- June 26, 2025: Cleared all test data - system ready for production with receipt numbering starting from 1
- June 26, 2025: Implemented intelligent receipt numbering that continues from last receipt number in database or starts from 1 if no records exist
- June 26, 2025: Added password protection to dashboard and admin panel with session-based authentication system
- June 26, 2025: Created admin login form with bilingual support (English/Tamil)
- June 26, 2025: Implemented secure credential management with predefined admin accounts
- June 26, 2025: Corrected "Othaalan" to "Odhaalan" (ஓதாளன்) throughout the application per user request
- June 26, 2025: Implemented manual receipt entry system - removed automatic receipt generation per user request
- June 27, 2025: Completed Google Form integration with webhook endpoint for external donation collection
- June 27, 2025: Created comprehensive form template with manual receipt entry and Apps Script automation
- June 27, 2025: Successfully tested webhook integration - form submissions automatically sync to temple system
- June 27, 2025: Updated Google Form integration page with user's refined setup steps and visual field guide
- June 27, 2025: Fixed webhook date handling and confirmed full integration functionality with test submissions
- June 28, 2025: Implemented CSV import functionality with comprehensive validation and error handling
- June 28, 2025: Added bilingual import interface with template download and batch data processing
- June 28, 2025: Successfully tested import endpoint with sample CSV data - all records imported correctly
- June 28, 2025: Corrected community name spelling from "Odhaalan" to "Othaalan" throughout the application per user request
- June 30, 2025: Implemented Progressive Web App (PWA) functionality for mobile installation
- June 30, 2025: Added PWA manifest, service worker, app icons, and install prompt for native app-like experience
- June 30, 2025: Removed all PWA and APK functionality per user request - converted to standard web application
- June 30, 2025: Cleaned up PWA files (manifest.json, service worker, app icons, InstallPrompt component)
- June 30, 2025: Removed APK build environment and related documentation files
- June 30, 2025: Optimized as pure web application with standard HTML structure
- June 30, 2025: Fixed React useState import errors and resolved React hooks runtime error with improved LanguageContext implementation
- June 30, 2025: Fixed CSV import functionality with improved data validation, better error handling, and clearer format requirements
- July 2, 2025: Completely fixed CSV import to support user's file format with flexible header mapping and expanded community support
- July 4, 2025: Added address field to donation form, database schema, admin panel display, and CSV import functionality
- July 4, 2025: Fixed missing manual entry modal in admin panel - "Add Manual Entry" button now properly opens donation form
- July 4, 2025: Added Excel (.xlsx, .xls) import support alongside CSV import with dual template download options
- July 4, 2025: Fixed critical date parsing error in imports - Excel serial date numbers now properly converted to valid dates
- July 4, 2025: Enhanced error reporting with detailed validation messages showing exact field issues and row data
- July 4, 2025: Changed date format to DD/MM/YYYY and DD-MM-YYYY per user request - updated templates and validation accordingly
- July 11, 2025: Fixed phone number validation in admin panel manual entry form - now restricts input to exactly 10 digits with real-time validation
- July 11, 2025: Created Android APK project using Apache Cordova - complete mobile app wrapper with bilingual interface and connection monitoring
- July 11, 2025: Enhanced mobile app with temple-themed design, Om symbol, gradient backgrounds, advanced device integration, status monitoring, native dialogs, hardware button support, battery alerts, network quality detection, and comprehensive mobile-optimized user experience
- July 14, 2025: Fixed phone number validation in Donor Lookup - now requires exactly 10 digits for phone search with real-time validation and proper error messages
- July 14, 2025: Enhanced Donor Lookup name search to be case-insensitive - searches work with both uppercase and lowercase letters, plus support for dots, hyphens, and ampersands in names
- July 14, 2025: Added password visibility toggle with intuitive eye icon behavior in admin login form
- July 14, 2025: Enhanced Admin Panel donations table with both vertical and horizontal scrolling for better navigation
- July 14, 2025: Created MongoDB migration stack with HTML+CSS+JS+React+MongoDB+Express+Node.js alternative
- July 14, 2025: Implemented Mongoose models for donations and receipt sequences with MongoDB Atlas compatibility
- July 15, 2025: Added duplicate receipt number validation in New Donation form with real-time checking and bilingual error messages

## User Preferences

Preferred communication style: Simple, everyday language.