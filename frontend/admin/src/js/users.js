import userApi from '../../../src/js/api/userApi'
import diacritics from 'diacritics'
import { hideSpinner, initSearchInput, showSpinner } from '../../../src/js/utils'

async function renderListUser({ idTable, idBreadcrumb }) {
  const table = document.getElementById(idTable)
  const breadcrumbUserEl = document.getElementById(idBreadcrumb)
  if (!table || !breadcrumbUserEl) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  tbody.textContent = ''
  try {
    showSpinner()
    const users = await userApi.getAll()
    hideSpinner()
    users?.forEach((item, index) => {
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.id}</span></td>
      <td><span class="tbody-text">${item.fullname}</span></td>
      <td><span class="tbody-text">${item.username}</span></td>
      <td><span class="tbody-text">${item.phone}</span></td>
      <td><span class="tbody-text">${item.email}</span></td>
      <td><span class="tbody-text">${+item.roleID === 1 ? 'Khách hàng' : 'Admin'}</span></td>
      <td>
        <button class="btn btn-primary" data-id="${item.id}" id="editUser">Chỉnh sửa</button>
      </td>`
      tbody.appendChild(tableRow)
    })
    breadcrumbUserEl.innerHTML = `<li class="all">
    <a id="breadcrumbCategory" href="">Tất cả <span class="count">(${users.length})</span></a>
  </li>`
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const users = await userApi.getAll()
  const userApply = users.filter((user) =>
    diacritics.remove(user?.fullname.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  userApply?.forEach((item, index) => {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.id}</span></td>
      <td><span class="tbody-text">${item.fullname}</span></td>
      <td><span class="tbody-text">${item.username}</span></td>
      <td><span class="tbody-text">${item.phone}</span></td>
      <td><span class="tbody-text">${item.email}</span></td>
      <td><span class="tbody-text">${+item.roleID === 1 ? 'Khách hàng' : 'Admin'}</span></td>
      <td>
        <button class="btn btn-primary" data-id="${item.id}" id="editUser">Chỉnh sửa</button>
      </td>`
    tbodyEl.appendChild(tableRow)
  })
}
// main
;(() => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listUserTable',
    onChange: handleFilterChange,
  })
  renderListUser({
    idTable: 'listUserTable',
    idBreadcrumb: 'breadcrumbUser',
  })
  document.addEventListener('click', function (e) {
    const { target } = e
    if (target.matches('#editUser')) {
      const userID = +target.dataset.id
      window.location.assign(`/admin/add-edit-user.html?id=${userID}`)
    }
  })
})()
