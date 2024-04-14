export function formatCurrencyNumber(number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number)
}
export function calcPrice(item) {
  return (item.price * (100 - Number.parseInt(item.discount))) / 100
}
export function checkStatus(product) {
  return Number.parseInt(product.quantity) === 0 && Number.parseInt(product.status) === 0
    ? 'Ngưng bán'
    : Number.parseInt(product.quantity) === 0 && Number.parseInt(product.status) === 1
    ? 'Đợi nhập hàng'
    : Number.parseInt(product.quantity) <= 20 && Number.parseInt(product.status) === 1
    ? 'Sắp hết hàng'
    : Number.parseInt(product.quantity) > 0 && Number.parseInt(product.status) === 0
    ? 'Ngưng bán'
    : 'Còn hàng'
}
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
