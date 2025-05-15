# Mzuni Marketplace - Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation Guide](#installation-guide)
5. [Configuration](#configuration)
6. [Project Structure](#project-structure)
7. [API Documentation](#api-documentation)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Contributing](#contributing)
11. [License](#license)
12. [Support](#support)

## Project Overview
Mzuni Marketplace is a university-focused e-commerce platform designed specifically for Mzuzu University students and staff. The platform enables secure buying and selling of goods within the university community, featuring real-time messaging, product listings, and user authentication.

## Features
### Core Features
- **User Authentication**: Secure signup/login with email/password
- **Product Listings**: Create, browse, and manage product listings
- **Real-time Chat**: Instant messaging between buyers and sellers
- **Search & Filtering**: Find products by category, price, and keywords

### Advanced Features
- **Image Uploads**: Support for multiple product images
- **Price Negotiation**: Built-in tools for price discussions
- **Location-based Meetups**: Coordinate safe exchange locations
- **Favorites System**: Save preferred listings

## Technology Stack
### Frontend
- **Framework**: Next.js (v14)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Context
- **Form Handling**: React Hook Form
- **Icons**: Lucide React

### Backend
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
- **Real-time Updates**: Firebase Listeners

### Development Tools
- **Linting**: ESLint
- **Formatting**: Prettier
- **Version Control**: Git

## Installation Guide
### Prerequisites
- Node.js v18+
- npm v9+ or yarn
- Firebase account

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mzuni-marketplace.git
   cd mzuni-marketplace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Configuration section)

4. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration
### Environment Variables
Create a `.env.local` file with:


### Firebase Setup
1. Enable Email/Password authentication
2. Set up Firestore database in test mode
3. Configure Storage rules

## Project Structure
```
src/
├── app/                   # Next.js app router
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Protected routes
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── auth/              # Auth components
│   ├── chat/              # Chat components
│   ├── listing/           # Listing components
│   └── ui/                # UI primitives
├── config/                # Configuration files
├── context/               # Context providers
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Global styles
└── types/                 # TypeScript types
```

## API Documentation
### Firebase Services
- **Authentication**: `lib/firebase/auth.ts`
- **Firestore**: `lib/firebase/firestore.ts`
- **Storage**: `lib/firebase/storage.ts`

### Custom API Routes
- `/api/listings`: Handle listing operations
- `/api/messages`: Manage chat messages
- `/api/users`: User profile operations

## Deployment
### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy!

### Firebase Hosting
```bash
npm run build
firebase init hosting
firebase deploy
```

## Testing
Run unit tests:
```bash
npm test
```

Test coverage:
```bash
npm run test:coverage
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

Please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License
MIT License - See [LICENSE](LICENSE) for details.

## Support
For issues or questions, please:
- Open a GitHub issue
