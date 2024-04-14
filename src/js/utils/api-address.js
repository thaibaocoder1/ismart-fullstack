async function handleChangeProvince(e) {
  const options = e.target.options
  const provinceID = options[e.target.selectedIndex].dataset.id
  try {
    if (typeof provinceID === 'string' && provinceID !== '') {
      await getAllDistricts(provinceID, 'district')
    } else {
      const wardElement = document.getElementById('ward')
      const districtElement = document.getElementById('district')
      wardElement.innerHTML = `<option value="">Chọn 1 quận/huyện</option>`
      districtElement.innerHTML = `<option value="">Chọn 1 phường/xã</option>`
    }
  } catch (error) {
    console.log(error)
  }
}

async function handleChangeWard(e) {
  const options = e.target.options
  const districtID = options[e.target.selectedIndex].dataset.id
  try {
    if (districtID) {
      await getAllWards(districtID, 'ward')
    } else {
      const wardElement = document.getElementById('ward')
      wardElement.innerHTML = `<option value="">Chọn 1 quận/huyện</option>`
    }
  } catch (error) {
    console.log(error)
  }
}

async function getAllDistricts(provinceID, selector) {
  const districtElement = document.getElementById(selector)
  districtElement.innerHTML = `<option value="">Chọn 1 quận/huyện</option>`
  try {
    const response = await fetch('https://vapi.vnappmob.com/api/province/district/' + provinceID)
    const data = await response.json()
    const results = data.results
    results.forEach((district) => {
      districtElement.innerHTML += `<option data-id=${district.district_id} value="${district.district_name}">${district.district_name}</option>`
    })
    districtElement.addEventListener('change', handleChangeWard)
  } catch (error) {
    console.error('Error:', error)
  }
}

async function getAllWards(districtID, selector) {
  const wardElement = document.getElementById(selector)
  wardElement.innerHTML = `<option value="">Chọn 1 phường/xã</option>`
  try {
    const response = await fetch('https://vapi.vnappmob.com/api/province/ward/' + districtID)
    const data = await response.json()
    const results = data.results
    results.forEach((ward) => {
      wardElement.innerHTML += `<option data-id=${ward.ward_id} value="${ward.ward_name}">${ward.ward_name}</option>`
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

export async function getAllProvinces(selector) {
  const provinceElement = document.getElementById(selector)
  try {
    const response = await fetch('https://vapi.vnappmob.com/api/province/')
    const data = await response.json()
    const results = data.results
    results.forEach((province) => {
      provinceElement.innerHTML += `<option data-id=${province.province_id} value="${province.province_name}">${province.province_name}</option>`
    })
    provinceElement.addEventListener('change', handleChangeProvince)
  } catch (error) {
    console.error('Error:', error)
  }
}
