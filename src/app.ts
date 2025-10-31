import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos desde public/
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler as any);

export default app;
