import userApi from './api/userApi'
import diacritics from 'diacritics'
import { hideSpinner, initSearchInput, showSpinner, toast } from './utils'

async function renderListUser({ idTable, idBreadcrumb }) {
  const table = document.getElementById(idTable)
  const breadcrumbUserEl = document.getElementById(idBreadcrumb)
  if (!table || !breadcrumbUserEl) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  tbody.textContent = ''
  try {
    showSpinner()
    const res = await userApi.getAll()
    hideSpinner()
    if (res.success) {
      const { users } = res
      const { countDeleted } = res
      users?.forEach((item, index) => {
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
        <td><span class="tbody-text">${index + 1}</span></td>
        <td><span class="tbody-text">${item._id}</span></td>
        <td><span class="tbody-text">${item.fullname}</span></td>
        <td><span class="tbody-text">${item.username}</span></td>
        <td><span class="tbody-text">${item.phone}</span></td>
        <td><span class="tbody-text">${item.email}</span></td>
        <td><span class="tbody-text">${item.role}</span></td>
        <td>
          <button class="btn btn-primary btn-lg" data-id="${
            item._id
          }" id="editUser" style="background-position: unset;">Chỉnh sửa</button>
          <button class="btn btn-secondary btn-lg" data-id="${
            item._id
          }" id="removeUser" data-bs-toggle="modal"
          data-bs-target="#removeModal" style="background-position: unset;">Xoá</button>
        </td>`
        tbody.appendChild(tableRow)
      })
      breadcrumbUserEl.innerHTML = `<li class="all">
      <a id="breadcrumbCategory" href="">Tất cả <span class="count">(${users.length})</span></a>
     </li>
     <li class="all">
      <a id="breadcrumbCategory" href="/admin/users-trash.html">Thùng rác <span class="count">(${countDeleted})</span></a>
     </li>`
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const res = await userApi.getAll()
  if (res.success) {
    const { users } = res
    const userApply = users.filter((user) =>
      diacritics.remove(user?.fullname.toLowerCase()).includes(value.toLowerCase()),
    )
    tbodyEl.innerHTML = ''
    userApply?.forEach((item, index) => {
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item._id}</span></td>
      <td><span class="tbody-text">${item.fullname}</span></td>
      <td><span class="tbody-text">${item.username}</span></td>
      <td><span class="tbody-text">${item.phone}</span></td>
      <td><span class="tbody-text">${item.email}</span></td>
      <td><span class="tbody-text">${item.role}</span></td>
      <td>
        <button class="btn btn-primary btn-lg" data-id="${
          item._id
        }" id="editUser" style="background-position: unset;">Chỉnh sửa</button>
        <button class="btn btn-secondary btn-lg" data-id="${
          item._id
        }" id="removeUser" data-bs-toggle="modal"
        data-bs-target="#removeModal" style="background-position: unset;">Xoá</button>
      </td>`
      tbodyEl.appendChild(tableRow)
    })
  }
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
  const modal = document.getElementById('removeModal')
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('#editUser')) {
      const userID = target.dataset.id
      window.location.assign(`/admin/add-edit-user.html?id=${userID}`)
    } else if (target.matches('#removeUser')) {
      const userID = target.dataset.id
      modal.dataset.id = userID
    } else if (target.closest('button.btn-confirm')) {
      const userID = modal.dataset.id
      if (userID) {
        showSpinner()
        const res = await userApi.delete(userID)
        hideSpinner()
        if (res.success) {
          toast.success(res.message)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          toast.error(res.message)
          return
        }
      }
    }
  })
})()
