import userApi from '../../../src/js/api/userApi'
import { toast } from '../../../src/js/utils'
async function handleOnSubmitForm(formValues) {
  try {
    formValues['password_confirmation'] = formValues.password
    const savedUser = Boolean(formValues.id)
      ? await userApi.update(formValues)
      : await userApi.add(formValues)
    if (savedUser) toast.success('Thao tác thành công')
    setTimeout(() => {
      window.location.assign('/admin/users.html')
    }, 1000)
  } catch (error) {
    toast.error('Có lỗi trong khi xử lý')
  }
}
// main
import { renderInfoUser } from '../../../src/js/utils/add-edit-user'
;(async () => {
  const searchParams = new URLSearchParams(location.search)
  const userID = +searchParams.get('id')
  const defaultValues = Boolean(userID)
    ? await userApi.getById(userID)
    : {
        fullname: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        roleID: '',
        imageUrl: '',
      }
  renderInfoUser({
    idForm: 'formAccount',
    defaultValues,
    onSubmit: handleOnSubmitForm,
  })
})()
