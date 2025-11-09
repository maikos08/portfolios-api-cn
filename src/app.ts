import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { VALIDATION_LIMITS } from './utils/validation';

const app = express();

// Health & readiness endpoints used by container orchestrators and load balancers
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', (_req, res) => res.status(200).json({ ready: true }));

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsOptions.origin as string);
    res.setHeader('Access-Control-Allow-Headers', (corsOptions.allowedHeaders as string[]).join(','));
    res.setHeader('Access-Control-Allow-Methods', (corsOptions.methods as string[]).join(','));
    return res.sendStatus((corsOptions.optionsSuccessStatus as number) || 204);
  }
  next();
});

app.use(express.json());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/config', (_req, res) => res.json(VALIDATION_LIMITS));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler as any);

export default app;
