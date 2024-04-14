import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'
import Validator from './utils/validator'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const recovery = await userApi.recovery(data)
    hideSpinner()
    if (recovery.success) {
      toast.success(recovery.message)
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 500)
      return
    }
  } catch (error) {
    const { data } = error.response
    if (!data.success) {
      toast.error(data.message)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }
}
// main
;(() => {
  // check if exists access_token
  let accessToken = localStorage.getItem('accessToken')
  if (accessToken !== null) {
    window.location.assign('login.html')
  }
  new Validator({
    formID: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [Validator.isRequired('#email'), Validator.isEmail('#email')],
    onSubmit: handleOnSubmitForm,
  })
})()
