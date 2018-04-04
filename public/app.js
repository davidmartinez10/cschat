/* eslint-env browser */
/* global io */
const socket = io();
const welcome = '<li>An administrator will connect shortly. Please wait.</li>';
document.querySelector('#messages').innerHTML = welcome;

function submit() {
  socket.emit('message', document.querySelector('#m').value);
  document.querySelector('#m').value = '';
  return false;
}

document.querySelector('#b').onclick = submit;

socket.on('message', (msg) => {
  if (document.querySelector('#messages').innerHTML === welcome) document.querySelector('#messages').innerHTML = '';
  document.querySelector('#messages').innerHTML += `<li>${msg}</li>`;
});
