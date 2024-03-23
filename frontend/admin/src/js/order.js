import orderApi from '../../../src/js/api/orderApi'
import { showSpinner, hideSpinner, initSearchInput } from '../../../src/js/utils'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

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
          }" style="background-position: unset;">Chi tiết</button>
          <button class="btn btn-info btn-sm" id="editOrder" ${
            +item.status === 4 ? 'hidden' : ''
          } data-id="${item._id}" style="background-position: unset;">Chỉnh sửa</button>
        </td>`
        tbodyEl.appendChild(tableRow)
      })
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  showSpinner()
  const res = await orderApi.getAll()
  hideSpinner()
  if (res.success) {
    const { orders } = res
    const orderApply = orders.filter((order) =>
      diacritics.remove(order?.fullname.toLowerCase()).includes(value.toLowerCase()),
    )
    tbodyEl.innerHTML = ''
    orderApply?.forEach((item, index) => {
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
        }" style="background-position: unset;">Chi tiết</button>
        <button class="btn btn-info btn-sm" id="editOrder" ${
          +item.status === 4 ? 'hidden' : ''
        } data-id="${item._id}" style="background-position: unset;">Chỉnh sửa</button>
      </td>`
      tbodyEl.appendChild(tableRow)
    })
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
  document.addEventListener('click', function (e) {
    const { target } = e
    if (target.matches('#viewOrder')) {
      const orderID = +target.dataset.id
      window.location.assign(`/admin/detail-order.html?id=${orderID}`)
    } else if (target.matches('#editOrder')) {
      const orderID = +target.dataset.id
      window.location.assign(`/admin/edit-order.html?id=${orderID}`)
    }
  })
})()
