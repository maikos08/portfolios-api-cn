import dotenv from 'dotenv';
import path from 'path';

// Carga las variables de entorno del archivo .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toNumber = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: toNumber(process.env.PORT, 8080),
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'Portfolios',
  },
};

export default config;
