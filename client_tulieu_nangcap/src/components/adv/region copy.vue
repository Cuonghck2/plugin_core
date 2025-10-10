<script setup>
  import { ref, watch, defineProps, onMounted, h } from 'vue'
  import { objectView } from '../../untils.js'

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
      console.log('dataFormdataFormdataFormdataFormdataForm', props.dataForm, props.item.model);
    }, 0);
  })
  
  const clearData = (type) => {
    if (type == 'QuanHuyen' || type == 'TinhThanh') {
        window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._id', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.MaMuc', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.TenMuc', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.PhuongXa._source.type', null)
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.PhuongXa'])
    }
    if (type == 'TinhThanh') {
        window.Vue.set(props.dataForm, props.item["model"] + '.QuanHuyen._id', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.QuanHuyen._source.MaMuc', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.QuanHuyen._source.TenMuc', null)
        window.Vue.set(props.dataForm, props.item["model"] + '.QuanHuyen._source.type', null)
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.QuanHuyen', props.item["model"] + '.PhuongXa'])
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.QuanHuyen', props.item["model"] + '.PhuongXa'])
        props.dataForm = window.Vue.omit(props.dataForm, [props.item["model"] + '.QuanHuyen', props.item["model"] + '.PhuongXa'])
    }
  }

  const changeDataCbx = (data) => {
    if (data.model == 'TinhThanh') {
      props.dataForm[props.item.model + '.QuanHuyen._id'] = null;
      props.dataForm[props.item.model + '.PhuongXa._id'] = null;
      props.dataForm[props.item.model + '.QuanHuyen'] = null;
      props.dataForm[props.item.model + '.PhuongXa'] = null;
      if (!data.data) {
        props.dataForm[props.item.model + '.TinhThanh._id'] = null;
        props.dataForm[props.item.model + '.TinhThanh'] = null;
        window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
        window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
        window.Vue.set(props.dataForm[props.item.model], 'TinhThanh', null)
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
      }
    } else if (data.model == 'QuanHuyen') {
      renderXa.value = false;
      if (!data.data) {
        props.dataForm[props.item.model + '.QuanHuyen._id'] = null;
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'QuanHuyen', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
        window.Vue.set(props.dataForm[props.item.model], 'PhuongXa', null)
      }
      props.dataForm[props.item.model + '.PhuongXa._id'] = null;
      props.dataForm[props.item.model + '.PhuongXa'] = null;
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
        renderArrayForm.value ++
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
    renderArrayForm.value ++
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
</script>
<template>
  <div v-if="item && !item.array" :class="'vuejx_comp___' + item['model']">
    <template v-if="item.label_diachi">
      <div class="block font-semibold leading-tight pb-1 truncate">
        {{ item.label_diachi }}
        <span
            class="required__class"
            v-if="item['required']"
        >*</span>
      </div>
      <input
        v-model="dataForm[item.model + '.SoNhaChiTiet']"
        class="p-2 focus:outline-none focus:cursor-text w-full border border-gray-200 focus:bg-white focus:border-gray-400 rounded"
        :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
        type="text"
        :placeholder="item['placeholder_diachi']"
        @change="changeDataInput({
          model: item.model + '.SoNhaChiTiet',
          data: dataForm[item.model + '.SoNhaChiTiet']
        })"
      />
      <div v-if="item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
    </template>
    <template v-if="item.label_tinh">
      <div class="flex flex-wrap -mx-2">
        <div class="xs12 sm4 px-2">
          <vuejx-autocomplete-wrap :key="dataForm[item.model + '.TinhThanh']"  @changeData="changeDataCbx"
            :item='{
              modelRoot: item.model, modelView: "object", 
              label: item["placeholder_tinh"],
              placeholder: item["placeholder_tinh"],
              model: "TinhThanh",
              type: "autocomplete",
              label_class: item["css_tinh"], multiple: false, chips: false, required: item.hasOwnProperty("required_tinh") ? item["required_tinh"] : item["required"],
              collection: "C_TinhThanh",
              label: item["label_tinh"]
            }' :dataForm="dataForm[item.model]" v-model="dataForm[item.model + '.TinhThanh']"
          ></vuejx-autocomplete-wrap>
          <div v-if="item['required'] && !dataForm[item.model + '.TinhThanh']" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
        </div>
        <div class="xs12 sm4 px-2">
          <vuejx-autocomplete-wrap :key="dataForm[item.model + '.TinhThanh._id']" @changeData="changeDataCbx"
            :item='{
              modelRoot: item.model, modelView: "object", 
              label: item["placeholder_huyen"],
              placeholder: item["placeholder_huyen"],
              model: "QuanHuyen",
              type: "autocomplete",
              label_class: item["css_huyen"], multiple: false, chips: false, required: item.hasOwnProperty("required_huyen") ? item["required_huyen"] : item["required"],
              collection: "C_QuanHuyen",
              condition: [{
                bool: {
                  should: [
                    { 
                      match: {
                        "TinhThanh._source.MaMuc": objectView(dataForm[item.model + ".TinhThanh"], "_source.MaMuc")
                      }
                    }
                  ]
                }
              }],
              label: item["label_huyen"]
            }' :dataForm="dataForm[item.model]" v-model="dataForm[item.model + '.QuanHuyen']"
          ></vuejx-autocomplete-wrap>
          <div v-if="item['required'] && !dataForm[item.model + '.TinhThanh']" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
        </div>
        <div class="xs12 sm4 px-2">
          <vuejx-autocomplete-wrap :key="renderXa" @changeData="changeDataCbx"
            :item='{
              modelRoot: item.model, modelView: "object", 
              label: item["placeholder_xa"],
              placeholder: item["placeholder_xa"],
              model: "PhuongXa", type: "autocomplete",
              label_class: item["css_xa"], multiple: false, chips: false, required: item.hasOwnProperty("required_xa") ? item["required_xa"] : false,
              collection: "C_PhuongXa",
              condition: [{
                bool: {
                  should: [
                    { 
                      match: {
                        "QuanHuyen._source.MaMuc": objectView(dataForm[item.model + ".QuanHuyen"], "_source.MaMuc")
                      }
                    }
                  ]
                }
              }],
              label: item["label_xa"]
            }' :dataForm="dataForm[item.model]" v-model="dataForm[item.model + '.PhuongXa']"
          ></vuejx-autocomplete-wrap>
        </div>
      </div>
    </template>
  </div>
  <div v-else-if="item && item.array" :class="'vuejx_comp___' + item['model']">
    <vuejx-screen :grid_class="item.grid_class ? item.grid_class : 'grid grid-cols-3 gap-2'" :config="{
    'label': '',
    'type': 'array',
    'element': 'object',
    'view_form': 'simple',
    'grid_class': item.grid_class,
    'form': [
        {
        class: 'col-span-12',
        label: 'Địa chỉ',
        label_diachi: 'Địa chỉ chi tiết',
        label_huyen: 'Huyện/Quận',
        label_tinh: 'Tỉnh/Thành phố',
        label_xa: 'Xã/Phường',
        model: 'DiaChi',
        type: 'region'
      }
    ]
  }" 
      :key="renderArrayForm"
      :modelForm="item.model"
    >
        <template v-slot:action="{ modelx, dataFormX }" >
          <div class="my-2 text-right">
            <button @click="processArray(dataFormX, item.model.indexOf('\.') != -1 ? 'DiaChi' : item.model, item)"
              class="leading-none font-semibold bg-blue-700 text-white rounded px-4 py-2 focus:outline-none" tabindex="-1">
              Thêm mới
            </button>
          </div>
        </template>
    </vuejx-screen>

    <template v-if="Array.isArray(dataForm[item.model])">
      <div :key="renderArrayForm">
        <div class="relative" v-for="(itemDataArray, indexAr) in dataForm[item.model]" v-bind:key="indexAr">
          <div class="block___label block___label_index">
            <div><div class="block font-semibold leading-tight pb-1 truncate">
            <button @click.stop="processArrayDelete(indexAr, item.model)"
              tabindex="0" type="button" class="remove__table_array_index"><span class="text-red-700 mr-1">Xoá dữ liệu</span></button>
            {{ indexAr + 1 }}
            </div></div>
          </div>
          <vuejx-screen class="z-10" ref="formInputArray" :grid_class="item.grid_class ? item.grid_class : 'grid grid-cols-3 gap-2'" :config="{
              'label': '',
              'model': 'DiaChi',
              'type': 'array',
              'element': 'object',
              'view_form': 'simple',
              'grid_class': item.grid_class,
              'form': [
                  {
                  class: 'col-span-12',
                  label: 'Địa chỉ',
                  label_diachi: 'Địa chỉ chi tiết',
                  label_huyen: 'Huyện/Quận',
                  label_tinh: 'Tỉnh/Thành phố',
                  label_xa: 'Xã/Phường',
                  model: 'DiaChi',
                  type: 'region'
                }
              ]
            }"
            :modelForm="'DiaChi'" :modelFormIndex="indexAr" @dataChange="changeDataFormArray" @changeData="changeDataFormArray" 
            v-model="dataForm[item.model][indexAr]"
            :data="flattenKeysData(itemDataArray)">
              <template v-slot:action="{ modelx, dataFormX }" >
                <span></span>
              </template>
          </vuejx-screen>
        </div>
      </div>
    </template>
  </div>
</template>
