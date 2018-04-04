/* eslint-env browser */
/* global io */
const socket = io('?room=admin');

socket.on('unplug', (id) => {
  document.getElementById(id).remove();
});

socket.on('user', (msg) => {
  document.querySelector('#users').innerHTML += `<li>${msg}</li>`;
});

