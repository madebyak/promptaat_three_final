# Promptaat - Your AI Prompt Library

A Next.js application that serves as a comprehensive library for AI prompts, allowing users to discover, save, and organize prompts for various AI tools.

## Features

- 🌐 Multilingual support (English and Arabic)
- 🔐 User authentication and profile management
- 📚 Browse and search AI prompts by categories
- 💾 Save favorite prompts to personal collections
- 🔄 Track prompt usage history
- ✨ Modern UI with dark/light mode support

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: Custom JWT with Next-Auth integration
- **UI Components**: [Radix UI](https://www.radix-ui.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Internationalization**: [next-i18next](https://github.com/i18next/next-i18next)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/promptaat.git
   cd promptaat
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual configuration values.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Seed the database (optional):
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is configured for easy deployment on [Vercel](https://vercel.com).

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy!

## License

[MIT License](LICENSE)

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
