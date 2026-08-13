# Akadion Frontend

Acesta este frontend-ul aplicatiei Akadion, o platforma academica construita in jurul libertatii de a alege cursurile (stil free-elective). Platforma faciliteaza interactiunea dintre profesori si studenti si integreaza un asistent bazat pe AI (Aky) conectat la resursele cursurilor.

## Tehnologii Principale

* **Framework:** React 19
* **Build Tool:** Vite
* **Routing:** React Router (`react-router-dom`)
* **Styling:** Tailwind CSS (alaturi de componente UI bazate pe arhitectura shadcn/ui)
* **Server State:** TanStack Query
* **Formulare & Validare:** TanStack Form + Zod
* **HTTP Client:** wrapper intern peste `fetch`
* **Pictograme:** Lucide React

## Structura Proiectului

Directorul `/src` este organizat astfel:

* `/api` - Clientul HTTP intern, Query Client-ul si infrastructura pentru comunicarea cu backend-ul, inclusiv gestiunea CSRF.
* `/app` - Shell-ul aplicatiei si layout-urile globale.
* `/auth` - Providerul de context pentru starea globala de autentificare, guards si utilitarele de delogare.
* `/components/ui` - Componente UI generice bazate pe shadcn/ui.
* `/features` - Implementarile feature-urilor aplicatiei (`courses`, `aky-chat`, `study-tools`, `profile`, `admin`, `auth`, `owl-hall`).
* `/pages` - Wrapper-e subtiri pentru rutare catre implementari din `features`.
* `/lib` - Utilitare si adaptoare pastrate pentru cod comun sau compatibilitate incrementala.

## Rulare Locala

Sistemul se bazeaza pe un proxy setat in `vite.config.js` care redirectioneaza automat apelurile API (pe ruta `/api`), dar si rutele de autentificare OAuth2 (`/oauth2`, `/login`, `/logout`) catre backend (la portul implicit 8081). Aceasta abordare elimina complet problemele de CORS in dezvoltare.

Pentru a porni frontend-ul:

```bash
npm install
npm run dev
```

Platforma va fi disponibila la `http://localhost:5173`.
Aplicatia intercepteaza accesul neautentificat si redirectioneaza automat browserul la `/oauth2/authorization/keycloak` pentru initierea fluxului OIDC.
