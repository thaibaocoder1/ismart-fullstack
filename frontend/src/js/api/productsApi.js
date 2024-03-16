import axiosClient from './axiosClient'

const productApi = {
  getAll() {
    const url = '/products'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/products/detail/${id}`
    return axiosClient.get(url)
  },
  getByCatalog(query) {
    const url = `/products/${query}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/products`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/products/${data.id}`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/products/${id}`
    return axiosClient.delete(url)
  },
}
export default productApi
