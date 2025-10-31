# Portfolio API - Backend Profesional

API REST desarrollada con **Node.js**, **TypeScript**, **Express** y **AWS DynamoDB**.

## 🚀 Características

- ✅ TypeScript con configuración estricta
- ✅ AWS SDK v3 para DynamoDB
- ✅ Variables de entorno con `dotenv`
- ✅ Estructura modular: controllers, routes, models, types, middleware
- ✅ Manejo de errores centralizado
- ✅ Desarrollo con hot-reload (`ts-node-dev`)
- ✅ CRUD completo para portfolios
- ✅ Soporte para DynamoDB local y AWS

## 📦 Requisitos

- Node.js >= 16
- Cuenta de AWS con DynamoDB (o DynamoDB Local para desarrollo)
- Credenciales de AWS configuradas
- npm o yarn

## 🛠️ Instalación y configuración

### 1. Instalar dependencias
```cmd
npm install
```

### 2. Configurar AWS

#### Opción A: Usar AWS Cloud
1. Crear usuario IAM con permisos de DynamoDB
2. Obtener `AWS_ACCESS_KEY_ID` y `AWS_SECRET_ACCESS_KEY`
3. Configurar en `.env`

#### Opción B: Usar DynamoDB Local (desarrollo)
```cmd
# Descargar DynamoDB Local
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

# Ejecutar DynamoDB Local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

### 3. Configurar variables de entorno

Edita `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
DYNAMODB_TABLE_NAME=Portfolios
PORT=3000

# Para DynamoDB Local, descomentar:
# DYNAMODB_ENDPOINT=http://localhost:8000
```

### 4. Crear tabla DynamoDB

#### Opción A: Usando CloudFormation (Recomendado para AWS)
```cmd
aws cloudformation create-stack ^
  --stack-name portfolios-api ^
  --template-body file://cloudformation.yml ^
  --region us-east-1
```
Ver `CLOUDFORMATION.md` para más detalles y opciones.

#### Opción B: Usando script Node.js
```cmd
npm run db:create
```

### 5. Insertar datos de ejemplo (opcional)
```cmd
npm run db:seed
```

### 6. Construir y subir imagen Docker a AWS ECR

#### Opción local (script)
```cmd
# Linux / macOS
./scripts/build-and-push-ecr.sh <AWS_ACCOUNT_ID> <AWS_REGION> <REPOSITORY_NAME> <TAG>

# Windows (PowerShell)
pwsh ./scripts/build-and-push-ecr.ps1 -AwsAccountId <AWS_ACCOUNT_ID> -AwsRegion <AWS_REGION> -RepoName <REPOSITORY_NAME> -ImageTag <TAG>
```

#### Opción CI (GitHub Actions)
1. Añade estos secrets en tu repositorio GitHub: `AWS_ACCOUNT_ID`, `AWS_REGION`, `ECR_REPOSITORY`, `AWS_ROLE_TO_ASSUME` (o configurar AWS credentials via secrets).
2. Push a la rama `main` y la action `.github/workflows/ecr.yml` construirá y publicará la imagen a ECR.


### 6. Ejecutar en desarrollo
```cmd
npm run dev
```

Servidor corriendo en `http://localhost:3000`

### 7. Acceder al Frontend

Abre tu navegador en `http://localhost:3000` para ver la interfaz web.

- **API endpoints:** `http://localhost:3000/api/portafolios`
- **Frontend:** `http://localhost:3000/index.html` (o simplemente `http://localhost:3000`)

## 📚 Endpoints API

**Base URL:** `/api/portfolios`

### GET - Consultas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/portfolios` | Lista todos los portfolios |
| GET | `/api/portfolios/:id` | Obtiene un portfolio por ID |
| GET | `/api/portfolios/skills/all` | Lista todas las habilidades únicas |

### POST - Crear
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/portfolios` | Crea un nuevo portfolio |

### PUT - Actualizar
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| PUT | `/api/portfolios/:id` | Actualiza un portfolio |

### DELETE - Eliminar
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| DELETE | `/api/portfolios/:id` | Elimina un portfolio |

## 📝 Ejemplos de uso

### Listar todos los portfolios
```cmd
curl http://localhost:3000/api/portfolios
```

### Obtener portfolio por ID
```cmd
curl http://localhost:3000/api/portfolios/abc-123-def
```

### Crear portfolio
```json
POST /api/portfolios
{
  "name": "Mi Portfolio",
  "description": "Desarrollador Full Stack",
  "skills": ["TypeScript", "React", "Node.js", "AWS"]
}
```

```cmd
curl -X POST http://localhost:3000/api/portfolios -H "Content-Type: application/json" -d "{\"name\":\"Mi Portfolio\",\"description\":\"Desarrollador Full Stack\",\"skills\":[\"TypeScript\",\"React\",\"Node.js\"]}"
```

### Actualizar portfolio
```json
PUT /api/portfolios/:id
{
  "description": "Nueva descripción actualizada",
  "skills": ["TypeScript", "DynamoDB", "AWS Lambda"]
}
```

### Eliminar portfolio
```cmd
curl -X DELETE http://localhost:3000/api/portfolios/abc-123-def
```

### Obtener todas las habilidades
```cmd
curl http://localhost:3000/api/portfolios/habilidades/all
```

## 🏗️ Estructura del proyecto

```
src/
├── app.ts                    # Configuración Express
├── server.ts                 # Punto de entrada
├── config/
│   ├── index.ts             # Variables de entorno
│   └── data-source.ts       # Cliente DynamoDB
├── controllers/
│   └── portfolios.controller.ts
├── models/
│   └── portfolio.model.ts   # Interface Portfolio
├── routes/
│   ├── index.ts
│   └── portfolios.routes.ts
├── types/
│   └── portfolio.d.ts       # TypeScript types
└── middleware/
    └── error.middleware.ts  # Manejo de errores

scripts/
├── create-table.js          # Crear tabla DynamoDB
└── seed-data.js             # Insertar datos de ejemplo
```

## 🔧 Scripts disponibles

```cmd
npm run dev      # Desarrollo con hot-reload
npm run build    # Build para producción
npm start        # Ejecutar build de producción
```

## 🗄️ Modelo de datos DynamoDB

### Tabla: Portfolios
- **Partition Key:** `id` (String) - UUID
- **Attributes:**
  - `name`: String (requerido)
  - `description`: String (opcional)
  - `skills`: List de Strings (opcional)
  - `createdAt`: String (ISO timestamp)
  - `updatedAt`: String (ISO timestamp)

### Ejemplo de Item
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Corazoncito de Melocotón",
  "description": "Desarrolladora Backend Node.js",
  "skills": ["Node.js", "Express", "DynamoDB", "AWS"],
  "createdAt": "2025-10-24T10:30:00.000Z",
  "updatedAt": "2025-10-24T10:30:00.000Z"
}
```

## 🔒 Producción

Para producción, considera:
- Establecer `NODE_ENV=production`
- Usar IAM roles en EC2/Lambda en lugar de credenciales hardcodeadas
- Configurar CORS apropiadamente
- Agregar rate limiting
- Implementar autenticación/autorización (AWS Cognito)
- Usar AWS Secrets Manager para credenciales
- Configurar CloudWatch para logging y monitoring
- Implementar DynamoDB backup automático
- Considerar usar DynamoDB Streams para auditoría

## 🌐 Despliegue en AWS

### Opción 1: AWS Lambda + API Gateway
- Usar Serverless Framework o AWS SAM
- Auto-scaling y pay-per-use
- Integración nativa con DynamoDB

### Opción 2: AWS EC2 / ECS / EKS
- Deploy tradicional con Docker
- Mayor control sobre infraestructura
- Usar IAM roles para acceso a DynamoDB

### Opción 3: AWS App Runner
- Deploy directo desde GitHub
- Managed container service
- Auto-scaling integrado

## 💰 Costos DynamoDB

- **On-Demand Mode:** Pay per request (ideal para desarrollo)
- **Provisioned Mode:** Capacidad reservada (más económico en producción)
- **Free Tier:** 25 GB storage + 25 WCU/RCU

## 📄 Licencia

ISC


