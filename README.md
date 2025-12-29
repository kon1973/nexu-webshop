# Nexu Webshop

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fnexu-webshop)

A modern, full-stack e-commerce platform built with **Next.js 15**, **React 19**, and **Prisma**. Designed for the Hungarian market with integrated invoicing (Szamlazz.hu) and payments (Stripe).

## 🚀 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Authentication:** [NextAuth.js v5](https://authjs.dev/) (Google & Credentials)
- **Payments:** [Stripe](https://stripe.com/)
- **Invoicing:** [Szamlazz.js](https://github.com/szamlazz/szamlazz.js) (Szamlazz.hu integration)
- **Emails:** [Resend](https://resend.com/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Rate Limiting:** [Upstash](https://upstash.com/)

## ✨ Key Features

- **Full-featured Admin Dashboard**: Manage products, orders, users, and analytics.
- **Product Management**: Variants (size, color), specifications, and image galleries.
- **Secure Checkout**: Integrated Stripe payments with webhook verification.
- **Automated Invoicing**: Generates and emails invoices via Szamlazz.hu upon successful payment.
- **User Accounts**: Order history, profile management, and wishlist.
- **Marketing Tools**: Coupons, newsletter subscription, and product reviews.
- **Performance**: Optimized with Next.js Image, dynamic metadata, and server-side rendering.

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- Resend account
- Szamlazz.hu account (optional, for invoicing)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/nexu-webshop.git
    cd nexu-webshop
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:

    ```env
    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/nexu_db"

    # Auth (NextAuth.js)
    AUTH_SECRET="your-super-secret-key"
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"

    # Email (Resend)
    RESEND_API_KEY="re_..."
    EMAIL_FROM="NEXU Store <onboarding@resend.dev>"
    ADMIN_EMAIL="admin@example.com"

    # Payments (Stripe)
    STRIPE_SECRET_KEY="sk_test_..."
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
    STRIPE_WEBHOOK_SECRET="whsec_..."

    # Invoicing (Szamlazz.hu)
    SZAMLAZZ_TOKEN="your-agent-token"

    # App
    NEXT_PUBLIC_SITE_URL="http://localhost:3000"
    ```

4.  **Initialize Database:**
    ```bash
    npx prisma migrate dev
    npm run seed # Seeds initial categories, products, and admin user
    ```

5.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🧪 Testing

- **Unit Tests:** `npm run test:unit`
- **E2E Tests:** `npm run test:e2e`

## 📂 Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable UI components.
- `context/`: React Context providers (Cart, Favorites, etc.).
- `lib/`: Utility functions, services, and configurations.
- `prisma/`: Database schema and seed scripts.
- `public/`: Static assets.
- `types/`: TypeScript type definitions.

## 📜 License

This project is licensed under the MIT License.
