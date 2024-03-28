import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const check = await userApi.forgot(data)
    hideSpinner()
    if (check.success) {
      toast.success(check.message)
      return
    }
  } catch (error) {
    toast.error('Email không tồn tại!')
  }
}
// main
;(() => {
  // check if exists access_token
  let accessToken = localStorage.getItem('accessToken')
  if (accessToken !== null) {
    window.location.assign('login.html')
  }
  Validator({
    formID: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [Validator.isRequired('#email'), Validator.isEmail('#email')],
    onSubmit: handleOnSubmitForm,
  })
})()
