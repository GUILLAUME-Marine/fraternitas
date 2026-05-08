# Fraternitas — La communauté catholique vivante

Plateforme communautaire premium pour catholiques pratiquants.
Stack: **Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · NextAuth v5 · Prisma · PostgreSQL**

---

## 🏗️ Architecture du projet

```
fraternitas/
├── prisma/
│   └── schema.prisma          # Schéma base de données
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Styles globaux
│   │   ├── auth/
│   │   │   ├── layout.tsx     # Layout pages auth (fond sombre)
│   │   │   ├── login/         # Page connexion
│   │   │   ├── register/      # Page inscription
│   │   │   └── forgot-password/ # Mot de passe oublié
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     # Layout dashboard (sidebar + nav)
│   │   │   └── page.tsx       # Dashboard principal
│   │   └── api/
│   │       ├── auth/[...nextauth]/ # Handler NextAuth
│   │       └── register/      # API inscription
│   ├── components/
│   │   ├── ui/                # Composants UI (Button, Input, Logo…)
│   │   ├── layout/            # Navbar, Footer
│   │   └── sections/          # Hero, Features, Testimonials…
│   └── lib/
│       ├── auth.ts            # Config NextAuth v5
│       ├── prisma.ts          # Client Prisma
│       ├── utils.ts           # Utilitaires
│       └── validations.ts     # Schémas Zod
├── middleware.ts              # Protection des routes
├── .env.example               # Variables d'environnement
└── package.json
```

---

## 🚀 Installation locale

### 1. Cloner & installer les dépendances

```bash
git clone <votre-repo>
cd fraternitas
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Editez `.env.local` :

```env
# Base de données (Supabase, Neon, ou PostgreSQL local)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# NextAuth - générez un secret avec :
# openssl rand -base64 32
AUTH_SECRET="votre-secret-tres-long-ici"
AUTH_URL="http://localhost:3000"

# Google OAuth (optionnel - voir ci-dessous)
AUTH_GOOGLE_ID="xxx.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="xxx"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurer la base de données

**Option A — Neon (recommandé, gratuit)**
1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un projet → copiez la `DATABASE_URL`

**Option B — Supabase**
1. Créez un projet sur [supabase.com](https://supabase.com)
2. Settings → Database → Connection string (mode Transaction)

**Option C — PostgreSQL local**
```bash
# macOS
brew install postgresql
brew services start postgresql
createdb fraternitas
DATABASE_URL="postgresql://localhost:5432/fraternitas"
```

### 4. Pousser le schéma Prisma

```bash
npm run db:generate
npm run db:push
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

---

## 🔐 Configuration Google OAuth (optionnel)

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un projet → APIs & Services → Credentials
3. Créez un **OAuth 2.0 Client ID** (type: Web application)
4. Redirect URIs : `http://localhost:3000/api/auth/callback/google`
5. Copiez le Client ID et Client Secret dans `.env.local`

---

## 🧪 Tester les fonctionnalités

```bash
# 1. Inscription
http://localhost:3000/auth/register
→ Remplissez le formulaire → vous êtes redirigé vers /dashboard

# 2. Connexion
http://localhost:3000/auth/login
→ Entrez vos identifiants

# 3. Protection des routes
# Allez sur /dashboard sans être connecté → redirigé vers /login

# 4. Déconnexion
# Cliquez sur "Déconnexion" dans la navbar du dashboard

# 5. Inspecter la DB
npm run db:studio
# Ouvre Prisma Studio sur http://localhost:5555
```

---

## 🚢 Déploiement sur Vercel

### Méthode rapide (recommandée)

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Déployer
vercel

# 4. Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add AUTH_SECRET
vercel env add AUTH_URL           # https://votre-domaine.vercel.app
vercel env add AUTH_GOOGLE_ID
vercel env add AUTH_GOOGLE_SECRET
vercel env add NEXT_PUBLIC_APP_URL

# 5. Redéployer avec les variables
vercel --prod
```

### Via l'interface Vercel

1. Connectez votre repo GitHub sur [vercel.com](https://vercel.com)
2. Import Project → Next.js détecté automatiquement
3. Settings → Environment Variables → ajoutez toutes les variables
4. Deploy

### Post-déploiement

- Mettez à jour `AUTH_URL` et `NEXT_PUBLIC_APP_URL` avec votre vrai domaine
- Dans Google Console, ajoutez `https://votre-domaine.vercel.app/api/auth/callback/google` aux redirect URIs autorisés

---

## 📋 Commandes disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run db:push      # Synchroniser le schéma Prisma
npm run db:generate  # Générer le client Prisma
npm run db:studio    # Interface visuelle Prisma Studio
```

---

## 🎨 Design System

- **Typographie** : Playfair Display (titres) + DM Sans (corps)
- **Couleurs** : Crème `#F7F3EC` · Encre `#111009` · Or `#B8973A`
- **Logo** : Croix catholique moderne inscrite dans un cercle doré
- **Style** : Minimaliste premium, inspiré Apple / Linear / Stripe
