import categoryApi from '../api/categoryApi'
import { hideSpinner, showSpinner, toast } from '../utils'
import { initFormCategory } from '../utils'
async function handleSubmitForm(formValues) {
  try {
    ;['timer'].forEach((name) => (formValues[name] = new Date().getTime()))
    let saveCategory = null
    if (formValues.id) {
      saveCategory = formValues.id
      await categoryApi.update(formValues)
    } else {
      await categoryApi.add(formValues)
    }
    saveCategory !== null
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
;(async () => {
  const searchParams = new URLSearchParams(window.location.search)
  const idCategory = +searchParams.get('id')
  showSpinner()
  const defaultValues = Boolean(idCategory)
    ? await categoryApi.getById(idCategory)
    : {
        title: '',
      }
  hideSpinner()
  initFormCategory({
    idForm: 'formEditCategory',
    defaultValues,
    onSubmit: handleSubmitForm,
  })
})()
