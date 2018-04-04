const express = require('express');
const http = require('http');
const redis = require('redis');

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const client = redis.createClient();
const { promisify } = require('util');

const getAsync = promisify(client.get).bind(client);

client.flushdb();

const names = []; // For mocking purposes.

app.use(express.static('./public'));

app.get('/admin', (req, res) => {
  client.keys('usr-*', (err, keys) => {
    const arr = [];
    if (keys.length > 0) {
      keys.forEach(async (k, i) => {
        const id = k.split('-')[1];
        arr.push(`<li><a href="admin.html?id=${id}">${await getAsync(k)}</a></li>`);
        if (i === keys.length - 1) res.send(`<ul>${arr.join('')}</ul>`);
      });
    } else {
      res.send('There are no users connected');
    }
  });
});

const color = (str, clr) => `<span style='color:${clr}'>${str}</span>`;

io.on('connect', (socket) => {
  if (!socket.handshake.query.id) {
    client.set(`usr-${socket.id}`, names.pop() || 'asd');
  } else {
    client.set(`admin-${socket.handshake.query.id}`, socket.id);
  }

  socket.on('adminmsg', (msg) => {
    const message = color(`Admin: ${msg}`, 'orange');
    socket.emit('message', message);
    socket.broadcast.to(socket.handshake.query.id).emit('message', message);
  });

  socket.on('message', async (msg) => {
    const a = await getAsync(`admin-${socket.id}`);
    const message = `${await getAsync(`usr-${socket.id}`)}: ${msg}`;
    socket.emit('message', message);
    socket.broadcast.to(a).emit('message', message);
  });

  socket.on('disconnect', () => {
    if (!socket.handshake.query.id) {
      client.del(`usr-${socket.id}`);
    } else {
      client.del(`admin-${socket.handshake.query.id}`);
    }
  });
});

server.listen(3000, () => {
});
