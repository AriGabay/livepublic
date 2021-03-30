const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');
var gIo = null;
var gSocketBySessionIdMap = {};

function connectSockets(http, session, corsOrigin) {
  gIo = require('socket.io')(http, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
    },
  });
  const sharedSession = require('express-socket.io-session');
  gIo.use(
    sharedSession(session, {
      autoSave: true,
    })
  );
  gIo.on('connection', (socket) => {
    console.log('connected');
    gSocketBySessionIdMap[socket.handshake.sessionID] = socket;
    socket.on('disconnect', (socket) => {
      console.log('Someone disconnected');
      if (socket.handshake) {
        gSocketBySessionIdMap[socket.handshake.sessionID] = null;
      }
    });
    socket.on('chat topic', (topic) => {
      if (socket.myTopic === topic) return;
      if (socket.myTopic) {
        socket.leave(socket.myTopic);
      }
      socket.join(topic);
      socket.myTopic = topic;
    });
    socket.on('chat newMsg', (msg) => {
      gIo.to(socket.myTopic).emit('chat addMsg', msg);
    });

    socket.on('login', (user) => {
      socket.join(user._id);
    });
    socket.on('logout', (user) => {
      socket.broadcast.emit('user-left', user);
    });

    socket.on('join-reservation-chat', (data) => {
      if (!data.order || !data.order._id) {
        console.error('join-reservation-chat error', JSON.stringify(data));
        return;
      }
      socket.join(data.order._id);
    });

    socket.on('reservation-created', (data) => {
      socket.join(data.order._id);
      emit({ type: data.host._id, data });
    });

    socket.on('order-approval', (data) => {
      const order = data;
      if (!order || !order.buyer || !order.buyer._id) {
        console.error('order-approval error', JSON.stringify(data));
        return;
      }
      emit({
        type: order.buyer._id,
        data: order,
      });
    });
  });
}

function emit({ type, data }) {
  gIo.emit(type, data);
}

// TODO: Need to test emitToUser feature
function emitToUser({ type, data, userId }) {
  gIo.to(userId).emit(type, data);
}

// Send to all sockets BUT not the current socket
function broadcast({ type, data }) {
  const store = asyncLocalStorage.getStore();
  const { sessionId } = store;
  if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store');
  const excludedSocket = gSocketBySessionIdMap[sessionId];
  if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map', gSocketBySessionIdMap);
  excludedSocket.broadcast.emit(type, data);
}

module.exports = {
  connectSockets,
  emit,
  broadcast,
};
