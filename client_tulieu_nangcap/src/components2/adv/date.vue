<script setup>
  import {
    create,
    NDatePicker
  } from 'naive-ui'
  
  const naive = create({
    components: [
      NDatePicker
    ]
  })

  window.Vue.use(naive)
  import { onMounted, watch, ref, inject } from 'vue'
  const props = defineProps({
    dataForm: { type: Object, default: null },
    data: { type: Object, default: {} },
    config: { type: Object, default: {} },
    currentDate: { type: Boolean, default: false, required: false },
    stringDate: { type: Boolean, default: false, required: false }
  })
  const renderDate = ref(false)
  const format = ref('dd/MM/yyyy')
  const dateVal = ref(null)
  const emit = defineEmits(['changeData'])
  const buildDate = (cuDate) => {
    if (cuDate) {
      props.dataForm[`${props.config.model}___Ngay`] = String(cuDate.getDate()).padStart(2, 0)
      props.dataForm[`${props.config.model}___Thang`] = String(cuDate.getMonth() + 1).padStart(2, 0)
      props.dataForm[`${props.config.model}___Nam`] = cuDate.getFullYear()
      if (props.time || props.config.time) {
        props.dataForm[`${props.config["model"]}___Gio`] =  String(cuDate.getHours()).padStart(2, 0);
        props.dataForm[`${props.config["model"]}___Phut`] =  String(cuDate.getMinutes()).padStart(2, 0);
      }
    }
  }
  const init = async () => {
    if (dateVal.value) {
      let cuDate = null
      if (typeof dateVal.value == 'string' && (props.stringDate || props.config.stringDate)) {
        let [dayI, monthI, yearI] = String(dateVal.value).split('/')
        cuDate = new Date(monthI + '/' + dayI + '/' + yearI)
        dateVal.value = new Date(monthI + '/' + dayI + '/' + yearI).getTime();
      } else {
        cuDate = new Date(parseInt(dateVal.value))
        dateVal.value = cuDate.getTime();
      }
      buildDate(cuDate)
    } else if (props.currentDate || props.config.currentDate) {
      const cuDate = new Date()
      if (props.stringDate || props.config.stringDate) {
        props.dataForm[props.config.model] = window.VueJx.formatDate(cuDate)
      } else {
        props.dataForm[props.config.model] = cuDate.getTime();
      }
      buildDate(cuDate)
      dateVal.value = cuDate.getTime()
    }
    if (props.config.time) {
      format.value = "dd/MM/yyyy HH:mm"
    }
    renderDate.value = true;
  }
  onMounted(() => {
    renderDate.value = false;
    setTimeout(async () => {
      if (!props.dataForm) {
        props.dataForm = props.data
      } 
      dateVal.value = props.dataForm[props.config.model]
      await init();
    }, 0);
  })
  watch(() => dateVal.value, (currentValue, oldValue) => {
    if (currentValue != oldValue) {
      returnFullString(currentValue)
    }
  },
    { deep: true }
  )
  const returnFullString = (data) => {
      if (data) {
        const pickDate = new Date(data)
        pickDate.setSeconds(0)
        pickDate.setMilliseconds(0)
        if (!props.dataForm) {
          props.dataForm = props.data
        } 
        console.log('data======', props.dataForm, props.data, props.config.model, pickDate);
        props.dataForm[`${props.config.model}`] = pickDate.getTime()
        props.dataForm[`${props.config.model}___Ngay`] = pickDate.getDate()
        props.dataForm[`${props.config.model}___Thang`] = pickDate.getMonth() + 1
        props.dataForm[`${props.config.model}___Nam`] = pickDate.getFullYear()
        if (props.config.time) {
            props.dataForm[`${props.config.model}___Gio`] = pickDate.getHours()
            props.dataForm[`${props.config.model}___Phut`] = pickDate.getMinutes()
        }
        emit('changeData', {
          type: 'date',
          model: props.config.model,
          data: (props.stringDate || props.config.stringDate) ? window.VueJX.formatDate(pickDate) : pickDate.getTime()
        })
      } else {
        props.dataForm[`${props.config.model}___Ngay`] = null
        props.dataForm[`${props.config.model}___Thang`] = null
        props.dataForm[`${props.config.model}___Nam`] = null
        if (props.config.time) {
            props.dataForm[`${props.config.model}___Gio`] = null
            props.dataForm[`${props.config.model}___Phut`] = null
        }
        emit('changeData', {
          type: 'date',
          model: props.config.model,
          data: null
        })
      }
  }
</script>

<template>
  <label v-if="config" :class="'vuejx_comp___' + config.model">
    <div class="relative vuejx_date_selection" :key="format">
      <div class="block font-semibold leading-tight pb-1 truncate" :class="config.label_class ? config.label_class : ''" v-if="config.hasOwnProperty('label')">
          {{ config.hasOwnProperty('label') ? config.label : config.model }}
          <span
            class="required__class"
            v-if="config['required']"
          >*</span>
      </div>
      <div class="relative focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
      >
        <n-date-picker v-if="renderDate"
          v-model:value="dateVal"
          :type="config.time ? 'datetime' : 'date'" clearable :format="format" :update-value-on-close="true"
          :placeholder="format"
        ></n-date-picker>
      </div>
    </div>
  </label>
</template>