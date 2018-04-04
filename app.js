const express = require('express');
const http = require('http');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const color = (str, clr) => `<span style='color:${clr}'>${str}</span>`;
const cache = {};
const users = {};
const adminInstances = {};

app.use(express.static('./public'));

io.on('connect', (socket) => {
  if (socket.handshake.query.room) {
    cache.lobby = socket.id;
    Object.keys(users).forEach((id) => {
      socket.emit('user', `<li id=${id}><a href="admin.html?id=${id}">${id}</a></li>`);
    });
  } else if (socket.handshake.query.id) {
    adminInstances[socket.handshake.query.id] = socket.id;
    socket.broadcast.to(socket.handshake.query.id)
      .emit('message', color('An administrator has joined this session.', 'gray'));
  } else {
    users[socket.id] = 'User';
    socket.broadcast.to(cache.lobby)
      .emit('user', `<li id=${socket.id}><a href="admin.html?id=${socket.id}">${socket.id}</a></li>`);
  }

  socket.on('adminmsg', (msg) => {
    const message = color(`Admin: ${msg}`, 'orange');
    socket.emit('message', message);
    socket.broadcast.to(socket.handshake.query.id).emit('message', message);
  });

  socket.on('message', (msg) => {
    if (adminInstances[socket.id]) {
      const a = adminInstances[socket.id];
      const message = `${users[socket.id]}: ${msg}`;
      socket.emit('message', message);
      socket.broadcast.to(a).emit('message', message);
    } else {
      socket.emit('message', `${color(msg, 'gray')}<br>
        ${color('This message hasn\'t been sent because the administrator is offline', 'red')}`);
    }
  });

  socket.on('disconnect', () => {
    if (socket.handshake.query.id) {
      delete adminInstances[socket.handshake.query.id];
      socket.broadcast.to(socket.handshake.query.id)
        .emit('message', color('The administrator has disconnected from this session.', 'gray'));
    } else {
      socket.broadcast.to(cache.lobby)
        .emit('unplug', socket.id);
      delete users[socket.id];
      socket.broadcast.to(adminInstances[socket.id])
        .emit('message', color('The user has disconnected from this session.', 'gray'));
    }
  });
});

server.listen(3000, () => {
});
