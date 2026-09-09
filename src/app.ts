import './config'; // carga las variables de entorno antes que nada
import express, { Application } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import scoreRoutes from './routes/score.routes';
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

app.use(cors());
app.use(express.json());

// TODO: montar rutas bajo su prefijo definitivo.
app.use('/auth', authRoutes);
app.use('/score', scoreRoutes);

// El error handler siempre va al final, después de las rutas.
app.use(errorHandler);

export default app;
