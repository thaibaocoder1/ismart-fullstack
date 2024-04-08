import orderApi from '../../../src/js/api/orderApi'
import orderDetailApi from '../../../src/js/api/orderDetailApi'
import productApi from '../../../src/js/api/productsApi'
import {
  showSpinner,
  hideSpinner,
  initSearchInput,
  formatCurrencyNumber,
  toast,
} from '../../../src/js/utils'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

async function renderStatusOrder(status) {
  switch (status) {
    case 1:
      return 'Chờ xác nhận'
    case 2:
      return 'Đã xác nhận + vận chuyển'
    case 3:
      return 'Đã nhận hàng'
    case 4:
      return 'Đã huỷ'
    case 5:
      return 'Từ chối nhận hàng'
    default:
      return ''
  }
}
function checkStatusOrder(status) {
  switch (status) {
    case (1, 2, 3):
      return true
    case 4:
      return false
    default:
      return false
  }
}
async function renderListOrder({ idElement }) {
  const table = document.getElementById(idElement)
  if (!table) return
  const tbodyEl = table.getElementsByTagName('tbody')[0]
  if (!tbodyEl) return
  try {
    showSpinner()
    const res = await orderApi.getAll()
    hideSpinner()
    if (res.success) {
      const { orders } = res
      if (Array.isArray(orders) && orders.length > 0) {
        orders.forEach((item, index) => {
          const tableRow = document.createElement('tr')
          tableRow.innerHTML = `
          <td><span class="tbody-text">${index + 1}</span></td>
          <td><span class="tbody-text">${item._id}</span></td>
          <td><span class="tbody-text">${item.fullname}</span></td>
          <td><span class="tbody-text">${item.email}</span></td>
          <td><span class="tbody-text">0${item.phone}</span></td>
          <td><span class="tbody-text">${dayjs(item.orderDate).format('DD/MM/YYYY')}</span></td>
          <td><span class="tbody-text">${item.userID}</span></td>
          <td>
            <button class="btn btn-primary btn-sm" id="viewOrder" data-id="${
              item._id
            }" style="background-position: unset;" data-bs-toggle="modal" data-bs-target="#modal">Chi tiết</button>
            <button class="btn btn-info btn-sm" id="editOrder" ${
              +item.status === 4 ? 'hidden' : ''
            } data-id="${
            item._id
          }" style="background-position: unset;" data-bs-toggle="modal" data-bs-target="#modal-edit">Chỉnh sửa</button>
          </td>`
          tbodyEl.appendChild(tableRow)
        })
      } else {
        const tableRow = document.createElement('tr')
        tableRow.setAttribute('colspan', '8')
        tableRow.innerHTML = 'Hiện tại chưa có đơn hàng mới nào!'
        tbodyEl.appendChild(tableRow)
      }
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const res = await orderApi.getAll()
  if (res.success) {
    const { orders } = res
    const orderApply = orders.filter((order) =>
      diacritics.remove(order?.fullname.toLowerCase()).includes(value.toLowerCase()),
    )
    tbodyEl.innerHTML = ''
    if (Array.isArray(orderApply) && orderApply.length > 0) {
      orderApply.forEach((item, index) => {
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
        <td><span class="tbody-text">${index + 1}</span></td>
        <td><span class="tbody-text">${item._id}</span></td>
        <td><span class="tbody-text">${item.fullname}</span></td>
        <td><span class="tbody-text">${item.email}</span></td>
        <td><span class="tbody-text">0${item.phone}</span></td>
        <td><span class="tbody-text">${dayjs(item.orderDate).format('DD/MM/YYYY')}</span></td>
        <td><span class="tbody-text">${item.userID}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" id="viewOrder" data-id="${
            item._id
          }" style="background-position: unset;" data-bs-toggle="modal" data-bs-target="#modal">Chi tiết</button>
          <button class="btn btn-info btn-sm" id="editOrder" ${
            +item.status === 4 ? 'hidden' : ''
          } data-id="${
          item._id
        }" style="background-position: unset;" data-bs-toggle="modal" data-bs-target="#modal-edit">Chỉnh sửa</button>
        </td>`
        tbodyEl.appendChild(tableRow)
      })
    } else {
      const tableRow = document.createElement('tr')
      tableRow.setAttribute('colspan', '8')
      tableRow.innerHTML = 'Hiện tại chưa có đơn hàng mới nào!'
      tbodyEl.appendChild(tableRow)
    }
  }
}

// main
;(() => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listOrderTable',
    onChange: handleFilterChange,
  })
  renderListOrder({
    idElement: 'listOrderTable',
  })
  const modal = document.getElementById('modal')
  const buttonInvoice = modal.querySelector('button.btn-invoice')
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('#viewOrder')) {
      const orderID = target.dataset.id
      modal.dataset.id = orderID
      const modalBody = modal && modal.querySelector('.modal-body')
      if (!orderID || !modalBody) return
      const tableBody = modalBody.querySelector('tbody')
      const totalElement = modalBody.querySelector('#total')
      const infoOrder = modalBody.querySelector('.info-order')
      showSpinner()
      const res = await orderDetailApi.getById(orderID)
      const resOrder = await orderApi.getById(orderID)
      hideSpinner()
      if (res.success && resOrder.success) {
        const { orders } = res
        const { order } = resOrder
        modal.dataset.status = order.status
        infoOrder.innerHTML = `<ul class="grid-layout">
        <li>Họ và tên: ${order.fullname}</li>
        <li>Email: ${order.email}</li>
        <li>Số điện thoại: 0${order.phone}</li>
        <li>Ghi chú: ${order.note || 'Không có ghi chú'}</li>
        <li>Phương thức thanh toán: ${order.payment}</li>
        <li>Trạng thái: ${await renderStatusOrder(order.status)}</li>
        <li>Địa chỉ: ${order.address}</li>
        </ul>`
        buttonInvoice.hidden = order.status === 4 ? true : false
        tableBody.textContent = ''
        let total = 0
        orders.forEach((item) => {
          total += item.quantity * item.price
          const tableRow = document.createElement('tr')
          tableRow.innerHTML = `<th scope="col">${item.productID.name}</th>
          <th scope="col"><img src="${item.productID.thumb.fileName}" class="img-fluid" alt="${
            item.productID.name
          }" style="width: 100px; height: 100px; object-fit: cover;"></th>
          <th scope="col">${formatCurrencyNumber(item.price)}</th>
          <th scope="col">${item.quantity}</th>
          <th scope="col">${formatCurrencyNumber(item.price * item.quantity)}</th>
          `
          tableBody.appendChild(tableRow)
          totalElement.innerHTML = `Tổng thanh toán: ${formatCurrencyNumber(total)}`
        })
      }
    } else if (target.matches('#editOrder')) {
      const orderID = target.dataset.id
      const modalEdit = document.getElementById('modal-edit')
      if (!orderID || !modalEdit) return
      const modalBody = modalEdit.querySelector('.modal-body')
      const buttonModalConfirm = modalEdit.querySelector('button.btn-confirm')
      const selectEl = modalBody.querySelector('#select')
      buttonModalConfirm.dataset.id = orderID
      buttonModalConfirm.dataset.status = 1
      showSpinner()
      const resOrder = await orderApi.getById(orderID)
      hideSpinner()
      if (resOrder.success) {
        const { order } = resOrder
        if (order.status === 4 || order.status === 5 || order.status === 3)
          buttonModalConfirm.hidden = true
        let tagArr = [
          'Chờ xác nhận',
          'Đã xác nhận + vận chuyển',
          'Đã nhận hàng',
          'Đã huỷ',
          'Từ chối nhận hàng',
        ]
        selectEl.textContent = ''
        for (let i = 0; i < tagArr.length; ++i) {
          const optionElement = document.createElement('option')
          optionElement.value = (i + 1).toString()
          if (i + 1 === order.status) {
            optionElement.selected = true
          }
          if (order.status !== 1 && i === 0) {
            optionElement.disabled = true
          }
          if (order.status === 2) {
            if (i !== 1 && i !== 4 && i !== 2) {
              optionElement.disabled = true
            }
          }
          if (order.status === 3) {
            if (i !== 2) {
              optionElement.disabled = true
            }
          }
          if (order.status === 4) {
            if (i !== 3) {
              optionElement.disabled = true
            }
          }
          if (order.status === 5) {
            if (i !== 4) {
              optionElement.disabled = true
            }
          }
          optionElement.text = `${tagArr[i]}`
          selectEl.add(optionElement)
        }
      }
      selectEl.addEventListener('change', (e) => {
        modalEdit.dataset.status = Number(e.target.value)
      })
    } else if (target.matches('.btn-confirm')) {
      const orderID = target.dataset.id
      const modalEdit = document.getElementById('modal-edit')
      const status = Number.parseInt(modalEdit.dataset.status)
      if (status === 5 || status === 4) {
        const res = await orderDetailApi.getById(orderID)
        if (res.success) {
          const { orders } = res
          orders.forEach(async (item) => {
            const refundQuantity = {
              id: item.productID._id,
              quantity: item.productID.quantity + item.quantity,
            }
            const payload = {
              id: orderID,
              status: Number.parseInt(modalEdit.dataset.status) || 1,
              cancelCount: status === 5 ? 1 : 0,
            }
            const promise1 = orderApi.update(payload)
            const promise2 = productApi.update(refundQuantity)
            const [updateOrder, updateProduct] = await Promise.all([promise1, promise2])
            if (updateOrder.success && updateProduct.success) {
              toast.success('Cập nhật thành công')
            } else {
              toast.error('Có lỗi trong khi cập nhật')
            }
          })
        }
      } else {
        const payload = {
          id: orderID,
          status: Number.parseInt(modalEdit.dataset.status) || 1,
        }
        const update = await orderApi.update(payload)
        if (update.success) {
          toast.success('Cập nhật thành công')
        } else {
          toast.error('Có lỗi trong khi cập nhật')
        }
      }
    } else if (target.matches('.btn-invoice')) {
      const orderID = modal.dataset.id
      const statusOrder = Number(modal.dataset.status)
      const isSend = checkStatusOrder(statusOrder)
      if (isSend) {
        showSpinner()
        const res = await orderApi.invoice(orderID)
        hideSpinner()
        if (res.success) {
          const { data } = res
          toast.success(data.message)
        } else {
          toast.error('Có lỗi trong khi xử lý!')
          return
        }
      } else {
        toast.error('Đơn hàng đã huỷ!!!')
        target.disabled = true
      }
    }
  })
})()
