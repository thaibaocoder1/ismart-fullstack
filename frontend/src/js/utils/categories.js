import categoryApi from '../api/categoryApi'
export async function renderListCategory(selector) {
  const ulElement = document.querySelector(selector)
  if (!ulElement) return
  ulElement.textContent = ''
  const catalogs = await categoryApi.getAll()
  const { catalogs: results } = catalogs
  if (Array.isArray(results) && results.length > 0) {
    results.forEach((item) => {
      const liElement = document.createElement('li')
      liElement.innerHTML = `<a href="/products.html?slug=${item.slug}" title="${item.title}">${item.title}</a>`
      ulElement.appendChild(liElement)
    })
  }
}
