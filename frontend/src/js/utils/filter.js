import debounce from 'lodash.debounce'

export function initSearchInput({ idElement, idTable, onChange }) {
  const searchInput = document.getElementById(idElement)
  const table = document.getElementById(idTable)
  if (!searchInput || !table) return
  const tbodyEl = table.getElementsByTagName('tbody')[0]
  const debounceSearch = debounce(
    async (event) => await onChange?.(event.target.value, tbodyEl),
    500,
  )
  searchInput.addEventListener('input', debounceSearch)
}
