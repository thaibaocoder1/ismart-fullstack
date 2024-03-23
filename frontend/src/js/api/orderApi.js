import axiosClient from './axiosClient'

const ordersApi = {
  getAll() {
    const url = '/orders'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/orders/${id}`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/orders/add`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/orders/${data.id}`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/orders/delete/${id}?_method=DELETE`
    return axiosClient.delete(url)
  },
}
export default ordersApi
