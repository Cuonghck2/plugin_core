export default {
    props: {
      storage: { type: Object, default: () => { return 'regular' } },
      cardClass: { type: String, default: () => { return ""; } },
      redirectDetail: { type: Boolean, default: true },
      viewMore: { type: String, default: () => { return ""; } },
      viewDetail: { type: String, default: () => { return ""; } },
      filter_options: { type: Array, default: () => { return []; } },
      table_config: { type: Array, default: () => { return []; } },
      itemText: { type: String, default: "", },
      itemValue: { type: String, default: "", },
      title: { type: String, default: "", },
      detailPage: { type: String, default: "", },
      employee__table: { type: Boolean, default: false, },
      idtable: { type: String, default: "table__to__export", },
      db: { type: String, default: () => { return localStorage.getItem("db"); } },
      collection: { type: String, default: () => { return ""; } },
      site: { type: String, default: () => { return ""; } },
      includes: { type: Array, default: () => { return []; } },
      sort: { type: Array, default: () => { return []; } },
      pagesize: { type: Number, default: () => { return 5; } },
      paging: { type: Boolean, default: () => { return true; } },
      condition: { type: Array, default: () => { return []; } },
      queryFilter: { type: Array, default: () => { return []; } },
      keywords: { type: Array, default: () => { return []; } },
      queryParam: { type: Boolean, default: () => { return true; } },
      empty: { type: Boolean, default: () => { return false; } },
      skeleton: { type: Object, default: () => { return { th: [], td: [] } } },
      query: { type: Object, default: () => { return null } }
    },
    methods: {
        async init() {
            let vm = this;
            const queryParam = window.Vue.router.currentRoute.value.query;
            vm.keywordsQ = queryParam.keywords ? queryParam.keywords : '';

            const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, vm.condition, vm.includes, vm.sort, {
              match: {
                  storage: vm.storage
              }
            }, vm.pagesize, vm.queryParam, vm.pagesize);
            vm.renderData = true;
            vm.dataResults = searchData.dataResults;
            vm.$emit("dataArray", searchData.dataResults);
            vm.$emit("total", searchData.totalRecord);
            vm.$emit("totalData", {
              total: searchData.totalRecord,
              collection: vm.collection
            });
          },
          objectView(item, key, defaultVal) {
            return window.Vue.objectView(item, key, defaultVal)
          },
          toDetail(item) {
            if (this.detailPage && this.detailPage.indexOf('?') != -1) {
                let [pageDetail, queryxxx] = this.detailPage.split('?');
                let parx = '&t=' + new Date().getTime();
                if (queryxxx && queryxxx.indexOf('&') != -1) {
                    let listQuery = queryxxx.split('&');
                    for (let el of listQuery) {
                      parx = parx + '&' + el;
                    }
                } else if (queryxxx) {
                  parx = parx + '&' + queryxxx;
                }
                window.location.href = pageDetail + '?_id=' + item._id + parx;
            } else if (this.redirectDetail) {
              window.location.href = this.viewDetail + '?_id=' + item._id;
            } else {
              this.$emit("change_data", item);
            }
          }
    },
    mounted: function() {
        let vm = this;
        vm.renderData = false;
        vm.$nextTick(function() {
            setTimeout(async () => {
              await vm.init();
            }, 0);
        });
    },
    data: ()  => ({
        keywordsQ: '',
        renderData: false,
        site: localStorage.getItem('site'),
        rows: 15,
        dataResults: [],
        page: 1,
        pages: 1,
        totalRecord: 0,
        sortBack: [],
        sortNext: [],
        paggingType: ''
    }),
    template: `
    <div class="vuejx__chips_filter mb-2 fix-width-numnber vuejx___header_top head">
      <header class="relative inline-block flex">
        <span class="flex items-center"> <h4 class="font-semibold pl-1 text-white cursor-default"> {{ title }}</h4> </span>
        <div v-if="viewMore" class="ml-auto"> <a :href="viewMore + '?keywords=' + keywordsQ" class="relative text-gray-600 rounded px-2 pr-4 py-2 leading-none focus:outline-none hover:text-blue-700" tabindex="-1" style="text-transform: none;"> Xem thêm <i class="mdi mdi-chevron-right absolute right-0 top-0 text-md" style="margin-top: 7px;"></i> </a> </div>
      </header>
      <div class="text-justify" :class="cardClass" :key="renderData">
        <div class="flex justify-start cursor-pointer text-gray-900 hover:text-blue-700 hover:bg-gray-200 px-2 py-1 relative border-b border-gray-200" v-for="(item, index) in dataResults" v-bind:key="index" @click="toDetail(item)" ><template v-if="objectView(item, itemText)"> <i class="mdi mdi-chevron-right absolute left-0 top-0 text-sm" style="margin-top: 6px; margin-left: 8px;"></i> <slot name="tbody" v-bind:item="item"> <div class="text-sm w-full mr-5 ml-5"> {{ objectView(item, itemText) }} </div> </slot> </template></div>
      </div>
    </div>
    `
}