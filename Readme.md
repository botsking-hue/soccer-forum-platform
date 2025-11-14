# ⚽ Soccer Forum Platform

A modern forum and tournament platform for FIFA and soccer gaming enthusiasts.

## 🚀 Features

- **Forum Discussions**: Multiple forums for different FIFA versions
- **Tournament System**: Create and join gaming tournaments
- **User Profiles**: Badges, achievements, and activity tracking
- **Admin Panel**: Complete management system
- **Real-time Chat**: Community interactions

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Netlify account

### 1. Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Fill in your Supabase credentials and JWT secret

### 2. Supabase Setup

1. Create a new Supabase project
2. Run the database schema from `database/schema.sql`
3. Get your project URL and service role key
4. Add them to your `.env` file

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or use Netlify CLI
npm run netlify-dev