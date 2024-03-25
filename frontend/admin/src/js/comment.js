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
    const res = await commentApi.getAll()
    hideSpinner()
    const { comments } = res
    if (Array.isArray(comments) && comments.length > 0) {
      comments?.forEach(async (item, index) => {
        const data = await productApi.getById(item.productID)
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item._id}</span></td>
      <td><span class="tbody-text">${item.text}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format(
        'DD/MM/YYYY HH:mm:ss',
      )}</span></td>
      <td><span class="tbody-text">${data.product.name}</span></td>
      <td><span class="tbody-text">${item.userID}</span></td>
      <td>
        <button class="btn btn-danger btn-sm btn--style" id="removeBtn" data-id="${
          item._id
        }">Xoá</button>
      </td>`
        tbodyEl.appendChild(tableRow)
      })
    } else {
      const tableRow = document.createElement('tr')
      tableRow.setAttribute('colspan', '7')
      tableRow.innerHTML = 'Chưa có bình luận nào!'
      tbodyEl.appendChild(tableRow)
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function handleFilterChange(value, tbodyEl) {
  const res = await commentApi.getAll()
  if (res.success) {
    const { comments } = res
    const commentApply = comments.filter((comment) =>
      diacritics.remove(comment?.text.toLowerCase()).includes(value.toLowerCase()),
    )
    tbodyEl.innerHTML = ''
    if (Array.isArray(comments) && comments.length > 0) {
      comments?.forEach(async (item, index) => {
        const data = await productApi.getById(item.productID)
        const tableRow = document.createElement('tr')
        tableRow.innerHTML = `
      <td><span class="tbody-text">${index + 1}</span></td>
      <td><span class="tbody-text">${item._id}</span></td>
      <td><span class="tbody-text">${item.text}</span></td>
      <td><span class="tbody-text">${dayjs(item.createdAt).format(
        'DD/MM/YYYY HH:mm:ss',
      )}</span></td>
      <td><span class="tbody-text">${data.product.name}</span></td>
      <td><span class="tbody-text">${item.userID}</span></td>
      <td>
        <button class="btn btn-danger btn-sm btn--style" id="removeBtn" data-id="${
          item._id
        }">Xoá</button>
      </td>`
        tbodyEl.appendChild(tableRow)
      })
    } else {
      const tableRow = document.createElement('tr')
      tableRow.setAttribute('colspan', '7')
      tableRow.innerHTML = 'Chưa có bình luận nào!'
      tbodyEl.appendChild(tableRow)
    }
  } else {
    toast.error('Có lỗi trong khi tìm kiếm')
    return
  }
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
  let commentID = null
  document.addEventListener('click', async function (e) {
    const { target } = e
    const modal = document.getElementById('modal')
    if (target.matches('#removeBtn')) {
      commentID = target.dataset.id
      modal && modal.classList.add('show')
    } else if (target.closest('button.btn-confirm')) {
      await commentApi.delete(commentID)
      const item = document.querySelector(`button[data-id='${commentID}']`).parentElement
        .parentElement
      item && item.remove()
      setTimeout(() => {
        modal && modal.classList.remove('show')
      }, 1)
      toast.info('Xoá thành công bình luận')
    } else if (target.matches('.modal')) {
      modal && modal.classList.remove('show')
    } else if (target.matches('.btn-close')) {
      modal && modal.classList.remove('show')
    } else if (target.matches('.btn-denide')) {
      modal && modal.classList.remove('show')
    }
  })
})()
