import categoryApi from '../../../src/js/api/categoryApi'
import { hideSpinner, initSearchInput, showSpinner } from '../../../src/js/utils'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

async function renderListProductAdmin({ idElement, idBreadcrumb }) {
  const table = document.getElementById(idElement)
  const breadcrumb = document.getElementById(idBreadcrumb)
  if (!table || !breadcrumb) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  try {
    showSpinner()
    const data = await categoryApi.getAll()
    hideSpinner()
    const { catalogs } = data
    catalogs?.forEach((item, index) => {
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item._id}</span></td>
      <td><span class="tbody-text">${item.title}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span></td>
      <td><span class="tbody-text">${dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')}</span></td>
      <td>
        <button class="btn btn-primary btn-lg" data-id="${
          item._id
        }" id="editCategory" style="color: #fff; background-position: unset;">Chỉnh sửa</button>
      </td>`
      tbody.appendChild(tableRow)
    })
    breadcrumb.innerHTML = `Tất cả <span class="count">(${data.results})</span>`
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const data = await categoryApi.getAll()
  const { catalogs } = data
  const categoryApply = catalogs.filter((category) =>
    diacritics.remove(category?.title.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  categoryApply?.forEach((item, index) => {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `
    <td><span class="tbody-text">${index + 1}</span></td>
    <td><span class="tbody-text">${item._id}</span></td>
    <td><span class="tbody-text">${item.title}</span></td>
    <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span></td>
    <td><span class="tbody-text">${dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')}</span></td>
    <td>
      <button class="btn btn-primary btn-lg" onclick='window.location.assign("/admin/edit-category.html?id=${
        item._id
      }")' data-id="${
      item._id
    }" style="color: #fff; background-position: unset;" id="editCategory">Chỉnh sửa</button>
    </td>`
    tbodyEl.appendChild(tableRow)
  })
}

// main
;(async () => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listCategoryTable',
    onChange: handleFilterChange,
  })
  await renderListProductAdmin({
    idElement: 'listCategoryTable',
    idBreadcrumb: 'breadcrumbCategory',
  })
  const listCategory = document.getElementById('listCategoryTable')
  if (!listCategory) return
  const tbodyElement = listCategory.getElementsByTagName('tbody')[0]
  if (!tbodyElement) return
  const editButtons = tbodyElement.querySelectorAll('button#editCategory')
  if (editButtons) {
    ;[...editButtons].forEach((button) => {
      button.addEventListener('click', function () {
        const idCategory = button.dataset.id
        window.location.assign(`/admin/edit-category.html?id=${idCategory}`)
      })
    })
  }
})()
