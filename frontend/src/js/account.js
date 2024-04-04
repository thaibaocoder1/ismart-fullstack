import userApi from './api/userApi'
import {
  addCartToDom,
  hideSpinner,
  setBackgroundImage,
  setFieldValue,
  showSpinner,
  toast,
  handleUpdateInfoUser,
  initSearchForm,
  sweetAlert,
} from './utils'
function displayTagLink(ulElement) {
  ulElement.textContent = ''
  const infoArr = ['Cập nhật thông tin', 'Quản lý đơn hàng', 'Đăng xuất']
  for (let i = 0; i < infoArr.length; ++i) {
    const liElement = document.createElement('li')
    liElement.innerHTML = `<a href="#" title="${infoArr[i]}">${infoArr[i]}</a>`
    ulElement.appendChild(liElement)
  }
}
async function displayInfoUser(infoUserStorage, divInfoLeftEl, userAvatarEl) {
  try {
    showSpinner()
    const res = await userApi.getById(infoUserStorage.id)
    hideSpinner()
    const { user } = res
    setFieldValue(divInfoLeftEl, "input[name='fullname']", user?.fullname)
    setFieldValue(divInfoLeftEl, "input[name='username']", user?.username)
    setFieldValue(divInfoLeftEl, "input[name='phone']", user?.phone)
    setFieldValue(divInfoLeftEl, "input[name='email']", user?.email)
    setBackgroundImage(userAvatarEl, 'img#avatar', user?.imageUrl)
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}
async function renderInfoAccount({ idElement, infoUserStorage, divInfoLeft, divInfoRight }) {
  const ulElement = document.getElementById(idElement)
  const divInfoLeftEl = document.getElementById(divInfoLeft)
  const userAvatarEl = document.getElementById(divInfoRight)
  if (!ulElement || !divInfoLeftEl || !userAvatarEl) return
  if (Object.keys(infoUserStorage).length === 0) {
    divInfoLeftEl.classList.add('is-hide')
    userAvatarEl.classList.add('is-hide')
  } else {
    displayTagLink(ulElement)
    displayInfoUser(infoUserStorage, divInfoLeftEl, userAvatarEl)
  }
}
function handleOnClick() {
  // add event for element render after dom
  document.addEventListener('click', async function (e) {
    const { target } = e
    if (target.matches("a[title='Đăng xuất']")) {
      await userApi.logout()
      localStorage.removeItem('accessToken')
      toast.info('Chuyển đến trang đăng nhập')
      setTimeout(() => {
        window.location.assign('/login.html')
      }, 500)
    } else if (target.matches("a[title='Cập nhật thông tin']")) {
      window.location.assign('/update-info.html')
    } else if (target.matches("a[title='Quản lý đơn hàng']")) {
      window.location.assign('/order.html')
    }
  })
}
function jsonToFormData(formValues) {
  const formData = new FormData()
  for (const key in formValues) {
    formData.set(key, formValues[key])
  }
  return formData
}

async function handleOnSubmitForm(formValues) {
  const formData = jsonToFormData(formValues)
  try {
    showSpinner()
    const updateUser = await userApi.updateFormData(formData)
    hideSpinner()
    if (updateUser) {
      toast.success('Cập nhật thông tin thành công')
      setTimeout(() => {
        window.location.assign('/account.html')
      }, 1000)
    }
  } catch (error) {
    console.log('failed to fetch data', error)
  }
}

// main
;(() => {
  // get cart from localStorage
  let cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  let infoUserStorage = localStorage.getItem('accessToken')
    ? JSON.parse(localStorage.getItem('accessToken'))
    : {}
  let isCartAdded = false
  if (Array.isArray(cart) && cart.length > 0) {
    if (!isCartAdded) {
      addCartToDom({
        idListCart: 'listCart',
        cart,
        idNumOrder: 'numOrder',
        idNum: '#num.numDesktop',
        idTotalPrice: 'totalPrice',
      })
      isCartAdded = true
    }
  }
  renderInfoAccount({
    idElement: 'accountUser',
    infoUserStorage,
    divInfoLeft: 'userInfo',
    divInfoRight: 'userAvatar',
  })
  initSearchForm({
    idForm: 'searchForm',
    idElement: 'searchList',
  })
  handleOnClick()
  handleUpdateInfoUser({
    idForm: 'formUpdateUser',
    user: infoUserStorage,
    onSubmit: handleOnSubmitForm,
  })
})()
