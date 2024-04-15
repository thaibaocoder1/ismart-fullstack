import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'
import Validator from './utils/validator'

async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    console.log(user)
    if (user && user.success) {
      toast.success('Đăng nhập thành công')
      if (user.data.role === 'User') {
        localStorage.setItem('accessToken', JSON.stringify(user.data))
        // setTimeout(() => {
        //   window.location.assign('/index.html')
        // }, 500)
      } else {
        localStorage.setItem('accessTokenAdmin', JSON.stringify(user.data))
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
async function handleOnSubmitFormAdmin(data) {
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
  // check if exists access_token
  if (window.location.pathname === '/login.html') {
    // let accessToken = localStorage.getItem('accessToken')
    // let accessTokenAdmin = localStorage.getItem('accessTokenAdmin')
    // if (accessToken !== null && accessToken !== null) {
    //   window.location.assign('/index.html')
    // } else {
    //   if (accessToken !== null) {
    //     window.location.assign('/index.html')
    //   } else if (accessTokenAdmin !== null) {
    //     window.location.assign('/admin/index.html')
    //   }
    // }
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
  } else {
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
      onSubmit: handleOnSubmitFormAdmin,
    })
  }
})()
