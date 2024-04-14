class Validator {
  constructor(options) {
    this.selectorRules = {}

    this.getParent = (element, selector) => {
      while (element.parentElement) {
        if (element.parentElement.matches(selector)) {
          return element.parentElement
        }
        element = element.parentElement
      }
    }

    this.validate = (inputElement, rule) => {
      const parentElement = this.getParent(inputElement, options.formGroupSelector)
      const errorElement = parentElement.querySelector(options.errorSelector)
      let errorMessage = null
      const rules = this.selectorRules[rule.selector]
      for (let i = 0; i < rules.length; ++i) {
        switch (inputElement.type) {
          case 'radio':
          case 'checkbox':
            errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
            break
          default:
            errorMessage = rules[i](inputElement.value)
            break
        }
        if (errorMessage) break
      }
      if (errorMessage) {
        parentElement.classList.add('invalid')
        errorElement.innerText = errorMessage
      } else {
        parentElement.classList.remove('invalid')
        errorElement.innerText = ''
      }
      return !errorMessage
    }

    const formElement = document.querySelector(options.formID)
    if (formElement) {
      let submitting = false
      formElement.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (submitting) return
        let isFormValid = true
        options.rules.forEach((rule) => {
          const inputElement = formElement.querySelector(rule.selector)
          const isValid = this.validate(inputElement, rule)
          if (!isValid) isFormValid = false
        })
        if (isFormValid) {
          if (typeof options.onSubmit === 'function') {
            submitting = true
            const enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
            const formValues = [...enableInputs].reduce((values, input) => {
              switch (input.type) {
                case 'radio':
                  values[input.name] = formElement.querySelector(
                    `input[name='${input.name}']:checked`,
                  ).value
                  break
                case 'checkbox':
                  if (!input.matches(':checked')) {
                    values[input.name] = ''
                    return values
                  }
                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = []
                  }
                  values[input.name].push(input.value)
                  break
                case 'file':
                  values[input.name] = input.files[0]
                  break
                default:
                  values[input.name] = input.value
              }
              return values
            }, {})
            await options.onSubmit(formValues)
            submitting = false
          } else {
            formElement.submit()
          }
        }
      })

      options.rules.forEach((rule) => {
        const inputElements = formElement.querySelectorAll(rule.selector)
        ;[...inputElements].forEach((inputElement) => {
          inputElement.addEventListener('blur', () => {
            this.validate(inputElement, rule)
          })
          inputElement.addEventListener('input', () => {
            const parentElement = this.getParent(inputElement, options.formGroupSelector)
            const errorElement = parentElement.querySelector(options.errorSelector)
            parentElement.classList.remove('invalid')
            errorElement.innerText = ''
          })
        })
        if (Array.isArray(this.selectorRules[rule.selector])) {
          this.selectorRules[rule.selector].push(rule.test)
        } else {
          this.selectorRules[rule.selector] = [rule.test]
        }
      })
    }
  }

  static isRequired(selector, message) {
    return {
      selector,
      test(value) {
        return value ? undefined : message || 'Vui lòng nhập trường này'
      },
    }
  }

  static isEmail(selector, message) {
    return {
      selector,
      test(value) {
        const regexEmail =
          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
        return regexEmail.test(value) ? undefined : message || 'Trường này phải là email'
      },
    }
  }

  static isPhone(selector, message) {
    return {
      selector,
      test(value) {
        const regex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g
        return regex.test(value) ? undefined : message || 'Trường này phải là số điện thoại'
      },
    }
  }

  static minLength(selector, min, message) {
    return {
      selector,
      test(value) {
        return value.length >= min ? undefined : message || `Vui lòng tối thiểu ${min} ký tự`
      },
    }
  }

  static isConfirmed(selector, getConfirmValue, message) {
    return {
      selector,
      test(value) {
        return value === getConfirmValue() ? undefined : message || 'Giá trị nhập lại không khớp'
      },
    }
  }
}

export default Validator
