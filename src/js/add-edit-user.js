import userApi from './api/userApi'
import { toast } from './utils'
import { renderInfoUser } from './utils/add-edit-user'

function jsonToFormData(formValues) {
  const values = { ...formValues }
  const formData = new FormData()
  for (const key in values) {
    formData.append(key, values[key])
  }
  return formData
}
async function handleOnSubmitForm(formValues) {
  const formData = jsonToFormData(formValues)
  formData.append('admin', true)
  try {
    const savedUser =
      formData.get('id') && formData.get('id') !== 'undefined'
        ? await userApi.updateFormData(formData)
        : await userApi.addFormData(formData)
    if (savedUser) toast.success('Thao tác thành công')
    setTimeout(() => {
      window.location.assign('/admin/users.html')
    }, 1000)
  } catch (error) {
    const { data } = error.response
    if (!data.success) {
      toast.error(data.message)
    }
  }
}
// main
;(async () => {
  const searchParams = new URLSearchParams(location.search)
  const userID = searchParams.get('id')
  const defaultValues = Boolean(userID)
    ? await userApi.getById(userID)
    : {
        fullname: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: '',
        imageUrl: 'https://placehold.co/200x200',
      }
  let values = {}
  if (defaultValues.success) {
    values = defaultValues.user
  } else {
    values = defaultValues
  }
  renderInfoUser({
    idForm: 'formAccount',
    defaultValues: values,
    onSubmit: handleOnSubmitForm,
  })
})()
