# FlowNote – Backend

Desarrollado con **NestJS** + **MongoDB** (Mongoose).

---

## 🚀 Instalación

```bash
npm install
cp .env.example .env   # configurar variables de entorno
npm run start:dev
```

---

## 📁 Estructura del proyecto

```
src/
├── auth/            # Módulo de autenticación (registro, login, JWT)
│   ├── dto/         # RegisterDto, LoginDto
│   ├── schemas/     # Schema de Usuario
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── notes/           # Módulo de notas (CRUD completo)
│   ├── dto/         # CreateNoteDto, UpdateNoteDto
│   ├── schemas/     # Schema de Nota
│   ├── notes.controller.ts
│   ├── notes.service.ts
│   └── notes.module.ts
├── spaces/          # Módulo de espacios colaborativos
│   ├── dto/         # CreateSpaceDto, InviteMemberDto
│   ├── schemas/     # Schema de EspacioColaborativo, MiembroEspacio
│   ├── spaces.controller.ts
│   ├── spaces.service.ts
│   └── spaces.module.ts
├── speech/          # Módulo de Speech-to-Text
│   ├── dto/         # SpeechDto
│   ├── speech.controller.ts
│   ├── speech.service.ts
│   └── speech.module.ts
├── common/
│   ├── guards/      # JwtAuthGuard, RolesGuard
│   └── decorators/  # @CurrentUser(), @Roles()
└── app.module.ts
```

---

## 🛠️ Comandos NestJS CLI

> Siempre correr desde la raíz del proyecto.

| Qué generar | Comando |
|---|---|
| Módulo | `nest g module nombre` |
| Servicio | `nest g service nombre` |
| Controlador | `nest g controller nombre` |
| **Todo junto (recomendado)** | `nest g resource nombre` |

### ¿Qué genera cada uno?

- **Módulos**: inicializan y agrupan los componentes de una funcionalidad.
- **Servicios**: contienen la lógica de negocio, funciones y métodos.
- **Controladores**: definen los endpoints REST que usan los servicios.
- **DTOs** *(Data Transfer Objects)*: definen la forma en que se reciben los datos en ciertos endpoints. Se crean manualmente dentro de la carpeta `dto/` de cada módulo.

### Ejemplo de flujo completo

```bash
nest g resource notes
# → genera notes.module.ts, notes.controller.ts, notes.service.ts
# → luego tú creas src/notes/dto/create-note.dto.ts manualmente
```

---

## 🔐 Variables de entorno (.env)

```env
MONGODB_URI=mongodb://localhost:27017/flownote
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## 📦 Dependencias principales

```bash
npm install @nestjs/mongoose mongoose
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs
npm install @nestjs/config
npm install multer @types/multer          # para speech-to-text (subida de audio)
npm install @google-cloud/speech          # opción A: Google Speech-to-Text
# — O —
npm install openai                        # opción B: OpenAI Whisper (más fácil)
```

---

## 🎤 Speech-to-Text

Se recomienda **OpenAI Whisper** por simplicidad. El endpoint recibe un archivo de audio y devuelve el texto transcrito, que luego puede insertarse en una nota.

`POST /speech/transcribe` → devuelve `{ text: "..." }`

---

## 📌 Módulos implementados

- [x] Auth (registro + login + JWT)
- [x] Notes (CRUD + búsqueda + etiquetas + exportar)
- [x] Spaces (crear espacio + invitar miembros + roles)
- [x] Speech-to-Text
