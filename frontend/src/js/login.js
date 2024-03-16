import userApi from './api/userApi'
import { hideSpinner, showSpinner, toast } from './utils'
async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const users = await userApi.getAll()
    hideSpinner()
    const infoUser = []
    let isChecked = false
    for (const user of users) {
      if (isChecked) break
      if (user.email === data.email && user.password === data.password) {
        isChecked = true
        toast.success('Đăng nhập thành công')
        if (+user.roleID === 1) {
          infoUser.push({
            access_token: `Bearer ${new Date().getTime()}`,
            user_id: user.id,
            roleID: 1,
          })
          setTimeout(() => {
            window.location.assign('/index.html')
          }, 2000)
        } else {
          infoUser.push({
            access_token: `Bearer ${new Date().getTime()}`,
            user_id: user.id,
            roleID: 2,
          })
          setTimeout(() => {
            window.location.assign('/admin/index.html')
          }, 2000)
        }
        localStorage.setItem('user_info', JSON.stringify(infoUser))
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
