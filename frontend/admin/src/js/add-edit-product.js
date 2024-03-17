import categoryApi from '../../../src/js/api/categoryApi'
import productApi from '../../../src/js/api/productsApi'
import { hideSpinner, showSpinner, toast } from '../../../src/js/utils'
import { initFormProduct } from '../../../src/js/utils/add-edit-product'
function jsonToFormData(formValues) {
  const formData = new FormData()
  for (const key in formValues) {
    formData.set(key, formValues[key])
  }
  return formData
}

async function handleSubmitForm(formValues) {
  const payload = jsonToFormData(formValues)
  try {
    let saveProduct = null
    if (payload.id) {
      saveProduct = payload.id
      await productApi.updateFormData(payload)
    } else {
      await productApi.addFormData(payload)
    }
    saveProduct !== null
      ? toast.success('Chỉnh sửa thành công')
      : toast.success('Thêm mới thành công')
    setTimeout(() => {
      window.location.reload('product.html')
    }, 500)
  } catch (error) {
    console.log('error', error)
  }
}
// main
async function registerListCategory({ idSelect, defaultValues }) {
  const selectEl = document.getElementById(idSelect)
  if (!selectEl) return
  try {
    const data = await categoryApi.getAll()
    const { catalogs } = data
    catalogs.forEach((item) => {
      const option = document.createElement('option')
      option.value = item._id
      if (option.value === defaultValues?.categoryID._id) {
        option.selected = 'selected'
      }
      option.innerHTML = item.title
      selectEl.appendChild(option)
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
function registerStatusProduct({ idSelect, defaultValues }) {
  const selectEl = document.getElementById(idSelect)
  if (!selectEl) return
  const optionList = selectEl.querySelectorAll('option')
  try {
    ;[...optionList].forEach((option) => {
      if (+option.value === +defaultValues?.status) {
        option.selected = 'selected'
      }
    })
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
;(async () => {
  const searchParams = new URLSearchParams(window.location.search)
  const idProduct = searchParams.get('id')
  showSpinner()
  let defaultValues = Boolean(idProduct)
    ? await productApi.getById(idProduct)
    : {
        categoryID: '',
        name: '',
        description: '',
        code: '',
        price: 0,
        discount: 0,
        thumb: '',
        content: '',
        status: 1,
        quantity: 0,
      }
  hideSpinner()
  let values
  if (defaultValues.success) {
    values = defaultValues.product
  } else {
    values = defaultValues
  }
  registerListCategory({
    idSelect: 'category',
    defaultValues: values,
  })
  registerStatusProduct({
    idSelect: 'status',
    defaultValues: values,
  })
  initFormProduct({
    idForm: 'formProduct',
    defaultValues: values,
    onSubmit: handleSubmitForm,
  })
})()
