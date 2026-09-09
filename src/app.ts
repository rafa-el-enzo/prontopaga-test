import './config'; // carga las variables de entorno antes que nada
import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import scoreRoutes from './routes/score.routes';
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/score', scoreRoutes);

// Ruta no encontrada: respuesta JSON consistente con el resto de la API.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// El error handler siempre va al final, después de las rutas.
app.use(errorHandler);

export default app;
