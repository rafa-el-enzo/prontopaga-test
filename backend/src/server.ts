import app from './app';
import config from './config';

const port = Number(config.port);

app.listen(port, () => {
  // TODO: reemplazar por un logger real.
  console.log(`Server listening on port ${port}`);
});
