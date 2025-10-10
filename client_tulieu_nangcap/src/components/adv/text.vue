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
			},
      isValidEmail(val) {
      // Loại bỏ khoảng trắng 2 đầu và kiểm tra định dạng cơ bản
      const v = String(val || '').trim();
      // Regex đơn giản, đủ dùng cho hầu hết trường hợp
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return re.test(v);
    },
    isValidPhone(val) {
      // Chuẩn hóa số: loại bỏ khoảng trắng, dấu gạch
      const v = String(val || '').replace(/[\s\-\.]/g, '');
      // Chấp nhận dạng Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx (9–10 số sau prefix)
      // - 0 + 9–10 chữ số
      // - +84 + 9–10 chữ số
      const re0 = /^0\d{9,10}$/;
      const re84 = /^\+?84\d{9,10}$/;
      return re0.test(v) || re84.test(v);
    },
    normalizeOnInput(e) {
      // Chỉ chạy khi cấu hình modPhone bật
      if (!this.item?.modPhone) return;
      let v = e?.target?.value ?? '';
      const hasPlus = v.startsWith('+');
      v = v.replace(/[^\d]/g, '');
      e.target.value = hasPlus ? `+${v}` : v;
      // Đồng bộ lại vào dataForm
      this.$set(this.dataForm, this.item.model, e.target.value);
    },
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
      <div v-if="item?.modMail && dataForm[item.model] && !isValidEmail(String(dataForm[item.model]))" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form">
        {{ item.invalid_mail_title ? item.invalid_mail_title : 'Email không hợp lệ' }}
      </div>
      <div v-if="item?.modPhone && dataForm[item.model] && !isValidPhone(String(dataForm[item.model]))" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form">
        {{ item.invalid_phone_title ? item.invalid_phone_title : 'Số điện thoại không hợp lệ' }}
      </div>
  </label>
</template>
