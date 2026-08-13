# Servicii si Comunicare API

Toata logica de fetch si trimitere date catre backend este decuplata din componente si este extrasa sub forma de functii pure / servicii regasite in `src/lib`. Toate call-urile HTTP trec prin clientul intern din `src/api/client.ts`.

## 1. Configurarea clientului HTTP (`src/api/client.ts`)

Pentru a asigura validitatea cererilor POST/PUT/DELETE catre un backend Spring Security protejat impotriva atacurilor CSRF (Cross-Site Request Forgery), clientul intern foloseste:
- `credentials: "include"` - trimite cookie-ul `SESSION` aferent utilizatorului autentificat cu fiecare cerere.
- citirea cookie-ului `XSRF-TOKEN` si trimiterea header-ului `X-XSRF-TOKEN` pe request-urile non-GET.

## 2. Servicii (Directorul `src/lib/`)

### 2.1 `user.js`
Gestionare si acces la functii despre utilizator.
- **`updateMyProfile(payload)`**: Endpoint-ul pentru trimiterea detaliilor modificate in `ProfilePage`. API: `PUT /api/auth/me`.
- **`updateMyEmail(email)`**: Permite actualizarea adresei, ceea ce declanseaza sincronizarea Keycloak si reverificarea.
- **`requestMyPasswordReset()`**: Solicita backend-ului rularea unui flow `Zero-Trust` prin Keycloak ExecuteActionsEmail (fara formular manual de schimbare pe frontend). API: `POST /api/auth/me/request-password-reset`.
- Utilitare ajutatoare sincrone: `isProfessorUser(user)`, `isAdminUser(user)`, `isStudentUser(user)`, si `getUserDisplayName(user)`. Ele ajuta rutele sa decida accesul (Role-Based Access Control in frontend).

### 2.2 `conversatii.ts`
Integrare curata a widget-ului de AI.
- Expune functiile pentru conversatii, quiz si flashcards.

### 2.3 `professorCourses.ts`
Cel mai masiv serviciu din aplicatie. Incapsuleaza toata complexitatea interactiunii cu cursurile (CRUD), preluand logica atat pentru Profesori (creatorii si gestionarii) cat si pentru studenti (consumatorii).
- **Listing Cursuri**: `listProfessorCourses()`, `listStudentCourses()`, `listStudentAvailableCourses()`, `listAdminCourses()`.
- **Enrollment / Withdraw**: Functii catre `/api/student/cursuri/{id}/inscriere` sau `.../retragere`.
- **Actiuni Administrative Curs (Profesor)**: 
  - Creare si editare curs: `createProfessorCourse()`, `updateProfessorCourse()`.
  - Gestionare Saptamani (Module): `createCourseWeek()`, `updateCourseWeek()`, `deleteCourseWeek()`.
  - Incarcare Materiale RAG/Documente: `uploadWeekDocument(weekId, payload)`, care instanțiază obiecte `FormData` native browser-ului pentru expedierea cu succes a fișierelor.
  - Gestionare Status RAG Documente (Retry ingeste eronat): `retryDocumentIngest(documentId)`.
- **Progres Student**: `completeStudentWeek(weekId)` - Apel pentru marcarea unui modul din curs drept finalizat de catre student, ajutand calculul progresului (percentual) aratat pe tab-ul general.
- **Helpers Erori**: 
  - `getCourseErrorMessage(error, fallbackMessage)` preia automat eroarea aplicatiei si o mapeaza pe baza structurii noastre cunoscute din backend (`error.response.data.eroare` sau `.message`). Daca gaseste un HTTP 400, 401, 403, 404, afiseaza explicit text pe intelesul UI-ului.
  - `getCourseFieldErrors(error)`: preia cheile si field-urile invalide trimise din ControllerAdvice de la backend pentru formulare invalide.

## 3. Tratarea Erorilor in UI
Nu exista o decuplare masiva intre un serviciu `try/catch` din `lib` si pagina; paginile React au grija sa infasoare aceste apeluri lib asincrone (`await function_from_lib`) cu constructii try-catch pentru a popula direct elementul generic UI `<Alert variant="destructive">` in caz de esec. Acest design permite UI-ului specific sa pastreze responsabilitatea afisarii unei notificari (sau field-errors direct langa inputuri), mentinand functiile API strict pentru comunicarea de date si translatie curata.
