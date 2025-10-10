<script>
  export default {
    props: {
      item: { type: Object, default: {} },
      dataForm: {
        type: Object,
        default: null
      }
    },
    methods: {
			changeData() {
        console.log('changeDatachangeDatachangeDatachangeDatachangeDatachangeDatachangeData');
			}
    }
  }
</script>
<template>
  olala inputinptuinptu
  <label v-if="item['type'] === 'text'" :class="'vuejx_comp___' + item['model']">
      <div class="block font-semibold leading-tight pb-1 truncate">
      {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
      <span
          class="required__class"
          v-if="item['required']"
      >*</span>
      </div>
      <input :id="item.model"
      v-model="dataForm[item.model]"
      class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
      :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
      type="text"
      :placeholder="item['placeholder']"
      :disabled="item.disable"
      @input="changeData"
      />
      <div v-if="item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
  </label>
</template>
