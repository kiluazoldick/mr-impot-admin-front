# Mr Impot - Admin Frontend

Interface d'administration de la plateforme Mr Impot.

## 🚀 Déploiement

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 🔧 Installation

```bash
git clone https://github.com/kiluazoldick/mr-impot-admin-front.git
cd mr-impot-admin-front
npm install
cp .env.example .env.local
npm run dev
📦 Stack
Next.js 16 (App Router)

Supabase (Auth + Storage)

Tailwind CSS + shadcn/ui

next-intl (i18n FR/EN)

Recharts (graphiques)

react-hook-form + zod

🌍 Variables d'environnement
Variable	Description
NEXT_PUBLIC_API_URL	URL du backend API
NEXT_PUBLIC_SUPABASE_URL	URL Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY	Clé publique Supabase
NEXT_PUBLIC_APP_URL	URL de l'application
📁 Structure
text
app/[locale]/
├── (auth)/login/       # Page connexion admin
├── dashboard/          # Dashboard + CRUD
│   ├── documents/      # Gestion documents
│   ├── videos/         # Gestion vidéos
│   └── user-management/# Gestion utilisateurs
🛠️ Scripts
bash
npm run dev      # Dev (port 3001)
npm run build    # Build
npm run start    # Production
```
