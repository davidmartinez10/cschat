/* eslint no-undef: off */
function query(b) {
  return b.split('?')[1].split('=')[1];
}
const socket = io(`?id=${query(window.location.href)}`);

function submit() {
  socket.emit('adminmsg', document.querySelector('#m').value);
  document.querySelector('#m').value = '';
  return false;
}

document.querySelector('#b').onclick = submit;

socket.on('message', (msg) => {
  document.querySelector('#messages').innerHTML += `<li>${msg}</li>`;
});
