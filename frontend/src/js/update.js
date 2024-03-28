import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'

async function handleOnSubmitForm(data) {
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')
  data.id = id
  try {
    showSpinner()
    const update = await userApi.reset(data)
    hideSpinner()
    if (update.success) {
      toast.success(update.message)
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 1000)
    } else {
      toast.error(update.message)
      return
    }
  } catch (error) {
    const { response } = error
    if (!response.data.success) {
      toast.error(response.data.message)
      setTimeout(() => {
        window.location.assign('/forgot.html')
      }, 1000)
    }
  }
}
// main
;(() => {
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')
  if (!id) {
    window.location.assign('/login')
  } else {
    // check if exists access_token
    let accessToken = localStorage.getItem('accessToken')
    if (accessToken !== null) {
      window.location.assign('login.html')
    }
  }
  Validator({
    formID: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
      Validator.isRequired('#password'),
      Validator.minLength('#password', 6),
      Validator.isRequired('#password_confirmation'),
      Validator.isConfirmed(
        '#password_confirmation',
        function () {
          return document.querySelector('#form-1 #password').value
        },
        'Mật khẩu nhập lại không khớp',
      ),
    ],
    onSubmit: handleOnSubmitForm,
  })
})()
