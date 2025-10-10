<script setup>
import { ref, watch, defineProps, onMounted, computed } from 'vue'
import { objectView, objectViewObject } from '../../untils.js'

const props = defineProps({
  item: { type: Object, default: null },
  dataForm: { type: Object, default: {} },
  db: { type: String, default: localStorage.getItem('db') },
  site: { type: String, default: localStorage.getItem('site') }
})
const renderArrayForm = ref(0)
const newArray = ref([])
const renderXa = ref(false)
const emit = defineEmits(['changeData'])
onMounted(() => {
  setTimeout(async () => {
    renderArrayForm.value = 0
    renderXa.value = true
  }, 0);
})

const clearData = (type) => {
  if (type == 'TinhThanh') {
    window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._id', null)
    window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.MaMuc', null)
    window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.TenMuc', null)
    window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.type', null)
    props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
    props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
    props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
  }
}

const changeDataCbx = (data) => {
  if (data.model == 'TinhThanh') {
    props.dataForm[props.item.model + '.PhuongXa._id'] = null;
    props.dataForm[props.item.model + '.PhuongXa'] = null;
    renderXa.value = false
    if (!data.data) {
      props.dataForm[props.item.model + '.TinhThanh._id'] = null;
      props.dataForm[props.item.model + '.TinhThanh'] = null;
      window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
      window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
      window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
      window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
      window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
      window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
    }
  }
  setTimeout(() => {
    renderXa.value = true
  }, 200);
  emit('changeData', {
    type: 'autocomplete',
    model: props.item.model + '.' + data.model,
    data: data.data
  })
}

const flattenKeysData = (data) => {
  let diaChiObj = {}
  diaChiObj['DiaChi'] = data
  return window.Vue.flattenKeys(diaChiObj);
}

const processArrayDelete = async (index, model) => {
  if (confirm('a Bạn muốn xoá bản ghi này?')) {
    props.dataForm[model].splice(index, 1);
    setTimeout(() => {
      renderArrayForm.value++
    }, 100);
  }
}
const processArray = async (data, model, config) => {
  let dataClean = window.Vue.backward(data);
  let valid = true
  if (valid) {
    console.log('props.dataForm[model]', props.dataForm[model], dataClean, data, model);
    if (Array.isArray(props.dataForm[props.item.model])) {
      props.dataForm[props.item.model].push(dataClean[model])
    } else {
      props.dataForm[props.item.model] = [dataClean[model]];
    }
  } else {
    alert('Trường thông tin bắt buộc nhập.')
  }
  for (let key in props.dataForm) {
    if (key.indexOf(props.item.model + '.') != -1) {
      delete props.dataForm[key]
    }
  }
  renderArrayForm.value++
}
const changeDataFormArray = (data) => {
  console.log('datadatadatadata====', data);
  if (Array.isArray(props.dataForm[data.model]) && props.dataForm[data.model][data.index]) {
    const rawVal = window.Vue.backward(data.data)
    props.dataForm[data.model][data.index] = rawVal[data.model]
  }
}
const changeDataInput = async (data) => {
  console.log('changeDataInput', data.data, data.model, props.dataForm[props.item.model]);
  emit('changeData', {
    type: 'autocomplete',
    model: data.model,
    data: data.data
  })
}
const conditionXa = computed(() => {
  let resultConditon = [{
    bool: {
      should: [
        {
          match: {
            "TinhThanh._source.MaMuc": new Date().getTime()
          }
        }
      ]
    }
  }]
  if (Array.isArray(objectViewObject(props.dataForm, props.item.model + ".TinhThanh"))) {
    let conditionBuild = {
      bool: {
        should: [

        ]
      }
    }
    for (const elTinh of objectViewObject(props.dataForm, props.item.model + ".TinhThanh")) {
      conditionBuild.bool.should.push({
        match: {
          "TinhThanh._source.MaMuc": elTinh?._source?.MaMuc
        }
      })
    }
    resultConditon = [conditionBuild]
  } else {
    resultConditon = [{
      bool: {
        should: [
          {
            match: {
              "TinhThanh._source.MaMuc": objectView(props.dataForm[props.item.model + ".TinhThanh"], "_source.MaMuc")
            }
          }
        ]
      }
    }]
  }
  return resultConditon
})
</script>
<template>
  <div v-if="item" :class="'vuejx_comp___' + item['model']">
    <template v-if="item.label_tinh">
      <div class="flex flex-wrap -mx-2">
        <div class="xs12 sm6 px-2">
          <vuejx-autocomplete-wrap :key="dataForm[item.model + '.TinhThanh']" @changeData="changeDataCbx" :item='{
            column: ["MaMuc", "TenMuc", "type", "TinhThanh"],
            modelRoot: item.model, modelView: "object",
            label: item["placeholder_tinh"],
            placeholder: item["placeholder_tinh"],
            model: "TinhThanh",
            type: "autocomplete",
            label_class: item["css_tinh"], multiple: item.array ? true : false, chips: false, required: item.hasOwnProperty("required_tinh") ? item["required_tinh"] : item["required"],
            collection: "C_TinhThanh",
            label: item["label_tinh"]
          }' :dataForm="dataForm[item.model]" v-model="dataForm[item.model + '.TinhThanh']">
          </vuejx-autocomplete-wrap>
          <div v-if="item['required_tinh'] && !dataForm[item.model + '.TinhThanh']"
            class="text-red-600 mt-2 italic error___form">
            {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}
          </div>
        </div>
        <div class="xs12 sm6 px-2">
          <vuejx-autocomplete-wrap :key="renderXa" @changeData="changeDataCbx" :item='{
            column: ["MaMuc", "TenMuc", "type", "TinhThanh"],
            modelRoot: item.model, modelView: "object",
            label: item["placeholder_xa"],
            placeholder: item["placeholder_xa"],
            model: "PhuongXa", type: "autocomplete",
            label_class: item["css_xa"], multiple: item.array ? true : false, chips: false, required: item.hasOwnProperty("required_xa") ? item["required_xa"] : false,
            collection: "C_PhuongXa",
            condition: conditionXa,
            label: item["label_xa"]
          }' :dataForm="dataForm[item.model]" v-model="dataForm[item.model + '.PhuongXa']">
          </vuejx-autocomplete-wrap>
        </div>
      </div>
    </template>
    <template v-if="item.label_diachi">
      <div class="block font-semibold leading-tight pb-1 truncate">
        {{ item.label_diachi }}
        <span class="required__class" v-if="item['required']">*</span>
      </div>
      <input v-model="dataForm[item.model + '.SoNhaChiTiet']"
        class="p-2 focus:outline-none focus:cursor-text w-full border border-gray-200 focus:bg-white focus:border-gray-400 rounded"
        :class="{ 'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable }"
        type="text" :placeholder="item['placeholder_diachi']" @change="changeDataInput({
          model: item.model + '.SoNhaChiTiet',
          data: dataForm[item.model + '.SoNhaChiTiet']
        })" />
      <div v-if="item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form">
        {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}
      </div>
    </template>
  </div>
</template>
