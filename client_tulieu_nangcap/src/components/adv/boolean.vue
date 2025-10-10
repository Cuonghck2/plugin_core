<script setup>
  import { onMounted, watch, ref, inject } from 'vue'
  const props = defineProps({
    item: { type: Object, default: null },
    dataForm: { type: Object, default: null }
  })
  const emit = defineEmits(['changeData'])
  onMounted(() => {
    setTimeout(async () => {
      if (!props.dataForm[props.item.model]) {
        props.dataForm[props.item.model] = String(props.item.default) == 'true'
      }
      console.log('props.dataForm[props.item.model]', props.dataForm[props.item.model], props.dataForm, props.item.model);
    }, 0);
  })
  const changeDataInput = async (data) => {
    props.dataForm[props.item.model] = !props.dataForm[props.item.model]
    emit('changeData', {
      type: 'boolean',
      model: props.item.model,
      data: props.dataForm[props.item.model]
    })
  }
</script>

<template>
<div v-if="item" :class="'vuejx_comp___' + item['model']">
    <div class="block font-semibold leading-tight pb-1 truncate">
    {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
    <span
        class="required__class"
        v-if="item['required']"
    >*</span>
    </div>
    <div class="flex items-center" @click="changeDataInput">
      <span class="mr-2 font-bold" :class="dataForm[item.model] ? 'text-gray-500' : 'text-blue-700'">{{ item['label_false'] }}</span>
      <div class="relative inline-block w-12 align-middle select-none transition duration-200 ease-in cursor-pointer">
        <input :checked="String(dataForm[item.model]) == 'true'" :class="{'checkbox__selected': String(dataForm[item.model]) == 'true'}"
          type="checkbox" class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none focus:outline-none pointer-events-none" style="margin:0px; appearance: none;min-height: 24px;" />
        <label class="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
      </div>
      <span class="ml-2 font-bold" :class="dataForm[item.model] ? 'text-blue-700' : 'text-gray-500'">{{ item['label_true'] }}</span>
    </div>
    <div v-if="item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
</div>
</template>