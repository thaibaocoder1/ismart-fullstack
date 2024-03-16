import { showSpinner, hideSpinner, toast, initSearchInput } from '../../../src/js/utils'
import commentApi from '../../../src/js/api/commentApi'
import productApi from '../../../src/js/api/productsApi'
import dayjs from 'dayjs'
import diacritics from 'diacritics'

async function renderListComment({ idElement }) {
  const table = document.getElementById(idElement)
  if (!table) return
  const tbodyEl = table.getElementsByTagName('tbody')[0]
  if (!tbodyEl) return
  tbodyEl.textContent = ''
  try {
    showSpinner()
    const comments = await commentApi.getAll()
    hideSpinner()
    comments?.forEach(async (item, index) => {
      const product = await productApi.getById(item.productID)
      const tableRow = document.createElement('tr')
      tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item.id}</span></td>
      <td><span class="tbody-text">${item.text}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format(
        'DD/MM/YYYY HH:mm:ss',
      )}</span></td>
      <td><span class="tbody-text">${product.name}</span></td>
      <td><span class="tbody-text">${item.userID}</span></td>
      <td>
        <button class="btn btn-primary btn--style" id="editBtn" data-id="${
          item.id
        }">Chỉnh sửa</button>
        <button class="btn btn-danger btn--style" id="removeBtn" data-id="${item.id}">Xoá</button>
      </td>`
      tbodyEl.appendChild(tableRow)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const comments = await commentApi.getAll()
  const commentApply = comments.filter((comment) =>
    diacritics.remove(comment?.text.toLowerCase()).includes(value.toLowerCase()),
  )
  tbodyEl.innerHTML = ''
  commentApply?.forEach(async (item, index) => {
    const product = await productApi.getById(item.productID)
    const tableRow = document.createElement('tr')
    tableRow.innerHTML = `<td><input type="checkbox" name="checkItem" class="checkItem" /></td>
    <td><span class="tbody-text">${index + 1}</span></td>
    <td><span class="tbody-text">${item.id}</span></td>
    <td><span class="tbody-text">${item.text}</span></td>
    <td><span class="tbody-text">${dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span></td>
    <td><span class="tbody-text">${product.name}</span></td>
    <td><span class="tbody-text">${item.userID}</span></td>
    <td>
      <button class="btn btn-primary btn--style" id="editBtn" data-id="${
        item.id
      }">Chỉnh sửa</button>
      <button class="btn btn-danger btn--style" id="removeBtn" data-id="${item.id}">Xoá</button>
    </td>`
    tbodyEl.appendChild(tableRow)
  })
}
// main
;(() => {
  initSearchInput({
    idElement: 'searchInput',
    idTable: 'listComment',
    onChange: handleFilterChange,
  })
  renderListComment({
    idElement: 'listComment',
  })
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches('#editBtn')) {
      const commentID = +target.dataset.id
      window.location.assign(`/admin/edit-comment.html?id=${commentID}`)
    } else if (target.matches('#removeBtn')) {
      const commentID = +target.dataset.id
      if (commentID) {
        await commentApi.delete(commentID)
        target.parentElement.parentElement.remove()
        toast.info('Xoá thành công bình luận')
        setTimeout(() => {
          window.location.assign('/admin/comment.html')
        }, 500)
      }
    }
  })
})()
