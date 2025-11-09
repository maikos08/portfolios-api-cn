```markdown
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
Raíz del proyecto (carpeta `api`):

```
api/
├── package.json
├── package-lock.json
├── tsconfig.json
├── Dockerfile
├── api-ecs.yml
├── api-ecr.yml
├── bdd.yml
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   │   └── portfolios.routes.ts
│   ├── controllers/
│   ├── models/
│   ├── types/
│   ├── middleware/
│   └── config/
│       └── data-source.ts
└── public/
    └── index.html
```

### Por qué está organizado así
- **Separación de responsabilidades**: rutas → controladores → datos. Facilita testing y mantenimiento.  
- **Tipos y modelos centralizados** para evitar duplicidad y asegurar consistencia.  
- **Middleware global** (CORS, logging, error handling) para comportamiento uniforme y control de headers en producción.

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

```bash
aws cloudformation deploy --stack-name <STACK_NAME_BDD> --template-file bdd.yml --region <AWS_REGION>
```

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
curl -i -H "Origin: http://example.com" -H "x-api-key: <API_KEY>" http://localhost:8080/portfolios
```

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

