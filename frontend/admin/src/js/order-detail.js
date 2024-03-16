import orderDetailApi from '../../../src/js/api/orderDetailApi'
import orderApi from '../../../src/js/api/orderApi'
import { formatCurrencyNumber, hideSpinner, showSpinner } from '../../../src/js/utils'
import productApi from '../../../src/js/api/productsApi'
function displayStatusOrder(status) {
  if (!status) return
  switch (status) {
    case 1:
      return 'Chờ xác nhận'
    case 2:
      return 'Đã xác nhận + vận chuyển'
    case 3:
      return 'Đã thanh toán'
    default:
      return 'Đã huỷ'
  }
}
async function renderDetailOrder({ idElement, idTable, idResult, orderID }) {
  const ulElement = document.getElementById(idElement)
  const tableElement = document.getElementById(idTable)
  const resultEl = document.getElementById(idResult)
  if (!ulElement || !tableElement || !resultEl) return
  const tbodyEl = tableElement.getElementsByTagName('tbody')[0]
  try {
    showSpinner()
    const orderDetail = await orderApi.getById(orderID)
    const listOrderDetail = await orderDetailApi.getAll()
    const listOrderApply = listOrderDetail.filter((order) => order.orderID === orderID)
    hideSpinner()
    ulElement.innerHTML = `<li>
    <h3 class="title">Mã đơn hàng</h3>
    <span class="detail">${orderDetail.id}</span>
    </li>
    <li>
      <h3 class="title">Địa chỉ nhận hàng</h3>
      <span class="detail"><a href="${orderDetail.address}">${orderDetail.address}</a></span>
    </li>
    <li>
      <h3 class="title">Thông tin vận chuyển</h3>
      <span class="detail">${
        orderDetail.note === '' ? 'Thanh toán tại nhà' : orderDetail.note
      }</span>
    </li>
    <li>
      <h3 class="title">Tình trạng đơn hàng</h3>
      <span class="detail">${displayStatusOrder(+orderDetail.status)}</span>
    </li>`
    let total = 0
    listOrderApply.forEach(async (item, index) => {
      const productInfo = await productApi.getById(item.productID)
      total += item.quantity * item.price
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `
      <td class="thead-text">${index + 1}</td>
      <td class="thead-text">
        <div class="thumb">
          <img src="/public/images/${productInfo.thumb}" alt="${productInfo.name}" />
        </div>
      </td>
      <td class="thead-text">${productInfo.name}</td>
      <td class="thead-text">${formatCurrencyNumber(item.price)}</td>
      <td class="thead-text">${item.quantity}</td>
      <td class="thead-text">${formatCurrencyNumber(item.price * item.quantity)}</td>`
      tbodyEl.appendChild(tableRow)

      resultEl.innerHTML = `<h3 class="section-title">Giá trị đơn hàng</h3>
      <div class="section-detail">
        <ul class="list-item clearfix">
          <li>
            <span class="total-fee">Tổng số lượng</span>
            <span class="total">Tổng đơn hàng</span>
          </li>
          <li>
            <span class="total-fee">${listOrderApply.length} sản phẩm</span>
            <span class="total">${formatCurrencyNumber(total)}</span>
          </li>
        </ul>
      </div>`
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
// main
;(() => {
  const searchParams = new URLSearchParams(location.search)
  const orderID = +searchParams.get('id')
  if (Boolean(orderID)) {
    renderDetailOrder({
      idElement: 'infoOrder',
      idTable: 'orderDetailTable',
      idResult: 'finalResult',
      orderID,
    })
  }
})()
