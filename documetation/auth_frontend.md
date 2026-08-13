# Frontend Auth Implementation

## Etapa 6 — 🤖 AGENT: Frontend React (Vite)

### 6.0 `frontend/vite.config.js` — Proxy Vite
Configurarea proxy-ului în Vite pentru a redirecționa apelurile API și paginile de autentificare OAuth2 către backend, evitând problemele de CORS în dezvoltare locală:
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/logout': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
```

### 6.1 `frontend/src/api/client.ts` — Client intern `fetch` configurat pentru CSRF
Frontend-ul folosește un client intern peste `fetch`, configurat să transmită corect cookie-urile de sesiune și token-ul CSRF:
```javascript
// Clientul intern:
// - trimite `credentials: "include"`
// - citește cookie-ul `XSRF-TOKEN`
// - trimite header-ul `X-XSRF-TOKEN` pe request-urile non-GET
```

### 6.2 `frontend/src/context/AuthContext.jsx`
La montare, `GET /api/auth/me`. Expune și `stareCont` din răspuns (nu doar `user`/`loading`), ca rutele să știe ce pagină să arate.

### 6.3 `frontend/src/pages/RegisterPage.jsx`
⚠️ **Nu mai are formular** — devine o pagină simplă, descrierea aplicației (textul cald despre alegerea liberă a cursurilor) + un buton "Creează cont", care face:
```js
window.location.href = '/oauth2/authorization/keycloak-register';
```
(URL relativ, proxy-ul Vite îl trimite spre backend; navigare completă de browser, nu fetch — la fel ca la login)

### 6.4 `frontend/src/pages/LoginPage.jsx` — Pagina de Login
Butonul de login redirectează browser-ul la nivel global către backend pentru a iniția fluxul Authorization Code OAuth2:
```javascript
import React from 'react';

const LoginPage = () => {
  const handleLogin = () => {
    // Redirecționare completă către BFF Endpoint
    window.location.href = '/oauth2/authorization/keycloak';
  };

  return (
    <div className="login-container">
      <h2>Conectare</h2>
      <button onClick={handleLogin}>Autentificare cu Keycloak</button>
    </div>
  );
};

export default LoginPage;
```

### 6.5 `frontend/src/pages/CompleteProfilePage.jsx` (nou)
Formular: `nume`, `prenume`, `facultate`, `rolDorit`. La submit: `POST /api/auth/complete-profile`. Succes → redirect către `/asteptare-aprobare`.

### 6.6 Pagini de stare (noi, simple)
- `AsteptareAprobarePage.jsx` — mesaj "cererea ta e în curs de analiză"
- `CerereRespinsaPage.jsx` — mesaj + buton "Editează și retrimite" → duce înapoi la `CompleteProfilePage` (pre-completată dacă vreți, opțional)
- `ContDezactivatPage.jsx` — mesaj, fără acțiune posibilă

### 6.7 `frontend/src/components/ProtectedRoute.jsx`
Actualizat: verifică nu doar `user !== null`, ci și `stareCont === 'ACTIV'` pentru rutele aplicației normale; redirecționează altfel către pagina corespunzătoare stării (vezi §3.1 pentru maparea completă).

✅ **Verificare Etapa 6**: flux complet de la zero — `/register` → Keycloak (temă custom) → `/complete-profile` → `/asteptare-aprobare` → (admin acceptă) → login din nou → aplicația normală.

---

## Etapa 7 — 🤖 AGENT: Logout + panou admin

### 7.1 Componenta Logout
Deoarece `/logout` este protejat prin CSRF în Spring Security, delogarea nu se poate face prin simplă accesare a unui link de tip `GET`. Trebuie făcut un request de tip `POST` care să conțină header-ul CSRF:
```javascript
import React from 'react';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Redirecționare la login
      window.location.href = '/login';
    } catch (error) {
      console.error('Eroare la logout:', error);
    }
  };

  return <button onClick={handleLogout}>Deconectare</button>;
};
```

### 7.2 Panou Admin: Lista Cereri (`AdminPendingPage.jsx`)
Actualizăm codul paginii pentru a folosi proprietatea directă `nrRespingeri` primită din DTO:
```javascript
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

const AdminPendingPage = () => {
  const { data: cereri = [] } = useQuery({
    queryKey: ['admin-users', 'pending'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users?stare=PENDING', { credentials: 'include' });
      return response.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      await fetch(`/api/admin/users/${id}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
    },
  });

  const handleAction = async (id, action) => {
    try {
      await actionMutation.mutateAsync({ id, action });
    } catch (err) {
      alert('Eroare la procesarea cererii: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Cereri Înregistrare în Așteptare</h2>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Email</th>
            <th>Rol Dorit</th>
            <th>Nr. Respingeri anterioare</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {cereri.map(user => (
            <tr key={user.id}>
              <td>{user.prenume} {user.nume}</td>
              <td>{user.mail}</td>
              <td>{user.rolDorit || user.rol}</td>
              <td>{user.nrRespingeri}</td>
              <td>
                <button onClick={() => handleAction(user.id, 'accept')}>Acceptă</button>
                <button onClick={() => handleAction(user.id, 'reject')}>Respinge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---
