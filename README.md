> [!IMPORTANT]
> **Notiq** is currently in early development. Some features are still experimental — feedback and contributions are highly appreciated!

# 🪶 Notiq — Notes That Think With You

**Your intelligent second brain for ideas, memories, and knowledge.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge\&logo=supabase\&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge\&logo=openai\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge\&logo=vercel\&logoColor=white)

[![License](https://img.shields.io/github/license/vanthasy/notiq)](https://github.com/vanthasy/notiq/blob/main/LICENSE)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge\&logo=vercel)](https://vercel.com/new)

---

## 📖 Overview

**Notiq** is an AI-powered note-taking and memory companion designed to help you capture, organize, and rediscover ideas effortlessly.
It combines elegant design, semantic search, and smart AI assistance — turning your notes into structured, meaningful knowledge.

---

## ✨ Key Features

* 🧠 **AI Intelligence** – Summarize, rewrite, and auto-tag your notes using GPT-4o-mini.
* 📝 **Markdown Editor** – Clean, distraction-free writing experience with live preview.
* 🔍 **Semantic Search** – Find ideas by meaning, not just by words (Supabase Vector).
* 🤝 **Realtime Collaboration** – Share notes instantly with Supabase Realtime.
* 🎨 **Beautiful UI** – Built with shadcn/ui, TailwindCSS, and Framer Motion for smooth UX.
* 🔒 **Secure by Default** – Your data stays private and encrypted.

---

## 🛠 Tech Stack

| Layer        | Tech                                                          |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | Next.js 15, TypeScript, TailwindCSS, shadcn/ui, Framer Motion |
| **Backend**  | Supabase (Auth, Realtime, Vector, Storage)                    |
| **AI Layer** | OpenAI GPT-4o-mini                                            |
| **Hosting**  | Vercel                                                        |

---

## 💾 Installation

### Prerequisites

* Node.js v18+
* npm v9+ or pnpm
* Supabase project
* OpenAI API key

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/vanthasy/notiq.git
   cd notiq
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an `.env.local` file:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=your-openai-key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Visit:

   ```
   http://localhost:3000
   ```

---

## 🔧 Detailed Setup

<details>
<summary><b>Step-by-Step Supabase Configuration</b></summary>

### Database Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (wait 2-3 minutes for setup)
3. Navigate to **SQL Editor** → **New Query**
4. Copy and paste the entire `schema.sql` file
5. Click **Run** or press `Ctrl/Cmd + Enter`

### Authentication Configuration

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Enable **Google OAuth**:
   - Create a Google OAuth app in Google Cloud Console
   - Add Client ID and Secret to Supabase
4. Go to **Authentication** → **URL Configuration**
5. Add redirect URLs:
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/onboarding/confirm-email`
   - Your production URL

### Enable Realtime (Recommended)

1. Navigate to **Database** → **Replication**
2. Enable replication for the `notes` table
3. This enables instant sync across devices

</details>

<details>
<summary><b>Getting Your API Keys</b></summary>

### Supabase Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ...`)

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key immediately (you won't see it again!)
4. Note: You'll need billing enabled and credits in your account

</details>

---

## 🐛 Troubleshooting

<details>
<summary><b>Common Issues & Solutions</b></summary>

### "Failed to fetch" or CORS errors

- **Fix:** Verify `.env.local` has correct Supabase URL and keys
- Restart dev server: `npm run dev`
- Check Supabase project is active in dashboard

### Database errors / RLS policy errors

- **Fix:** Ensure you ran the **entire** `schema.sql` file
- Verify RLS policies exist in Supabase **Authentication** → **Policies**
- Check that your user was created in the `users` table

### Email confirmation errors

- **Fix:** For development, disable email confirmation:
  - Supabase → **Authentication** → **Providers** → **Email**
  - Uncheck "Confirm email" → Save
- For production: Configure SMTP in Supabase settings

### OpenAI API errors

- **Fix:** Verify API key is valid at [OpenAI Platform](https://platform.openai.com/api-keys)
- Ensure you have billing enabled and available credits
- Check the key starts with `sk-`

### Notes not saving

- **Fix:** Check browser console for errors
- Verify Supabase connection in Network tab
- Ensure RLS policies allow INSERT/UPDATE for authenticated users

</details>

---

## ⚙️ Deployment

Deploy directly on **Vercel** — it’s the easiest way to go live:

* Connect your GitHub repository
* Add environment variables from your Supabase project
* Vercel auto-builds and deploys on every commit to `main`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🤝 Contributing

Contributions are welcome! Follow these steps to get started:

1. Fork this repository
2. Create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit and push your changes
4. Open a Pull Request

### Guidelines

* Follow TypeScript and React best practices
* Keep commits atomic and meaningful
* Write clean, readable code
* Update documentation where needed

---

## 📁 Project Structure

```
notiq/
├── src/
│   ├── app/
│   │   ├── api/               # AI-powered API routes
│   │   │   ├── summarize/     # GPT-4o summarization
│   │   │   ├── rewrite/       # Content improvement
│   │   │   └── tag/           # Auto-tagging
│   │   ├── auth/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── onboarding/        # Email confirmation flow
│   │   ├── dashboard/         # Main app interface
│   │   ├── layout.tsx         # Root layout + theme
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ai-tools/          # AI toolbar
│   │   ├── command-palette/   # ⌘K interface
│   │   ├── editor/            # Markdown editor
│   │   ├── sidebar/           # Navigation
│   │   ├── ui/                # shadcn/ui components
│   │   └── theme-provider.tsx
│   └── lib/
│       ├── supabase.ts        # Database client
│       ├── ai.ts              # OpenAI integration
│       ├── types.ts           # TypeScript types
│       └── utils.ts
├── schema.sql                 # Database schema
├── env.template               # Environment template
└── package.json
```

---

## 🧩 Coming Soon

* [ ] AI note clustering and smart tagging
* [ ] Offline-first mode
* [ ] Collaborative note spaces
* [ ] Notiq mobile (PWA)
* [ ] AI memory recall system

---

## 📄 License

Distributed under the **MIT License**.
See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <strong>from Raditya / Notiq</strong><br/>
  <sub>Notiq — Notes that think with you.</sub><br/><br/>
</div>
