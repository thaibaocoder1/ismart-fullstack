import axiosClient from './axiosClient'

const orderDetailApi = {
  getAll() {
    const url = '/orderDetails'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/orderDetails/${id}`
    return axiosClient.get(url)
  },
  getWithStatus() {
    const url = `/orderDetails/statistical`
    return axiosClient.get(url)
  },
  add(data) {
    const url = `/orderDetails/add?_method=POST`
    return axiosClient.post(url, data)
  },
  update(data) {
    const url = `/orderDetails/${data.id}`
    return axiosClient.patch(url, data)
  },
  delete(id) {
    const url = `/orderDetails/${id}`
    return axiosClient.delete(url)
  },
}
export default orderDetailApi
