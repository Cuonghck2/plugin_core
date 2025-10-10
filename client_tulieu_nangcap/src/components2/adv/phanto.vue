<script>
  export default {
    props: {
      item: { type: Object, default: {} },
      data: {
        type: Object,
        default: null
      },
      dataRaw: {
        type: Object,
        default: null
      }
    },
    data: function() {
        return {
          danhMucPT: []
        }
    },
		mounted: function () {
      let vm = this
      this.$nextTick(function () {
        vm.init()
      })
    },
    methods: {
      async init() {
        let vm = this
        let searchDataMenu = await window.VueJX.search(vm, vm.item['collection'], [], [], [], ['MaMuc', 'TenMuc', 'type'], null, null, 100, null, 100, null);
        console.log('itemitemitem', this.item, this.data, this.dataRaw, searchDataMenu.dataResults)
        vm.danhMucPT = searchDataMenu.dataResults
      }
    }
  }
</script>
<template>
  <div class="flex -mx-2">
    <template v-for="(itemPT, indexPT) in danhMucPT" v-bind:key="indexPT">
      <vuejx-autocomplete class="px-2" :config="{
        placeholder: itemPT._source?.placeholder,
        modelView: 'object',
        model: itemPT._source.MaMuc, chips: false,
        label: itemPT._source.TenMuc, object: true, itemText: '_source.TenMuc', itemValue: '_source.MaMuc',
        link: [ { collection: itemPT._source.MaMuc, condition: itemPT._source.condition ? itemPT._source.condition : [] } ],
        column: ['MaMuc', 'TenMuc', 'type'], sort: [ '_score' ]
      }" @change_data="change_data"
      ></vuejx-autocomplete>
    </template>
  </div>
</template>
