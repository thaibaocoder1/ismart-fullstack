import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'
function setCookie(cname, cvalue, exdays) {
  const d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  let expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}
async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const user = await userApi.check(data)
    hideSpinner()
    const infoUser = []
    if (user.success) {
      toast.success('Đăng nhập thành công')
      if (user.data.role === 'User') {
        infoUser.push({
          accessToken: user.data.accessToken,
          userID: user.data.userID,
          role: user.data.role,
        })
        setCookie('refreshToken', user.data.refreshToken, 365)
        setTimeout(() => {
          window.location.assign('/index.html')
        }, 2000)
      } else {
        infoUser.push({
          accessToken: user.data.accessToken,
          userID: user.data.userID,
          role: user.data.role,
        })
        setCookie('refreshToken', user.data.refreshToken, 365)
        setTimeout(() => {
          window.location.assign('/admin/index.html')
        }, 2000)
      }
      localStorage.setItem('user_info', JSON.stringify(infoUser))
    }
    return
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
