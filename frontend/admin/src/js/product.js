import productApi from '../../../src/js/api/productsApi'
import {
  calcPrice,
  checkStatus,
  formatCurrencyNumber,
  hideSpinner,
  initSearchInput,
  showSpinner,
} from '../../../src/js/utils'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

async function renderListProductAdmin({ idElement }) {
  const table = document.getElementById(idElement)
  if (!table) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  try {
    showSpinner()
    const data = await productApi.getAll()
    hideSpinner()
    const { products } = data
    products?.forEach((item, index) => {
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.code}</span></td>
      <td>
        <div class="tbody-thumb">
          <img src="/images/${item.thumb.fileName}" alt="${item.name}" style="width: 100%;
          height: 100%; object-fit: contain;" />
        </div>
      </td>
      <td>
        <div class="tb-title fl-left">
          <a href="/product-detail.html?id=${item._id}" title="${item.name}">${item.name}</a>
        </div>
      </td>
      <td><span class="tbody-text">${formatCurrencyNumber(calcPrice(item))}</span></td>
      <td><span class="tbody-text">${item.quantity}</span></td>
      <td><span class="tbody-text">${checkStatus(item)}</span></td>
      <td><span class="tbody-text">Admin</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span></td>
      <td>
        <button class="btn btn-primary" id="editProduct" data-id="${
          item._id
        }" style="color: #fff; background-position: unset;">Chỉnh sửa</button>
      </td>`
      tbody.appendChild(tableRow)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const data = await productApi.getAll()
  const { products } = data
  const productApply = products.filter((product) =>
    diacritics.remove(product?.name.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  productApply?.forEach((item, index) => {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
    <td><span class="tbody-text">${index + 1}</span></td>
    <td><span class="tbody-text">${item.code}</span></td>
    <td>
      <div class="tbody-thumb">
        <img src="/images/${item.thumb.fileName}" alt="${item.name}" style="width: 100%;
        height: 100%; object-fit: contain;" />
      </div>
    </td>
    <td>
      <div class="tb-title fl-left">
        <a href="/product-detail.html?id=${item._id}" title="${item.name}">${item.name}</a>
      </div>
    </td>
    <td><span class="tbody-text">${formatCurrencyNumber(calcPrice(item))}</span></td>
    <td><span class="tbody-text">${item.quantity}</span></td>
    <td><span class="tbody-text">${checkStatus(item)}</span></td>
    <td><span class="tbody-text">Admin</span></td>
    <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span></td>
    <td>
      <button class="btn btn-primary" id="editProduct" onclick='window.location.assign("/admin/edit-product.html?id=${
        item._id
      }")' data-id="${item._id}" style="color: #fff; background-position: unset;">Chỉnh sửa</button>
    </td>`
    tbodyEl.appendChild(tableRow)
  })
}
// main
;(() => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listProductTable',
    onChange: handleFilterChange,
  })
  renderListProductAdmin({
    idElement: 'listProductTable',
  })
  window.addEventListener('load', function () {
    const buttonProducts = document.querySelectorAll('button#editProduct')
    if (buttonProducts) {
      buttonProducts.forEach((button) => {
        button.addEventListener('click', function () {
          const productID = button.dataset.id
          window.location.assign(`/admin/edit-product.html?id=${productID}`)
        })
      })
    }
  })
})()
