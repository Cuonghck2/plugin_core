<script setup>
  import { ref, defineProps, onMounted, h } from 'vue'

  const props = defineProps({
    item: { type: Object, required: true, default: () => { return {}; } },
    dataForm: { type: Object, default: {} }
  })
  const emit = defineEmits(['changeData'])

  const renderSelect = ref(false)

  onMounted(() => {
    renderSelect.value = false;
    setTimeout(async () => {
      if (!props.item.model) {
        props.item = props.config
      }
      if (props.item.multiple && props.dataForm && !props.dataForm[props.item.model]) {
        props.dataForm[props.item.model] = [];
      } else if (props.item.multiple && props.dataForm && props.dataForm[props.item.model] && !Array.isArray(props.dataForm[props.item.model])) {
        const xxx = window.Vue.flattenKeys(props.dataForm[props.item.model])
        for (const key in xxx) {
          delete props.dataForm[`${props.item.model}.${key}`]
        }
        props.dataForm[props.item.model] = [ props.dataForm[props.item.model] ];
      }
      renderSelect.value = true;
    }, 0);
  })

  const change_data = (data) => {
    emit('changeData', {
        type: 'autocomplete',
        model: props.item.model,
        data: data
      })
  }
</script>
<template>
  <div :class="'vuejx_comp___' + item['model']" :key="dataForm[item.model]">
    <vuejx-autocomplete v-if="!item['dynamicAPI']" :config="{
        data: item['items'], disable: item['disable'],
        placeholder: item['placeholder'],
        modelView: 'object', label_class: item['label_class'], multiple: item['multiple'],
        model: item['model'], chips: false, required: item['required'],
        itemTextLv1: item['itemTextLv1'] ? item['itemTextLv1'] : '',
        label: item['label'], object: item['object'] ? item['object'] : true, itemText: item['itemText'] ? item['itemText'] : '_source.TenMuc', itemValue: item['itemValue'] ? item['itemValue'] : '_source.MaMuc',
        link: [ { db: item['db'] ? item['db'] : db, collection: item['collection'], condition: item['condition'] ? item['condition'] : [] } ],
        column: item['column'] ? item['column'] : ['MaMuc', 'TenMuc', 'type'], sort: item['sort'] ? item['sort'] : [ '_score' ]
    }" :data="dataForm" v-model="dataForm[item.model]" :site="site" @change_data="change_data"
    ></vuejx-autocomplete>
    <vuejx-autocomplete v-else :dynamicAPI="true" :delay="800" :maxItem="20" :config="{
        placeholder: item['placeholder'], disable: item['disable'],
        label: item['label'], required: item['required'],
        model: item['model'],
        itemTextLv1: item['itemTextLv1'] ? item['itemTextLv1'] : '',
        object: true, itemText: item['itemText'] ? item['itemText'] : '_source.TenMuc', itemValue: item['itemValue'] ? item['itemValue'] : '_source.MaMuc',
        link: [{ db: item['db'] ? item['db'] : db, collection: item['collection'], dynamicText: item['dynamicText']}],
        column: item['column'] ? item['column'] : ['MaMuc', 'TenMuc', 'type'],
        sort: item['sort'] ? item['sort'] : [ '_score' ]
        }" :data="dataForm" v-model="dataForm[item.model]" :site="site" @change_data="change_data"
      >
    </vuejx-autocomplete>
    <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
  </div>
</template>
