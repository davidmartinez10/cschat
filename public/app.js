/* eslint-env browser */
/* global io */
const socket = io();

function submit() {
  socket.emit('message', document.querySelector('#m').value);
  document.querySelector('#m').value = '';
  return false;
}

document.querySelector('#b').onclick = submit;

socket.on('message', (msg) => {
  document.querySelector('#messages').innerHTML += `<li>${msg}</li>`;
});
