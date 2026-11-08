# SkillBridge

An Academia–Industry Collaboration Portal for skill mapping, internships and placement. Candidates prove their skills and find opportunities. Organizations hire and collaborate based on those skills.

This is the **frontend**. It runs on its own with a mock API, and is ready to connect to a Spring Boot backend.

## Run the project

You need [Node.js](https://nodejs.org) 20.19 or newer.

```bash
npm install
npm run dev
```

Then open the address it prints, usually http://localhost:5173.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Check the code |

## Demo accounts

The password for all of them is `password123`. The login page has buttons that fill these in.

| Portal | Type | Email |
|---|---|---|
| Candidate | Student | `aarav.sharma@iitd.ac.in` |
| Candidate | Working professional | `rohan.verma@example.com` |
| Candidate | Faculty (shows Academic Opportunities) | `meera.iyer@deccantech.example` |
| Recruiter | IT company | `talent@neuralpulse.example` |
| Recruiter | University (shows Institution Insights) | `industry@deccan.example` |

Data is saved in your browser, so a change made by one account reaches the others. To start again, go to **Settings > Reset demo data**.

## How it is organized

```
src/
├── components/   ui/ (design system), layout/, and feature components
├── pages/        public/, auth/, candidate/, recruiter/, shared/
├── routes/       Route definitions and access guards
├── store/        Zustand stores (state)
├── services/     API calls, one file per area
├── mocks/        In-browser mock of the REST API
├── data/         Seed data for the mock
├── hooks/        useForm, useAction
├── utils/        Validation, formatting, skill matching
├── constants/    Enums and status rules
└── config/       App name and API settings
```

A page calls a **store**, the store calls a **service**, and the service calls **`apiClient`**. Pages never touch mock data directly.

## Connecting a real backend

Copy `.env.example` to `.env`, and set your API address:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The full database design and API contract is in [docs/BACKEND_DATABASE_SCHEMA.md](docs/BACKEND_DATABASE_SCHEMA.md).

## Renaming the product

Change `APP_NAME_PARTS` in `src/config/app.js`, and the `<title>` in `index.html`.

## Deploying

Page routes need to fall back to `index.html`. `vercel.json` and `public/_redirects` (for Netlify) already handle this.

## Demo limitations

- Sign-in is simulated, and passwords are stored in the browser without encryption. Do not use a real password.
- Uploaded resumes are not stored. Only their file details are kept.
- No emails are sent.
- All organizations, people and jobs in the sample data are made up, apart from the institutions named on sample profiles.
