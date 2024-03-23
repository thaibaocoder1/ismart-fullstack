import userApi from '../../../src/js/api/userApi'
import { hideSpinner, registerShowHidePassword, showSpinner, toast } from '../../../src/js/utils'
import { initFormPassword } from '../../../src/js/utils'

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
  const infoUserStorage = JSON.parse(localStorage.getItem('accessTokenAdmin'))
  showSpinner()
  const res = await userApi.getById(infoUserStorage.id)
  hideSpinner()
  if (res.success) {
    const { user: defaultValues } = res
    initFormPassword({
      idForm: 'formChangePassword',
      defaultValues,
      onSubmit: handleOnSubmitForm,
    })
    registerShowHidePassword({
      selector: '.icons-toggle',
    })
  }
})()
