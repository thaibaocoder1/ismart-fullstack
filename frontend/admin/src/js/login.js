import userApi from '../../../src/js/api/userApi'
import { hideSpinner, showSpinner, toast } from '../../../src/js/utils'
async function handleOnSubmitForm(data) {
  try {
    showSpinner()
    const users = await userApi.getAll()
    hideSpinner()
    const infoUser = JSON.parse(localStorage.getItem('user_info')) || []
    let isChecked = false
    for (const user of users) {
      if (isChecked) break
      if (user.email === data.email && user.password === data.password) {
        isChecked = true
        toast.success('Đăng nhập thành công')
        if (infoUser.length === 0) {
          infoUser.push({
            access_token: `Bearer ${new Date().getTime()}`,
            user_id: user.id,
            roleID: 2,
          })
        } else {
          const newObject = {
            access_token: `Bearer ${new Date().getTime()}`,
            user_id: user.id,
            roleID: 2,
          }
          infoUser.push(newObject)
        }
        localStorage.setItem('user_info', JSON.stringify(infoUser))
        setTimeout(() => {
          window.location.assign('/admin/index.html')
        }, 2000)
      }
    }
  } catch (error) {
    toast.error('Đăng nhập thất bại')
  }
}
// main
;(() => {
  // check if exists access_token
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
