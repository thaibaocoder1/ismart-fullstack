import axiosClient from './axiosClient'

const roleApi = {
  getAll() {
    const url = '/roles'
    return axiosClient.get(url)
  },
  getById(id) {
    const url = `/roles/${id}`
    return axiosClient.get(url)
  },
}
export default roleApi
