import categoryApi from '../api/categoryApi'
import { hideSpinner, initSearchInput, showSpinner } from '../utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import diacritics from 'diacritics'

async function renderListProductAdmin({ idElement, idBreadcrumb }) {
  const table = document.getElementById(idElement)
  const breadcrumb = document.getElementById(idBreadcrumb)
  if (!table || !breadcrumb) return
  const tbody = table.getElementsByTagName('tbody')[0]
  if (!tbody) return
  try {
    showSpinner()
    const categories = await categoryApi.getAll()
    hideSpinner()
    categories?.forEach((item, index) => {
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.id}</span></td>
      <td><span class="tbody-text">${item.title}</span></td>
      <td><span class="tbody-text">${dayjs(item.timer).fromNow()}</span></td>
      <td>
        <button class="btn btn-primary" data-id="${item.id}" id="editCategory">Chỉnh sửa</button>
      </td>`
      tbody.appendChild(tableRow)
    })
    breadcrumb.innerHTML = `Tất cả <span class="count">(${categories.length})</span>`
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const categories = await categoryApi.getAll()
  const categoryApply = categories.filter((category) =>
    diacritics.remove(category?.title.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  categoryApply?.forEach((item, index) => {
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
    <td><span class="tbody-text">${index + 1}</span></td>
    <td><span class="tbody-text">${item.id}</span></td>
    <td><span class="tbody-text">${item.title}</span></td>
    <td><span class="tbody-text">${dayjs(item.timer).fromNow()}</span></td>
    <td>
      <button class="btn btn-primary" data-id="${item.id}" id="editCategory">Chỉnh sửa</button>
    </td>`
    tbodyEl.appendChild(tableRow)
  })
}

// main
;(() => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listCategoryTable',
    onChange: handleFilterChange,
  })
  renderListProductAdmin({
    idElement: 'listCategoryTable',
    idBreadcrumb: 'breadcrumbCategory',
  })
  window.addEventListener('load', function () {
    const listCategory = document.getElementById('listCategoryTable')
    if (!listCategory) return
    const tbodyElement = listCategory.getElementsByTagName('tbody')[0]
    if (!tbodyElement) return
    const editButtons = tbodyElement.querySelectorAll('button#editCategory')
    if (editButtons) {
      ;[...editButtons].forEach((button) => {
        button.addEventListener('click', function () {
          const idCategory = +button.dataset.id
          window.location.assign(`/admin/edit-category.html?id=${idCategory}`)
        })
      })
    }
  })
})()
