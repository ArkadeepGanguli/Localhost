# Overview

This is an internship matching platform called "InternshipInsight" designed for the PM Internship Scheme. The application helps match candidates with suitable internships based on their education, skills, sector preferences, and location preferences. It features a multi-step form interface with multilingual support (English/Hindi) and uses AI-powered matching to provide personalized internship recommendations with explanations.

The platform is built as a full-stack application with a React frontend and Express backend, utilizing CSV data parsing for internship listings and candidate skills/locations, and integrating with Google's Gemini AI for intelligent matching and explanations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: Multi-step form with validation and searchable dropdowns for skills and locations

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Data Storage**: In-memory storage implementation (MemStorage class) for development, with interfaces designed for easy database integration
- **API Design**: RESTful endpoints for fetching skills/locations and submitting candidate matches
- **CSV Processing**: Custom CSVParser service for parsing internship data, skills, and locations from CSV files
- **Matching Logic**: Hybrid approach combining rule-based filtering with AI-powered matching explanations

## Data Storage Solutions
- **Development Storage**: In-memory storage using Maps for users, candidates, internships, and match results
- **Database Ready**: Drizzle ORM configured for PostgreSQL with schema definitions for production deployment
- **Data Sources**: CSV files for internship listings, unique skills, and unique locations stored in attached_assets directory

## AI Integration
- **AI Provider**: Google Gemini AI for generating match percentages and explanations
- **Matching Strategy**: Combines traditional rule-based filtering (skills, location, education, sector) with AI analysis for personalized explanations
- **Fallback Logic**: Basic matching algorithm when AI service is unavailable to ensure system reliability

## Internationalization
- **Multi-language Support**: English and Hindi language toggle throughout the application
- **Localized Content**: Translations for form labels, buttons, and user interface elements
- **Cultural Considerations**: Mobile-first design suitable for diverse user base across India

# External Dependencies

## Core Technologies
- **Database**: PostgreSQL with Neon Database serverless driver for production
- **AI Service**: Google Gemini AI API for intelligent matching and explanations
- **Build Tools**: Vite for frontend bundling, esbuild for backend compilation
- **Development Tools**: tsx for TypeScript execution, Replit-specific plugins for development environment

## Third-Party Services
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **Data Validation**: Zod for runtime type validation and schema definition
- **ORM**: Drizzle for type-safe database operations and migrations

## CSV Data Sources
- **Internship Data**: internships_filtered.csv containing comprehensive internship listings
- **Skills Data**: unique_skills.csv for candidate skill selection options
- **Location Data**: unique_locations.csv for location preference options