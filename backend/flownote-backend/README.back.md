# FlowNote – Backend

Desarrollado con **NestJS** + **MongoDB** (Mongoose).

---

## 🚀 Instalación

\```bash
npm install
cp .env.example .env   # configurar variables de entorno
npm run start:dev
\```

## 🧪 Pruebas unitarias

\```bash
npm test           # ejecutar todos los tests
npm run test:watch # modo observador
npm run test:cov   # con cobertura
\```

Los tests están en `src/**/*.spec.ts` y mockean MongoDB (sin base de datos real).

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
├── collaboration/   # WebSocket + locks en tiempo real
│   └── schemas/collaboration-lock.schema.ts
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

### WebSocket – Colaboración en tiempo real

**Namespace:** `ws://localhost:3000/collaboration`  
**Auth:** JWT en `handshake.auth.token`, query `?token=` o header `Authorization: Bearer`

Al conectar recibes `resourceTypes` y `capabilities` por dominio (nota, dibujo, comentarios, kanban, flujo, widgets).

#### Salas y locks

| Evento (cliente → servidor) | Descripción |
|---|---|
| `join_room` | `{ roomType: "nota"\|"espacio", roomId }` |
| `leave_room` | Sale de la sala y libera sus locks |
| `lock_acquire` / `lock_renew` / `lock_release` | Ver tipos de recurso abajo |
| `presence_ping` | Usuarios conectados en la sala |

**Tipos de lock:** `note_title`, `note_content`, `note_metadata`, `drawing_canvas`, `drawing_stroke`, `comment`, `comment_anchor`, `board`, `flow_node`, `flow_edge`, `widget`

#### Tiempo real por dominio

| Evento (cliente → servidor) | Escucha (servidor → otros) | Uso |
|---|---|---|
| `note_update` | `note_updated` | Título, contenido, estado, etiquetas |
| `note_cursor` | `note_cursor` | Cursor / selección del editor |
| `drawing_update` | `drawing_updated` / `drawing_stroke_added` / `drawing_cleared` | Canvas completo, un trazo o limpiar |
| `comment_add` | `comment_added` | Nuevo comentario inline |
| `comment_update` | `comment_updated` | Editar comentario |
| `comment_delete` | `comment_deleted` | Eliminar comentario |
| `kanban_update` | `kanban_updated` | Mover nota de columna |
| `flow_update` | `flow_updated` | Tablero de flujo |
| `widget_update` | `widget_updated` | Posición o contenido de widget |

**Ejemplo nota:**
\```json
{ "roomType": "nota", "roomId": "...", "field": "contenido", "payload": "texto en vivo" }
\```

**Ejemplo dibujo (trazo):**
\```json
{ "roomType": "nota", "roomId": "...", "mode": "stroke", "payload": { "trazo": { "puntos": [{ "x": 1, "y": 2 }], "color": "#000" } } }
\```

**Ejemplo comentario:**
\```json
{ "roomType": "nota", "roomId": "...", "commentId": "...", "contenido": "...", "posicion_inicio": 10, "posicion_fin": 25 }
\```

**Locks:** TTL 30s (`LOCK_TTL_MS`). Renovar con `lock_renew` cada ~15s. Cron libera locks vencidos. Al desconectar se liberan todos los locks del socket.

> Los eventos WS sincronizan en vivo; persistir en BD sigue siendo vía REST (`PUT /api/notes`, `PUT /api/drawing/...`, `POST /api/comments`, etc.).

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
- [x] Collaboration (WebSocket + locking con TTL y release por inactividad/desconexión)