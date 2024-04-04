import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    if (user && user.success) {
      toast.success('Đăng nhập thành công')
      if (user.data.role === 'User') {
        localStorage.setItem('accessToken', JSON.stringify(user.data))
        setTimeout(() => {
          window.location.assign('/index.html')
        }, 500)
      } else {
        localStorage.setItem('accessToken', JSON.stringify(user.data))
        setTimeout(() => {
          window.location.assign('/admin/index.html')
        }, 500)
      }
    } else {
      toast.error(user.message)
      return
    }
  } catch (error) {
    toast.error('Đăng nhập thất bại')
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
    rules: [
      Validator.isRequired('#email'),
      Validator.isEmail('#email'),
      Validator.isRequired('#password'),
      Validator.minLength('#password', 6),
    ],
    onSubmit: handleOnSubmitForm,
  })
})()
