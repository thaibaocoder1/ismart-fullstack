import Toastify from 'toastify-js'
import 'toastify-js/src/toastify.css'
export const toast = {
  success(message) {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: 'linear-gradient(to right, #00b09b, #96c93d)',
        fontSize: '18px',
      },
    }).showToast()
  },
  info(message) {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#03a9f4',
        fontSize: '18px',
      },
    }).showToast()
  },
  error(message) {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      style: {
        background: '#d32f2f',
        fontSize: '18px',
      },
    }).showToast()
  },
}
