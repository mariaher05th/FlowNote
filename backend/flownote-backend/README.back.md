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
├── flows/           # Dashboard de flujos (notas colaborativas)
├── widgets/         # Widgets incrustables con posición
├── drawing/         # Capa de dibujo (tableta/ratón)
├── templates/       # Plantillas reutilizables
├── common/
│   ├── guards/      # JwtAuthGuard, jwt.strategy
│   ├── decorators/  # @CurrentUser(), @Roles()
│   └── services/    # AccessService (permisos espacios/notas)
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
PUT    /api/auth/tema          # body: { "tema": "claro"|"oscuro"|"sistema" }
\```

### Notes
\```
POST   /api/notes
GET    /api/notes
GET    /api/notes/buscar?q=texto
GET    /api/notes/estado/:estado
GET    /api/notes/kanban?espacio_id=   # tablero completo (3 columnas)
GET    /api/notes/espacio/:espacioId
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
GET    /api/spaces/:id/notas
GET    /api/spaces/:id/kanban
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

### Flows (dashboard al volverse colaborativa)
\```
GET    /api/flows/nota/:notaId
PUT    /api/flows/nota/:notaId   # body: { nodos, conexiones }
\```

### Widgets
\```
POST   /api/widgets
GET    /api/widgets/nota/:notaId
GET    /api/widgets/espacio/:espacioId
PUT    /api/widgets/:id
PATCH  /api/widgets/:id/posicion   # drag & drop: { x, y, width?, height?, orden? }
DELETE /api/widgets/:id
\```

### Drawing (tableta/ratón)
\```
GET    /api/drawing/nota/:notaId
PUT    /api/drawing/nota/:notaId   # guardar todos los trazos
POST   /api/drawing/nota/:notaId/trazo
DELETE /api/drawing/nota/:notaId
\```

### Templates
\```
GET    /api/templates
GET    /api/templates/:id
POST   /api/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
\```

---

## 📌 Módulos implementados

- [x] Auth (registro + login + JWT + tema de interfaz)
- [x] Notes (CRUD + espacios + kanban + búsqueda + etiquetas + vínculos + exportar PDF/Markdown + plantillas)
- [x] Spaces (crear espacio + invitar miembros + roles + notas/kanban por espacio)
- [x] Reminders (recordatorios + próximos + cron de envío cada minuto)
- [x] Comments (comentarios por rango de texto: posicion_inicio/fin)
- [x] Flows (dashboard de flujo al activar colaboración)
- [x] Widgets (incrustables con posición arrastrable)
- [x] Drawing (trazos con tableta/ratón)
- [x] Templates (plantillas del sistema + personalizadas)
- [x] Speech-to-Text (OpenAI Whisper)