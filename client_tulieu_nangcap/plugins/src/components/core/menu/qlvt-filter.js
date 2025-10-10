export default {
    props: {
      reportLoadingText: {
        type: String,
        default: "Vui lòng chờ trong khi chốt số liệu."
      },
      placeholderKeyowrds: {
        type: String,
        default: "Tìm kiếm ..."
      },
      state_query: {
        type: Array,
        default: () => [],
      },
      filter_options: {
        type: Array,
        default: () => [],
      },
      breadcrumbs: {
        type: Object,
        default: {},
      },
      simple: {
        type: Boolean,
        default: false,
      },
      export_title: {
        type: String,
        default: "",
      },
      site: {
        type: String,
        default: "",
      },
      report: {
        type: Object,
        default: null
      },
      multiple: {
        type: Boolean,
        default: true,
      },
      keywords_state: {
        type: Boolean,
        default: true,
      },
      filter_type: {
        type: Array,
        default: [
          {
            typeCode: "df",
            typeName: "Tìm không dấu",
          },
          {
            typeCode: "cf",
            typeName: "Tìm có dấu",
          },
        ],
      },
      customFilterData: {
        type: Object,
        default: null,
      },
      openSearchTool: {
        type: Boolean,
        default: false
      },
      inlineFilter: {
        type: Boolean,
        default: false
      },
      inlineSearch: {
        type: Boolean,
        default: false
      }
    },
    methods: {
      async getFilterMenu(config, val) {
        let vm = this;
        if (String(val).indexOf('-') > 0) {
            let [fromQ, toQ] = String(val).split('-')
            vm.breadcrumbsData.push({
                text: fromQ.replace('.0', '') + ' đến ' + toQ.replace('.0', ''),
                disabled: false,
                href: 'javascript:;'
            })
        } else if (val !== undefined && val !== null && val !== '') {
            let filter = {
                shortName: val,
            }
            if (config.hasOwnProperty('dictCollection')) {
                filter['dictCollection._source.shortName'] = config['dictCollection'];
            }
            await ctx.root.$store.dispatch('vuejx_manager/userOne', {
                db: localStorage.getItem("db"),
                collection: config['collection'],
                filter: filter,
                keys: {
                    shortName: 1,
                    title: 1
                }
            }).then(data => {
                if (data !== undefined && data !== null) {
                    vm.breadcrumbsData.push({
                        text: data['title'],
                        disabled: false,
                        href: 'javascript:;'
                    })
                }
            }).catch(err => {});
        }
      },
      async getSearchItems() {
          let vm = this;
          vm.preRender = false;
          vm.itemsFilter = [];
          vm.searchObj = {};
          let objectFilter = {};
          for (const el of vm.keyFilterItems) {
              objectFilter[el['keyCode']] = el;
          }
          let objCHK = {}
          for (let el of vm.itemsFilter) {
              objCHK[el['keyName']] = el['keyName']
          }
          await vm.pullDataSource();
          if (vm.itemsFilter.length > 0) {
              vm.searchAdvanced = true;
          }
          vm.preRender = true;
          vm.searchObjNONE = {};
      },
      addSearchItem() {
          this.preRender = false;
          this.itemsFilter.push(this.keyFilterItems[0])
          this.preRender = true;
      },
      showSearchAdvanced() {
        //vm.keywords = '';
        let vm = this;
        vm.searchAdvanced = !vm.searchAdvanced;
        let query = window.Vue.router.currentRoute.value.query;
        if (!vm.searchAdvanced && query.adv_filter) {
            let querySearch = []
            for (let key in vm.customadv) {
                if (key != '_view' && key != '_tree_index' && key != '_tree') {
                    querySearch.push({
                        key: key,
                        value: ''
                    })
                }
            }
            querySearch.push({
                key: 'adv_filter',
                value: ''
            })
            let extQe = null;
            if (query._view) {
              extQe = {
                  _view: query._view,
                  //adv_filter: true
              };
              if (query._tree_index) {
                extQe['_tree_index'] = query._tree_index
              }
              if (query._tree) {
                extQe['_tree'] = query._tree
              }
            }
            window.Vue.redirect(querySearch, true, null, true, vm.multiple, true, extQe);
        }
      },
      getDataReSource(api) {
          return new Promise((resolve, reject) => {
              window.Vue.$axios.get(api)
                  .then(response => {
                      if (response.data.data.search !== null) {
                          resolve(response.data.data.search.hits.hits)
                      } else {
                          resolve([])
                      }
                  })
                  .catch(error => {
                      reject()
                  })
          })
      },
      submitSearch(e, typexx) {
          if (this.customadv) {
          }
          if (!this.inlineSearch && ((e && (e.keyCode === 13 || e.type === 'click')) || e === undefined || typexx === 'cbx')) {
              this.rawSearc();
          } else {
            this.$emit("inlineSearchAction", {
              keywords: this.keywords,
              customadv: this.customadv
            });
          }
      },
      clearSearch() {
        this.keywords = '';
        this.customadv = {};
        this.submitSearch()
      },
      rawSearc() {
          let vm = this;
          let query = window.Vue.router.currentRoute.value.query;

          let querySearch = []
          if (vm.keywords !== undefined && vm.keywords !== '') {
              querySearch.push({
                  key: 'keywords',
                  value: String(vm.keywords).trim()
              })
          } else {
              querySearch.push({
                  key: 'keywords',
                  value: ''
              })
          }
          if (vm.itemsFilter.length > 0) {
              querySearch.push({
                  key: 'adv_filter',
                  value: true
              });
              vm.searchAdvanced = true;
          } else {
              querySearch.push({
                  key: 'adv_filter',
                  value: ''
              })
              vm.searchAdvanced = false;
          }
          querySearch.push({
              key: '_page',
              value: '1'
          })
          querySearch.push({
              key: 'typeView',
              value: ''
          })

          if (query._tree_index) {
            querySearch.push({
                key: '_tree_index',
                value: query._tree_index
            })
          }
          if (query._tree) {
            querySearch.push({
                key: '_tree',
                value: query._tree
            })
          }
          let breakSearch = true;
          for (let el of querySearch) {
              if (el['key'] !== '_page' && el['key'] !== 't' && el['key'] !== '_filterAction' && el['value'] !== undefined && el['value'] !== null && el['value'] !== '') {
                  breakSearch = false;
                  break;
              }
          }
          if (breakSearch) {
              querySearch.push({
                  key: '_filterAction',
                  value: ''
              })
          } else {
              querySearch.push({
                  key: '_filterAction',
                  value: 'search'
              })
          }
          if (Object.keys(vm.customadv).length > 0 && vm.customadv.constructor === Object) {
              querySearch = []
              if (vm.keywords !== undefined && vm.keywords !== '') {
                  querySearch.push({
                      key: 'keywords',
                      value: String(vm.keywords).trim()
                  })
              } else {
                  querySearch.push({
                      key: 'keywords',
                      value: ''
                  })
              }
              let indexAdvS = 0;
              console.log('vm.customadvvm.customadv=', vm.customadv, vm.filter_options);
              for (let el of vm.filter_options) {
                if (el.keyCode && vm.customadv[el.keyCode]) {
                    indexAdvS = indexAdvS + 1;
                }
                if (el.fields == "date_range" && vm.customadv[el.keyCode + '_from'] && vm.customadv[el.keyCode + '_to']) {
                  indexAdvS = indexAdvS + 1;
                  querySearch.push({
                      key: el.keyCode + '_from',
                      value: vm.customadv[el.keyCode + '_from']
                  })
                  querySearch.push({
                    key: el.keyCode + '_to',
                    value: vm.customadv[el.keyCode + '_to']
                })
                }
                querySearch.push({
                    key: el.keyCode,
                    value: vm.customadv[el.keyCode]
                })
              }
              if (!vm.searchAdvanced && indexAdvS > 0) {
                  querySearch.push({
                      key: 'adv_filter',
                      value: true
                  });
                  vm.searchAdvanced = true;
              }

              let extQe = null;
              if (query._view) {
                extQe = {
                    _view: query._view,
                    //_id: query._id
                };
                if (query._tree_index) {
                  extQe['_tree_index'] = query._tree_index
                }
                if (query._tree) {
                  extQe['_tree'] = query._tree
                }
              }
              if (vm.state_query && Array.isArray(vm.state_query)) {
                for (const key in vm.state_query) {
                  querySearch.push({
                    key: vm.state_query[key],
                    value: query[vm.state_query[key]] ? query[vm.state_query[key]] : ''
                  });
                }
              }
              if (query._id) {
                querySearch.push({
                  key: '_id',
                  value: query._id
                });
              }
              console.log('querySearchquerySearch', querySearch, extQe);
              window.Vue.redirect(querySearch, true, null, true, vm.multiple, true, extQe);
          } else {
              if (vm.state_query && Array.isArray(vm.state_query)) {
                for (const key in vm.state_query) {
                  querySearch.push({
                    key: vm.state_query[key],
                    value: query[vm.state_query[key]] ? query[vm.state_query[key]] : ''
                  });
                }
              }
              window.Vue.redirect(querySearch, true, null, false, vm.multiple);
          }
      },
      collapseMenu() {
          this.collapse = !this.collapse;
          this.showBread = !this.showBread;
          this.$emit("collapseMenu");
      },
      toPage() {
          this.$emit("toPage");
      },
      async pullDataSource() {
          let vm = this;
          vm.renderData = false;
          vm.renderData = true;
      },
      exportData() {
          this.$emit("export");
      },
      pickKyBaoCao(data) {
          let vm = this;
          vm.customadv[vm.dataKyBaoCao['TuNgay']] = data._source?.TuNgay;
          vm.customadv[vm.dataKyBaoCao['DenNgay']] = data._source?.DenNgay;
          vm.customadv[vm.dataKyBaoCao['TuNgay']] = data._source?.TuNgay;

          for (let key in vm.dataKyBaoCao) {
              if (String(key).endsWith('Key')) {
                  vm.customadv[vm.dataKyBaoCao[key]] = vm.dataKyBaoCao[String(key).slice(0, -3)]
              }
          }
          vm.rawSearc();
      },
      exportDataBaoCao() {
          this.$emit("export", {
              MauBaoCao: this.dataKyBaoCao,
              KyBaoCao: this.pickKy.MaMuc._source
          });
      },
      changeDataDate(data) {
        let vm = this
        console.log(data, vm.customadv)
      }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
              vm.renderLoginComp = false;
              const newRoute = window.Vue.router.currentRoute.value;
              vm.siteCur = localStorage.getItem('site');
             
              if (newRoute.query.hasOwnProperty('keywords') && newRoute.query.keywords !== '') {
                  if (vm.keywords_state && !vm.inlineSearch) {
                      vm.keywords = decodeURIComponent(newRoute.query.keywords);
                  } else {
                      vm.keywords = '';
                  }
              }
              await vm.getSearchItems()
      
              if (newRoute.query.hasOwnProperty('adv_filter') && newRoute.query['adv_filter'] === 'true') {
                  vm.searchAdvanced = true;
              }
              for (let key in newRoute.query) {
                  if (key !== '_id' && key !== '_page' && key !== 'adv_filter' && key !== 't' && key !== '_filterAction') {
                      vm.customadv[key] = newRoute.query[key];
                  }
              }
              if (vm.report) {
                  let bodyQueryBC = {
                      "size": 1,
                      "query": {
                          "bool": {
                              "filter": {
                                  "match": {
                                      "MaDinhDanh": vm.report.MaDinhDanh
                                  }
                              }
                          }
                      }
                  }
                  const queryBC = `query search($token: String, $body: JSON, $db: String, $collection: String) {
                      results: search(token: $token, body: $body, db: $db, collection: $collection )
                  }`
                  await window.Vue.$root.dispatch('vuejx_manager/graphqlQuery', {
                      query: queryBC,
                      variables: {
                          body: bodyQueryBC,
                          db: localStorage.getItem("db"),
                          collection: vm.report.collection
                      }
                  }).then(data => {
                      if (data.results !== null) {
                          vm.dataKyBaoCao = data.results.hits.hits[0]['_source'];
                      } else {
                          vm.dataKyBaoCao = {};
                      }
                  }).catch(err => {
                      vm.dataKyBaoCao = {};
                  });
              }
              setTimeout(() => {
                  vm.renderLoginComp = true;
                  if (vm.openSearchTool) {
                      vm.searchAdvanced = true;
                  }
              }, 200);
            }, 0);
        });
    },
    data: ()  => ({
      itemsFilter: [],
      searchAdvanced: false,
      keyFilterItems: [],
      keyFilterItemsTemp: [],
      typeFilterItems: [],
      collapse: false,
      breadcrumbsData: [],
      showBread: true,
      preRender: false,
      keywords: '',
      renderData: false,
      searchObj: {},
      searchObjNONE: {},
      customadv: {},
      siteCur: '',
      renderLoginComp: false,
      dataKyBaoCao: {},
      pickKy: {}
    }),
    template: `
    <div class="qlt_timkiem flex-1">
      <div class="toolbar-search">
        <header class="flex items-center">
          <div class="flex w-full">
              <div class="flex flex-wrap items-stretch w-full mb-0 relative">
                <div class="w-full">
                  <input
                    class=" w-full p-2 focus:outline-none focus:cursor-text border border-gray-400 text-gray-700 focus:bg-white focus:border-gray-400"
                    v-model="keywords"
                    v-on:keyup="submitSearch"
                    :placeholder="placeholderKeyowrds"
                  />
                </div>
              </div>
          </div>
          <div class="flex ml-auto flex-1 ext___filter_ml_search">
            <slot name="filter_button" 
              v-bind:collapse="collapse"
              v-bind:submitSearch="submitSearch"
              v-bind:showSearchAdvanced="showSearchAdvanced"
              v-bind:clearSearch="clearSearch">
              <button aria-label="btn"
                class="font-semibold rounded px-3 pb-1 leading-none focus:outline-none bg-primary text-white min-w-full ml-1"
                style="min-width: 85px;min-height: 32px;"
                tabindex="-1"
                @click="submitSearch"
                v-if="simple"
              >
                Tìm kiếm
              </button>
              <button aria-label="btn"
                class="font-semibold rounded px-3 py-2 leading-none focus:outline-none border border-primary text-primary min-w-full ml-1"
                style="min-width: 90px;min-height: 32px;"
                tabindex="-1"
                @click="showSearchAdvanced"
                v-else-if="!simple && !inlineFilter"
              >
                {{ searchAdvanced ? 'Xoá bộ lọc' : 'Nâng cao'}}
              </button>
              <button aria-label="btn"
                class="font-semibold rounded px-3 py-2 leading-none focus:outline-none bg-primary text-white min-w-full ml-1"
                style="min-width: 90px;min-height: 32px;"
                tabindex="-1"
                @click="exportData"
                v-else-if="export_title !== '' && String(simple) !== 'true'"
              >
                {{ export_title }}
              </button>
              <button aria-label="btn"
                class="font-semibold rounded px-3 pb-1 leading-none focus:outline-none bg-primary text-white min-w-full ml-1"
                style="min-width: 115px;min-height: 32px;"
                tabindex="-1"
                @click="toPage"
                v-else-if="export_title === '' && String(simple) !== 'true'"
              >
                <i
                  class="mdi mdi-playlist-plus"
                  style="font-size: 14px;"
                ></i>
                Thêm mới
              </button>
              <button aria-label="btn"
                class="font-semibold rounded px-3 py-2 leading-none focus:outline-none border border-primary text-primary min-w-full ml-1"
                style="min-width: 40px;min-height: 32px;"
                tabindex="-1"
                @click="toPage" v-if="!simple"
              >
                <i
                  class="mdi mdi-playlist-plus"
                  style="font-size: 14px;"
                ></i>
              </button>
              <button aria-label="btn"
                class="font-semibold rounded px-3 py-2 leading-none focus:outline-none border border-primary text-primary min-w-full ml-1"
                style="min-width: 40px;min-height: 32px;"
                tabindex="-1"
                @click="collapseMenu"
                v-if="!simple"
              >
                <i v-if="!collapse"
                  class="mdi mdi-arrow-collapse-all"
                  style="font-size: 14px;"
                ></i>
                <i v-else
                  class="mdi mdi-arrow-expand-all"
                  style="font-size: 14px;"
                ></i>
              </button>
            </slot>
            <slot name="tfilter_inline" v-bind:filter="customadv" v-bind:submitSearch="submitSearch">
              <template v-if="inlineFilter && filter_options.length > 0">
                <v-layout wrap class="-mr-2 flex-1">
                  <template  v-for="(item, index) in filter_options" :key="index">
                    <v-flex 
                      v-if="renderData"
                      :class="[{'xs12 sm3 px-2': !item.class}, item.class]"
                    >
                      <vuejx-autocomplete
                        class="vuejx_combobox_selection"
                        v-if="item['fields'].toLocaleLowerCase() === 'autocomplete' && !item['dynamicAPI']"
                        :config='{
                            re_pull: customadv[item.keyCode],
                            hidden_label: true,
                            object: false,
                            model: item["keyCode"],
                            itemText: item["itemText"] ? item["itemText"] : "_source.TenMuc",
                            itemValue: item["itemValue"] ? item["itemValue"] : "_source.MaMuc",
                            placeholder: item["placeholder"],
                            data: item["items"],
                            link: item["link"],
                            condition: item["condition"],
                            column: item["column"] ? item["column"] : ["MaMuc", "TenMuc", "type"],
                            sort: item["sort"],
                            advFilter: true
                        }'
                        v-model:data="customadv"
                        v-model='customadv[item.keyCode]'
                        @change_data="submitSearch($event, 'cbx')"
                      ></vuejx-autocomplete>

                      <vuejx-autocomplete 
                        v-if="item['fields'].toLocaleLowerCase() === 'autocomplete' && item['dynamicAPI']"
                        :dynamicAPI="true" :delay="800" :maxItem="20" :config='{
                        re_pull: customadv[item.keyCode],
                        placeholder: item.placeholder,
                        hidden_label: true,
                        model: item["keyCode"],
                        itemText: item["itemText"] ? item["itemText"] : "_source.TenMuc",
                        itemValue: item["itemValue"] ? item["itemValue"] : "_source.MaMuc",
                        object: false,
                        data: item["items"],
                        link: item["link"],
                        condition: item["condition"],
                        column: item["column"] ? item["column"] : ["MaMuc", "TenMuc", "type"],
                        sort: item["sort"],
                        advFilter: true,
                        dynamicText: item["dynamicText"]
                        }'
                        v-model:data="customadv"
                        v-model='customadv[item.keyCode]'
                        @change_data="submitSearch($event, 'cbx')">
                      </vuejx-autocomplete>
                      <input
                        class="w-full p-2 focus:outline-none focus:cursor-text w-full border border-gray-400 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                        v-model='customadv[item.keyCode]'
                        v-if="item['fields'].toLocaleLowerCase() === 'input'"
                        v-on:keyup="submitSearch"
                      />
                      <div class="flex flex-wrap -mx-1" v-if="item['fields'].toLocaleLowerCase() === 'date_range'">
                        <vuejx-date-combobox class="flex-0 px-1 xs6 pr-3" v-model='customadv[item.keyCode + "_from"]' :data-value="customadv[item.keyCode + '_from']" v-model:data="customadv" :config="{
                            model: item.keyCode + '_from'
                          }">
                        </vuejx-date-combobox>
                        <vuejx-date-combobox class="flex-1" v-model='customadv[item.keyCode + "_to"]' :data-value="customadv[item.keyCode + '_to']" v-model:data="customadv" :config="{
                            model: item.keyCode + '_to'
                          }">
                        </vuejx-date-combobox>
                      </div>
                      <template v-else-if="item['fields'].toLocaleLowerCase() === 'date'">
                        <vuejx-date-combobox v-model='customadv[item.keyCode]' v-model:data="customadv" :config="{
                            model: item.keyCode
                          }">
                        </vuejx-date-combobox>
                      </template>
                    </v-flex>
                  </template>
                </v-layout>
              </template>
            </slot>
          </div>
        </header>
      </div>
    </div>
    <div class="searchAdvanced-content py-1">
      <v-flex class="xs12 px-0" v-if="searchAdvanced && !inlineFilter">
        <slot name="tfilter" v-bind:filter="customadv" v-bind:submitSearch="submitSearch">
          <template v-if="filter_options.length > 0">
            <v-layout wrap class="mb-1 -mx-2">
              <template  v-for="(item, index) in filter_options" :key="index">
                <v-flex 
                  v-if="renderData"
                  :class="[{'xs12 sm3 px-2': !item.class}, item.class]"
                >
                  <div class="block font-semibold leading-normal truncate">
                    {{ item.hasOwnProperty('keyName') ? item['keyName'] : item['keyCode'] }}
                  </div>
                  
                  <vuejx-autocomplete
                    class="vuejx_combobox_selection"
                    v-if="item['fields'].toLocaleLowerCase() === 'autocomplete' && !item['dynamicAPI']"
                    :config='{
                        re_pull: customadv[item.keyCode],
                        hidden_label: true,
                        object: false,
                        model: item["keyCode"],
                        itemText: item["itemText"] ? item["itemText"] : "_source.TenMuc",
                        itemValue: item["itemValue"] ? item["itemValue"] : "_source.MaMuc",
                        placeholder: item["placeholder"],
                        data: item["items"],
                        link: item["link"],
                        condition: item["condition"],
                        column: item["column"] ? item["column"] : ["MaMuc", "TenMuc", "type"],
                        sort: item["sort"],
                        advFilter: true
                    }'
                    v-model:data="customadv"
                    v-model='customadv[item.keyCode]'
                    @change_data="submitSearch($event, 'cbx')"
                  ></vuejx-autocomplete>

                  <vuejx-autocomplete 
                    v-if="item['fields'].toLocaleLowerCase() === 'autocomplete' && item['dynamicAPI']"
                    :dynamicAPI="true" :delay="800" :maxItem="20" :config='{
                    re_pull: customadv[item.keyCode],
                    placeholder: item.placeholder,
                    hidden_label: true,
                    model: item["keyCode"],
                    itemText: item["itemText"] ? item["itemText"] : "_source.TenMuc",
                    itemValue: item["itemValue"] ? item["itemValue"] : "_source.MaMuc",
                    object: false,
                    data: item["items"],
                    link: item["link"],
                    condition: item["condition"],
                    column: item["column"] ? item["column"] : ["MaMuc", "TenMuc", "type"],
                    sort: item["sort"],
                    advFilter: true,
                    dynamicText: item["dynamicText"]
                    }'
                    v-model:data="customadv"
                    v-model='customadv[item.keyCode]'
                    @change_data="submitSearch($event, 'cbx')">
                  </vuejx-autocomplete>
                  <input
                    class="w-full p-2 focus:outline-none focus:cursor-text w-full border border-gray-400 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                    v-model='customadv[item.keyCode]'
                    v-if="item['fields'].toLocaleLowerCase() === 'input'"
                    v-on:keyup="submitSearch"
                  />
                  <div class="flex flex-wrap -mx-1" v-if="item['fields'].toLocaleLowerCase() === 'date_range'">
                    <vuejx-date-combobox class="flex-0 px-1 xs6 pr-3" v-model='customadv[item.keyCode + "_from"]' :data-value="customadv[item.keyCode + '_from']" v-model:data="customadv" :config="{
                        model: item.keyCode + '_from'
                      }">
                    </vuejx-date-combobox>
                    <vuejx-date-combobox class="flex-1" v-model='customadv[item.keyCode + "_to"]' :data-value="customadv[item.keyCode + '_to']" v-model:data="customadv" :config="{
                        model: item.keyCode + '_to'
                      }">
                    </vuejx-date-combobox>
                  </div>
                  <template v-else-if="item['fields'].toLocaleLowerCase() === 'date'">
                    <vuejx-date-combobox v-model='customadv[item.keyCode]' :data-value="customadv[item.keyCode]" v-model:data="customadv" :config="{
                        model: item.keyCode
                      }">
                    </vuejx-date-combobox>
                  </template>
                </v-flex>
              </template>
            </v-layout>
          </template>
        </slot>
      </v-flex>
    </div>
    <div class="top-content flex items-center bg-white rounded p-1 w-full" v-if="report">
      <div class="text-green-700 uppercase font-bold"> {{ report.title }}</div>
      <template v-if="renderLoginComp">
        <div class="bar mx-4"></div>
        <div class="text-gray-500 text-xs">{{ dataKyBaoCao.TenGoi }}</div>
        <header class="flex items-center ml-auto">
          <div class="flex w-full">
            
            <vuejx-autocomplete :dynamicAPI="true" :delay="800" :maxItem="20" :config="{
                placeholder: report.placeholder,
                hidden_label: true,
                model: 'MaMuc',
                object: true, itemText: '_source.TenMuc',
                itemValue: '_source.MaMuc',
                link: [{ db: report.db, collection: report.collection_ky, dynamicText: 'MaMuc, TenMuc.keyword, TenMuc'}],
                column: ['type', 'MaMuc', 'TenMuc', 'TuNgay', 'DenNgay', 'LoaiKyBaoCao', 'pdfData'],
                sort: [ {MaMuc: 'desc'} ],
                }" v-model="pickKy['MaMuc']" v-model:data="pickKy" :site="site" @change_data="pickKyBaoCao">
            </vuejx-autocomplete>

          </div>
          <div class="flex ml-auto flex-1 ext___filter_ml"><button aria-label="btn" class="ml-3" @click="exportDataBaoCao"><i class="mdi mdi-download-circle-outline text-green-700"></i></button></div>
        </header>
      </template>
    </div>
    `
}