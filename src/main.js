import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

Vue.directive('click-outside', {
  priority: 700,
  bind: function (el, binding) {
    el.vueCustomStopClickPropagation = function (event) {
      event.stopPropagation()
    }
    el.addEventListener('click', el.vueCustomStopClickPropagation)
    document.body.addEventListener('click', binding.value)
  },
  unbind: function (el, binding) {
    el.removeEventListener('click', el.vueCustomStopClickPropagation)
    document.body.removeEventListener('click', binding.value)
  }
})

Vue.directive('focus', {
  inserted: function (el, binding) {
    if (binding.value === 'yes') {
      el.focus()
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#calendar-picker',
  template: '<app />',
  components: { App },
  debug: true,
  devtools: true
})
