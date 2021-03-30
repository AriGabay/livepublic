require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const expressSession = require('express-session');
const app = express();
const http = require('http').createServer(app);
app.use(express.json({ limit: '100mb' }));

const session = expressSession({
  secret: process.env.HASH_KEY || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
});
// Express App Config
app.use(express.json());
app.use(session);
// app.use(express.static('public'));

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`App listening on port ${port}!`);
// });

const corsOptions = {
  origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
  credentials: true,
};

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'public')));
} else {
  app.use(cors(corsOptions));
}

const mainRouter = require('./main.routes');
app.use('/api', mainRouter);

//SOCKETS
const { connectSockets } = require('./services/socket.service');
connectSockets(http, session, corsOptions.origin);

const port = process.env.PORT || 3030;
http.listen(port, () => {
  console.info('Server is running on port: ' + port);
  console.info(process.env.ENV_LOADED);
});
