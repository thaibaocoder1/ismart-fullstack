import userApi from './api/userApi'
import { toast, getRandomImage, showSpinner, hideSpinner } from './utils'
import Validator from './utils/validator'

async function handleOnSubmitForm(data) {
  if (data) {
    data['role'] = 'User'
    data['imageUrl'] = getRandomImage()
  }
  try {
    showSpinner()
    const res = await userApi.getAll()
    hideSpinner()
    const { users } = res
    if (Array.isArray(users) && users.length > 0) {
      users.forEach(async (user) => {
        if (user.email === data.email) {
          toast.error('Duplicate user. Please check again')
        } else {
          showSpinner()
          const infoUser = await userApi.add(data)
          hideSpinner()
          if (infoUser) {
            toast.success('Register successfully, check email for active!')
            setTimeout(() => {
              window.location.assign('/login.html')
            }, 500)
          } else {
            toast.error('Register failed')
          }
        }
      })
    } else {
      showSpinner()
      const infoUser = await userApi.add(data)
      hideSpinner()
      if (infoUser) {
        toast.success('Register successfully, check email for active!')
        setTimeout(() => {
          window.location.assign('/login.html')
        }, 2000)
      } else {
        toast.error('Register failed')
      }
    }
  } catch (error) {
    console.log('error', error)
  }
}
// main
;(() => {
  let accessToken = localStorage.getItem('accessToken')
  let accessTokenAdmin = localStorage.getItem('accessTokenAdmin')
  if (accessToken !== null && accessToken !== null) {
    window.location.assign('/index.html')
  } else {
    if (accessToken !== null) {
      window.location.assign('/index.html')
    } else if (accessTokenAdmin !== null) {
      window.location.assign('/admin/index.html')
    }
  }
  new Validator({
    formID: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
      Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ'),
      Validator.isRequired('#username', 'Vui lòng nhập tên đăng nhập'),
      Validator.isRequired('#email'),
      Validator.isEmail('#email'),
      Validator.isRequired('#phone'),
      Validator.isPhone('#phone'),
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
