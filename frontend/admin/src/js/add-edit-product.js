import categoryApi from '../../../src/js/api/categoryApi'
import productApi from '../../../src/js/api/productsApi'
import { hideSpinner, showSpinner, toast } from '../../../src/js/utils'
import { initFormProduct } from '../../../src/js/utils/add-edit-product'

function removeUnsedFields(formValues) {
  const payload = { ...formValues }
  payload['thumb'] = ''
  if (payload.image?.name) {
    payload.thumb = payload.image.name
  } else {
    payload.thumb = payload.imageUrl
  }
  delete payload.image
  delete payload.imageUrl
  return payload
}

async function handleSubmitForm(form, formValues) {
  const formData = new FormData(form)
  const payload = removeUnsedFields(formValues)
  const imageNameUpload = formData.get('image')?.name
  try {
    ;['timer'].forEach((name) => (payload[name] = new Date().getTime()))
    let saveProduct = null
    if (formValues.id) {
      saveProduct = payload.id
      await productApi.update(payload)
      if (imageNameUpload) {
        const response = await fetch('http://localhost:3005/upload', {
          method: 'POST',
          body: formData,
        })
        if (response.ok) {
          const result = await response.json()
          toast.success(result.message)
        } else {
          console.error('Upload failed')
        }
      }
    } else {
      await productApi.add(payload)
      const response = await fetch('http://localhost:3005/upload', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        const result = await response.json()
        toast.success(result.message)
      } else {
        console.error('Upload failed')
      }
    }
    saveProduct !== null
      ? toast.success('Chỉnh sửa thành công')
      : toast.success('Thêm mới thành công')
    setTimeout(() => {
      window.location.reload()
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
    const categories = await categoryApi.getAll()
    categories.forEach((item) => {
      const option = document.createElement('option')
      option.value = item.id
      if (Number.parseInt(option.value) === +defaultValues?.category_id) {
        option.selected = 'selected'
      }
      option.innerHTML = `${item.id} - ${item.title}`
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
  const idProduct = +searchParams.get('id')
  showSpinner()
  const defaultValues = Boolean(idProduct)
    ? await productApi.getById(idProduct)
    : {
        name: '',
        category_id: '',
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
  registerListCategory({
    idSelect: 'category',
    defaultValues,
  })
  registerStatusProduct({
    idSelect: 'status',
    defaultValues,
  })
  initFormProduct({
    idForm: 'formProduct',
    defaultValues,
    onSubmit: handleSubmitForm,
  })
})()
