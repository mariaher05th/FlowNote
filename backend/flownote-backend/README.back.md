# FlowNote – Backend

Desarrollado con **NestJS** + **MongoDB** (Mongoose).

---

## 🚀 Instalación

\```bash
npm install
cp .env.example .env   # configurar variables de entorno
npm run start:dev
\```

---

## 📁 Estructura del proyecto

\```
src/
├── auth/            # Módulo de autenticación (registro, login, JWT)
├── notes/           # Módulo de notas (CRUD + exportar PDF/Markdown)
│   └── export.service.ts
├── spaces/          # Espacios colaborativos + roles
├── reminders/       # Recordatorios
├── comments/        # Comentarios por sección de nota
├── speech/          # Speech-to-Text (OpenAI Whisper)
├── common/
│   ├── guards/      # JwtAuthGuard, jwt.strategy
│   └── decorators/  # @CurrentUser(), @Roles()
└── app.module.ts
\```

---

## 🛠️ Comandos NestJS CLI

| Qué generar | Comando |
|---|---|
| Módulo | `nest g module nombre` |
| Servicio | `nest g service nombre` |
| Controlador | `nest g controller nombre` |
| **Todo junto (recomendado)** | `nest g resource nombre` |

- **Módulos**: inicializan y agrupan los componentes de una funcionalidad.
- **Servicios**: contienen la lógica de negocio, funciones y métodos.
- **Controladores**: definen los endpoints REST que usan los servicios.
- **DTOs**: definen la forma en que se reciben los datos en ciertos endpoints. Se crean manualmente dentro de la carpeta `dto/` de cada módulo.

---

## 🔐 Variables de entorno (.env)

\```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/flownote
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d
PORT=3000
OPENAI_API_KEY=sk-...   # opcional, para Speech-to-Text
\```

---

## 🌐 Endpoints disponibles

### Auth
\```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/perfil
\```

### Notes
\```
POST   /api/notes
GET    /api/notes
GET    /api/notes/buscar?q=texto
GET    /api/notes/estado/:estado
GET    /api/notes/:id
PUT    /api/notes/:id
DELETE /api/notes/:id
GET    /api/notes/:id/vinculos
GET    /api/notes/:id/export/pdf
GET    /api/notes/:id/export/markdown
\```

### Spaces
\```
POST   /api/spaces
GET    /api/spaces
GET    /api/spaces/:id
POST   /api/spaces/:id/miembros
PUT    /api/spaces/:id/miembros/:miembroId
DELETE /api/spaces/:id/miembros/:miembroId
\```

### Reminders
\```
POST   /api/reminders
GET    /api/reminders
GET    /api/reminders/proximos
GET    /api/reminders/nota/:notaId
PUT    /api/reminders/:id
DELETE /api/reminders/:id
\```

### Comments
\```
POST   /api/comments
GET    /api/comments/nota/:notaId
PUT    /api/comments/:id
DELETE /api/comments/:id
\```

### Speech-to-Text
\```
POST   /api/speech/transcribe   # form-data con campo "audio"
\```

---

## 📌 Módulos implementados

- [x] Auth (registro + login + JWT)
- [x] Notes (CRUD + búsqueda + etiquetas + vínculos + exportar PDF/Markdown)
- [x] Spaces (crear espacio + invitar miembros + roles)
- [x] Reminders (recordatorios + próximos)
- [x] Comments (comentarios por sección de nota)
- [x] Speech-to-Text (OpenAI Whisper)