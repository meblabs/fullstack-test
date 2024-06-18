/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const socketIo = require('socket.io');
const swaggerUI = require('swagger-ui-express');
const { createServer } = require('http');

const response = require('./middlewares/response');
const passport = require('./middlewares/passport');
const trimmer = require('./middlewares/trimmer');
const limiter = require('./middlewares/limiter');
const { validator } = require('./middlewares/validator');

const { SendData, NotFound } = require('./helpers/response');
const swaggerSpec = require('./helpers/swagger');
const checkCompany = require('./middlewares/checkCompany');
const { isAuth } = require('./middlewares/isAuth');

const app = express();

const server = createServer(app);
const io = socketIo(server, { cors: { origin: process.env.CORS_ORIGIN } });

app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
    allowedHeaders: ['content-type'],
    exposedHeaders: ['x-total-count', 'x-next-key']
  })
);
if (process.env.LIMITER === '1') app.use(limiter());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(trimmer());
app.use(passport());
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use((req, res, next) => {
  req.io = io;
  return next();
});

app.get('/', (req, res, next) => next(SendData({ message: 'RestAPI is alive!' })));

const excludedPaths = [];

// dynamic routes for express
fs.readdirSync(path.join(__dirname, '/routes'))
  .filter(file => file.indexOf('.') !== 0 && file.slice(-3) === '.js')
  .forEach(file => {
    const f = path.parse(file).name;
    if (f.startsWith('c_'))
      app.use(
        `/companies/:companyId/${f.slice(2)}`,
        validator({ params: 'companyId' }),
        (req, res, next) => isAuth(req, res, next, { excludedPaths }),
        checkCompany({ excludedPaths }),
        require(`./routes/${f}`)
      );
    else app.use(`/${f}`, require(`./routes/${f}`));
  });

app.all('*', (req, res, next) => next(NotFound()));

app.use((toSend, req, res, next) => response(toSend, res));

module.exports = server;
