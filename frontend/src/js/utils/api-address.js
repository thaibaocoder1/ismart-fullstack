async function handleChangeProvince(e) {
  const options = e.target.options
  const provinceID = options[e.target.selectedIndex].dataset.id
  try {
    if (typeof provinceID === 'string' && provinceID !== '') {
      await getAllDistricts(provinceID, 'district')
    } else {
      const wardElement = document.getElementById('ward')
      const districtElement = document.getElementById('district')
      wardElement.innerHTML = `<option value="">Select one ward</option>`
      districtElement.innerHTML = `<option value="">Select one district</option>`
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
      wardElement.innerHTML = `<option value="">Select one ward</option>`
    }
  } catch (error) {
    console.log(error)
  }
}

async function getAllDistricts(provinceID, selector) {
  const districtElement = document.getElementById(selector)
  try {
    const response = await fetch('https://vapi.vnappmob.com/api/province/district/' + provinceID)
    const data = await response.json()
    const results = data.results
    results.forEach((district) => {
      const optionEl = document.createElement('option')
      optionEl.dataset.id = district.district_id
      optionEl.value = district.district_name
      optionEl.text = district.district_name
      districtElement.add(optionEl)
    })
    districtElement.addEventListener('change', handleChangeWard)
  } catch (error) {
    console.error('Error:', error)
  }
}

async function getAllWards(districtID, selector) {
  const districtElement = document.getElementById(selector)
  try {
    const response = await fetch('https://vapi.vnappmob.com/api/province/ward/' + districtID)
    const data = await response.json()
    const results = data.results
    results.forEach((ward) => {
      const optionEl = document.createElement('option')
      optionEl.dataset.id = ward.ward_id
      optionEl.value = ward.ward_name
      optionEl.text = ward.ward_name
      districtElement.add(optionEl)
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
      const optionEl = document.createElement('option')
      optionEl.dataset.id = province.province_id
      optionEl.value = province.province_name
      optionEl.text = province.province_name
      provinceElement.add(optionEl)
    })
    provinceElement.addEventListener('change', handleChangeProvince)
  } catch (error) {
    console.error('Error:', error)
  }
}
