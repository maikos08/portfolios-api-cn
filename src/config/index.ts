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
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'Portfolios',
  },
  // Validation limits (configurable via environment)
  limits: {
    maxNameLength: toNumber(process.env.MAX_NAME_LENGTH, 100),
    maxDescriptionLength: toNumber(process.env.MAX_DESCRIPTION_LENGTH, 1000),
    maxSkills: toNumber(process.env.MAX_SKILLS, 50),
    maxSkillLength: toNumber(process.env.MAX_SKILL_LENGTH, 50),
  },
};

export default config;
