import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    if (user.success) {
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
    }
  } catch (error) {
    toast.error('Đăng nhập thất bại')
  }
}
// main
;(() => {
  // check if exists access_token
  let infoUser = localStorage.getItem('user_info')
  if (infoUser !== null) {
    infoUser = JSON.parse(localStorage.getItem('user_info'))
    if (infoUser.length !== 0) {
      const isHasRoleAdmin = infoUser.findIndex((user) => user?.roleID === 2)
      if (isHasRoleAdmin < 0) window.location.assign('/index.html')
    }
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
