import userApi from '../../../src/js/api/userApi'
import { hideSpinner, showSpinner, toast } from '../../../src/js/utils'
async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    if (user.success) {
      toast.success('Đăng nhập thành công')
      localStorage.setItem('accessTokenAdmin', JSON.stringify(user.data))
      setTimeout(() => {
        window.location.assign('index.html')
      }, 500)
    }
  } catch (error) {
    toast.error('Tài khoản không tồn tại!')
    return
  }
}
// main
;(() => {
  Validator({
    formID: '#form-admin-login',
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
