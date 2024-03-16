import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
export const sweetAlert = {
  success(message) {
    Swal.fire({
      title: message,
      text: 'Đặt sản phẩm thành công',
      icon: 'success',
    })
  },
  error(message) {
    Swal.fire({
      title: message,
      text: 'Điều này sẽ xoá toàn bộ giỏ hàng!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Your file has been deleted.',
          icon: 'success',
        })
      }
    })
  },
}
