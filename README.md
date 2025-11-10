# Portfolios API — Documentación técnica

**Autor:** Miguel Ángel Rodríguez Ruano

---

## Descripción
API REST para gestionar portfolios. Servicio desarrollado en **TypeScript/Node.js** con **Express**, desacoplado para ejecutarse en contenedor (**ECS/Fargate**). La API expone endpoints para **CRUD** sobre portfolios y está diseñada para trabajar con **DynamoDB** como persistencia.

---

## Contenido de este documento
- Organización del proyecto y propósito de cada sección  
- Dependencias e instalación  
- Variables de entorno necesarias  
- Arquitectura y responsabilidades de los componentes  
- Guía de despliegue a AWS (CloudFormation, ECR, ECS/ALB/NLB)  
- Verificación y pruebas locales  
- Buenas prácticas y notas de seguridad  

---

## Estructura del repositorio
Raíz del proyecto:

```
api/
├── package.json
├── package-lock.json
├── tsconfig.json
├── Dockerfile
├── api-ecs.yml          # CloudFormation para ECS/ALB/NLB + API Gateway
├── api-ecr.yml          # CloudFormation para crear repositorio ECR
├── bdd.yml              # CloudFormation para DynamoDB (tabla Portfolios)
├── src/
│   ├── app.ts           # Composición de la app express
│   ├── server.ts        # Entrypoint que arranca el servidor
│   ├── routes/
│   │   └── portfolios.routes.ts
│   ├── controllers/
│   │   └── portfolios.controller.ts
│   ├── models/
│   │   └── portfolio.model.ts
│   ├── types/
│   │   └── portfolio.d.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   │   └── validation.ts
│   └── config/
│       └── index.ts    # carga de variables y límites de validación
├── postman/            # Postman collection & environment for automated/manual testing
│   ├── portfolios-api.postman_collection.json
│   └── portfolios-api.postman_environment.json
└── public/
  └── index.html      # UI estática que consume la API
```

### Por qué está organizado así
- **Separación de responsabilidades**: rutas → controladores → datos. Facilita testing y mantenimiento.  
- **Tipos y modelos centralizados** para evitar duplicidad y asegurar consistencia.  

---

## Dependencias e instalación (entorno de desarrollo)

### Requisitos locales:
- Node.js  
- npm  
- Docker (para construir y probar imagen localmente)  
- AWS CLI configurado con credenciales y región  

### Instalación:

```bash
cd \path\to\repo\api
npm install
```

```bash
npm run build
```

```bash
npm run dev
```

---

## Variables de entorno (archivo `.env`)

```env
NODE_ENV=development
PORT=8080
AWS_REGION=us-east-1
DYNAMODB_TABLE_NAME=Portfolios

MAX_NAME_LENGTH=100
MAX_DESCRIPTION_LENGTH=1000
MAX_SKILLS=50
MAX_SKILL_LENGTH=50
```

---

## Arquitectura (visión general)

La aplicación está diseñada para ejecutarse como servicio contenedorizado en **ECS (Fargate)** y recibir tráfico a través de **API Gateway (REST)** conectado mediante **VPC Link** a un **Network Load Balancer (NLB)** que enruta a las tareas ECS.

### Flujo resumido:
```
Cliente → API Gateway → VPC Link → NLB → ECS (Fargate) → DynamoDB
←───────────────────────────────────────────────────────────────
```

### Por qué cada cosa está donde está
| Componente       | Propósito |
|------------------|---------|
| **API Gateway**  | Gestión de API, seguridad (API Key, usage plans), CORS |
| **NLB + VPC Link** | Acceso seguro desde API Gateway a servicios en VPC |
| **ECS/Fargate**  | Ejecución sin gestión de servidores, escalabilidad |
| **DynamoDB**     | Persistencia NoSQL ideal para este modelo |

---

## Despliegue a AWS (guía paso a paso)

> **Nota:** Reemplazar placeholders (`<STACK_NAME_API>`, `<AWS_REGION>`, etc.) por valores reales.

### 1) Construir y subir imagen a ECR

Se despliega el archivo `api-ecr.yml` en CloudFormation para crear el repositorio ECR. Una vez creado, en la consola de AWS se mostrarán los comandos necesarios para subir la imagen al repositorio.

```bash
# Autenticación
aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com
```

```bash
# Construir imagen
docker build --platform linux/amd64 -t <LOCAL_IMAGE_NAME>:latest -f ./Dockerfile . --provenance=false
```

```bash
# Etiquetar y empujar
docker tag <LOCAL_IMAGE_NAME>:latest <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<ECR_REPOSITORY_NAME>:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com/<ECR_REPOSITORY_NAME>:latest
```

### 3) Desplegar base de datos (si la tabla Portfolios no existe aún)

Se despliega desde CloudFormation mediante el archivo bdd.yml.

### 4) Desplegar infraestructura

Se despliega el archivo `api-ecs.yml` en CloudFormation. Durante el proceso se solicitarán los siguientes parámetros:

- `ImageName` (valor por defecto: `portfolios-app:latest`)  
- `VpcId`  
- `SubnetIds` (mínimo 2 subredes)  
- `VpcCidr` (rango CIDR del VPC, se muestra al seleccionar el VPC)  
- `DBDynamoName` (valor por defecto: `"Portfolios"`)

### 5) Obtener URL de la API

La URL se muestra en los **outputs** tras el despliegue exitoso de la infraestructura.

También se puede obtener mediante el siguiente comando (requiere AWS CLI):

```bash
aws cloudformation describe-stacks --stack-name <STACK_NAME_API> --region <AWS_REGION> \
  --query "Stacks[0].Outputs[?OutputKey=='PortfolioApiUrl'].OutputValue" --output text
```

> Ejemplo: `https://{restapi-id}.execute-api.<region>.amazonaws.com/prod`

### 6) Obtener API Key

El `ApiKeyId` también aparece en los **outputs** del stack.

Alternativamente, se puede obtener con:

```bash
ApiKeyId=$(aws cloudformation describe-stack-resources --stack-name <STACK_NAME_API> --region <AWS_REGION> \
  --query "StackResources[?LogicalResourceId=='APIKey'].PhysicalResourceId" --output text)
```

Y luego obtener el valor real de la clave:

```bash
aws apigateway get-api-key --api-key ${ApiKeyId} --include-value --region <AWS_REGION> \
  --query '{id:id, name:name, value:value}' --output json
```

### 7) Verificación local

```bash
npm install && npm run build && npm run start
```

```bash
curl -i http://localhost:8080/health
```

#### Postman collection

- Hay una colección y un environment en la carpeta `postman/`.
- Para importarlos en Postman:
  1) Postman → Import → seleccionar `postman/portfolios-api.postman_collection.json`.
  2) Environments → Import → seleccionar `postman/portfolios-api.postman_environment.json`.
- Edita el environment importado y establece:
  - `base_url`: URL de API Gateway desplegado (recordar poner `/portfolios`).
  - `api_key`: API Key, ya que la API lo requiere.
- Selecciona el environment en Postman y ejecuta la colección usando el Collection Runner.
- Nota: la petición "Create portfolio" guarda el id en la variable de environment `portfolioId` para las siguientes peticiones.
- Nota: los tests de la colección asumen respuestas 2xx; ajusta si tu API devuelve otros códigos (p.ej. 201).

---

## Ejecución del frontend local apuntando a la API (localhost:8080)

1. Abrir la interfaz y configurar:
 ```env
   API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com/prod/portfolios
   API_KEY=tu_api_key_aqui
   ```
2. Verificar lo siguiente:
   - Las llamadas a `/portfolios` se realizan correctamente  
   - No aparecen errores de CORS en la consola del navegador

