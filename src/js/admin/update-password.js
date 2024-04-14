import userApi from '../../../src/js/api/userApi'
import { hideSpinner, registerShowHidePassword, showSpinner, toast } from '../../../src/js/utils'
import { initFormPassword } from '../../../src/js/utils'

async function handleOnSubmitForm(formValues) {
  try {
    const populateValues = {
      id: formValues.id,
      oldPassword: formValues.oldPassword,
      password: formValues.password,
      password_confirmation: formValues.retypePassword,
    }
    const dataUpdate = await userApi.updateFields(populateValues)
    if (dataUpdate.success) {
      toast.success('Đổi mật khẩu thành công')
      setTimeout(() => {
        window.location.assign('/admin/account.html')
      }, 500)
    } else {
      toast.error(dataUpdate.message)
    }
  } catch (error) {
    const { data } = error.response
    if (!data.success) {
      toast.error(data.message)
    }
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
