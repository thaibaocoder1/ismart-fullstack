import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'
import Validator from './utils/validator'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    if (user && user.success) {
      const { data } = user
      if (data.role.toLowerCase() === 'user') {
        toast.error('Không có quyền truy cập')
        return
      }
      toast.success('Đăng nhập thành công')
      localStorage.setItem('accessTokenAdmin', JSON.stringify(user.data))
      setTimeout(() => {
        window.location.assign('index.html')
      }, 500)
    } else {
      toast.error(user.message)
      return
    }
  } catch (error) {
    toast.error('Tài khoản không tồn tại!')
    return
  }
}
// main
;(() => {
  new Validator({
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
