<template>
  <span></span>
</template>

<script>
import { useNotification } from 'naive-ui'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const notification = useNotification()
    window.Vue.toastr = {
      success: function (msg) {
          notification.success({
              title: `Thông báo`,
              content: `Yêu cầu của bạn được thực hiện thành công.`,
              duration: 2000
          })
      },
      error: function (msg) {
          notification.error({
              title: `Thông báo`,
              content: typeof msg == 'object' && msg.message ? msg.message : `Yêu cầu của bạn được thực hiện thất bại.`,
              duration: 2000
          })
      }
    }
  }
})
</script>