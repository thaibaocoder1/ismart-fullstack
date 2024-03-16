import userApi from '../api/userApi'
import { hideSpinner, registerShowHidePassword, showSpinner, toast } from '../utils'
import { initFormPassword } from '../utils'

async function handleOnSubmitForm(formValues) {
  try {
    const populateValues = {
      id: formValues.id,
      password: formValues.password,
      password_confirmation: formValues.retypePassword,
    }
    showSpinner()
    const dataUpdate = await userApi.update(populateValues)
    hideSpinner()
    if (dataUpdate) toast.success('Đổi mật khẩu thành công')
    setTimeout(() => {
      window.location.assign('/admin/account.html')
    }, 1000)
  } catch (error) {
    toast.error('Có lỗi trong khi xử lý')
  }
}

// main
;(async () => {
  const infoUserStorage = JSON.parse(localStorage.getItem('user_info'))
  const infoAdmin = infoUserStorage.find((user) => user?.roleID === 2)
  showSpinner()
  const defaultValues = await userApi.getById(infoAdmin.user_id)
  hideSpinner()
  initFormPassword({
    idForm: 'formChangePassword',
    defaultValues,
    onSubmit: handleOnSubmitForm,
  })
  registerShowHidePassword({
    selector: '.icons-toggle',
  })
})()
