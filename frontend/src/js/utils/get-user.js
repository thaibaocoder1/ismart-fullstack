export function checkLoginUser() {
  let infoUserStorage = null
  const accessToken = localStorage.getItem('accessToken')
  const accessTokenAdmin = localStorage.getItem('accessTokenAdmin')
  if (accessToken !== null && accessTokenAdmin !== null) {
    infoUserStorage = JSON.parse(accessToken)
  } else {
    if (accessToken === null) {
      infoUserStorage = JSON.parse(accessTokenAdmin)
    } else {
      infoUserStorage = JSON.parse(accessToken)
    }
  }
  return infoUserStorage
}
