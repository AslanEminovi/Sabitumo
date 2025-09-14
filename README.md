# Sabitumo - Premium Knives & Military Equipment Shop

A modern e-commerce website for selling high-quality knives, military equipment, and tactical gear. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🛍️ **E-commerce Platform** - Complete shopping experience with cart and checkout
- 🌍 **Multi-language Support** - English and Georgian languages
- 💳 **Payment Integration** - Stripe payment processing
- 🔐 **User Authentication** - Secure login and registration system
- 📱 **Responsive Design** - Mobile-first approach
- 🎨 **Custom Color Palette** - Professional design with your brand colors
- 🗄️ **Database Integration** - Supabase backend with PostgreSQL

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom color palette
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Icons**: Lucide React
- **Forms**: React Hook Form

## Color Palette

The website uses your custom color palette:

- **Primary Blue**: #102E50 (Dark Navy)
- **Secondary Yellow**: #F5C45E (Golden)
- **Accent Orange**: #E78B48 (Orange)
- **Danger Red**: #BE3D2A (Red)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd sabitumo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-schema.sql`

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # Reusable components
│   ├── Navbar.tsx     # Navigation component
│   └── Footer.tsx     # Footer component
├── hooks/             # Custom React hooks
│   └── useTranslation.ts # Translation hook
├── i18n/              # Internationalization
│   ├── config.ts      # i18n configuration
│   └── translations/  # Language files
│       ├── en.ts      # English translations
│       └── ka.ts      # Georgian translations
├── lib/               # Utility libraries
│   └── supabase.ts    # Supabase client
└── types/             # TypeScript type definitions
    └── database.ts    # Database types
```

## Database Schema

The application includes the following main tables:

- **users** - User accounts and profiles
- **categories** - Product categories
- **products** - Product information
- **orders** - Customer orders
- **order_items** - Individual items in orders

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Email: info@sabitumo.ge
- Phone: +995 XXX XXX XXX

## Roadmap

- [ ] Shopping cart functionality
- [ ] User authentication system
- [ ] Product catalog pages
- [ ] Checkout process
- [ ] Order management
- [ ] Admin dashboard
- [ ] Payment processing
- [ ] Email notifications
- [ ] SEO optimization
- [ ] Performance optimization

---

Built with ❤️ for Sabitumo
# Sabitumo
