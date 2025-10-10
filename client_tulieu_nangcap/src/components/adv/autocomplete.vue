<script>
  import Multiselect from "../ext/multiselect";
  export default {
    components: {
      "Multiselect": Multiselect
    },
    props: {
        modelForm: { type: String, default: "" },
        modelFormIndex: { type: Number, default: -1 },
        prefix: {
            type: String,
            default: ""
          },
          dynamicAPI: {
            type: Boolean,
            default: false
          },
          id: {
            type: String,
            default: ""
          },
          config: {
            type: Object,
            required: true,
            default: () => {
              return {};
            }
          },
          text_style: {
            type: Boolean,
            default: false
          },
          call_onload: {
            type: Boolean,
            default: false
          },
          item: {
            type: Object,
            required: true,
            default: () => {
              return {};
            }
          },
          items: {
            type: Array,
            required: true,
            default: () => {
              return [];
            }
          },
          defaultVal: {
            type: Array,
            default: () => {
              return null;
            }
          },
          maxItem: {
            type: Number,
            required: false,
            default: 100
          },
          delay: {
            type: Number,
            required: false,
            default: 0
          },
          data: {
            type: Array,
            required: false,
            default: () => {
              return [];
            }
          },
          site: {
            type: String,
            default: () => {
              return localStorage.getItem('site');
            }
          },
          khac: {
            type: Object,
            default: () => {
              return null
            }
          },
          flatten: {
            type: Boolean,
            default: true
          },
          comp: {
            type: String,
            default: ""
          }
    },
    methods: {
        objectView(item, key, defaultVal) {
            return window.Vue.objectView(item, key, defaultVal)
          },
          async init() {
            let vm = this;
            if (vm.khac && vm.dataForm[vm.khac.model]) {
                let valK = {};
                valK[vm.khac.model] = vm.dataForm[vm.khac.model];
                valK[vm.config.model] = '';
                /*
                vm.$emit("update:data", {
                    ...vm.data, ...valK
                })
                */
                vm.valueKhac = vm.dataForm[vm.khac.model];
                vm.stateKhac = true;
            } else {
                vm.renderCBX = false;
                vm.renderCBXDynamic = false;
                if (vm.items && vm.items.length > 0) {
                if (typeof vm.items[0] !== 'object') {
                    vm.options = [];
                    for (let el of vm.items) {
                        vm.options.push({
                            _source: {
                                shortName: el,
                                title: vm.prefix ? vm.prefix + ' ' + el : el
                            }
                        });
                    }
                } else {
                    vm.options = vm.items;
                }
                } else if (vm.config['data'] && Array.isArray(vm.config['data']) && vm.config['data'].length > 0) {
                vm.options = vm.config['data'];
                } else if (!vm.config['object']) {
                    if (vm.config['re_pull']) {
                        vm.options = await vm.pullDataSource('');
                    }
                }
                if (vm.dataForm && vm.config['model'] && Array.isArray(vm.dataForm[vm.config['model']]) && vm.dataForm[vm.config['model']].length > 0) {

                if (typeof vm.dataForm[vm.config['model']][0] !== 'object') {
                    vm.value = [];
                    for (let el of vm.dataForm[vm.config['model']]) {
                        vm.value.push({
                            _source: {
                                shortName: el,
                                title: vm.prefix ? vm.prefix + ' ' + el : el
                            }
                        });
                    }
                } else {
                    vm.value = vm.dataForm[vm.config['model']];
                }
                } else {
                    if ((String(vm.config['model']).match(/\./g) || []).length >= 2) {
                        if (vm.dataForm[vm.config['model']]) {
                        vm.value = vm.dataForm[vm.config['model']];
                        } else {
                        vm.value = vm.objectViewObject(vm.dataForm, vm.config['model']);
                        }
                    } else {
                        if (vm.dataForm[vm.config['model']]) {
                        vm.value = vm.dataForm[vm.config['model']];
                        } else {
                        vm.value = vm.objectViewObject(vm.dataForm, vm.config['model']);
                        }
                    }
                    if (!vm.config['object']) {
                    let filteredArray = vm.options.filter(function(itm){
                            return vm.objectView(itm, vm.config['itemValue']) == vm.data[vm.config['model']];
                    });
                    if (filteredArray && Array.isArray(filteredArray)) {
                            vm.value = filteredArray[0];
                    }
                }
                }
                // init data
                if (vm.dataForm && vm.config["model"] && vm.config["multiple"] && vm.dataForm[vm.config["model"]] && !Array.isArray(vm.dataForm[vm.config["model"]])) {
                    vm.dataForm[vm.config["model"]] = [vm.dataForm[vm.config["model"]]];
                }
                if (vm.config['multiple'] && !Array.isArray(vm.value)) {
                    vm.value = [];
                }
                if (vm.defaultVal && !vm.value) {
                    vm.value = vm.defaultVal;
                    vm.dataForm[vm.config["model"]] = vm.value;
                }
                setTimeout(() => {
                    vm.renderCBX = true;
                    vm.renderCBXDynamic = true;
                }, 0);
                //vm.$emit("input", vm.dataForm[vm.config["model"]]);
            }
            if (vm.dynamicAPI && window.Vue.router.currentRoute.value.query[vm.config['model']] && vm.options) {
                vm.value  = vm.options[0]
            }
          },
          async changeCBX(data) {
              let vm = this;
              vm.dataForm = vm.data;
              vm.dataForm[vm.config["model"]] = data;
              if (data && !Array.isArray(data)) {
                  if (typeof data === 'object') {
                      if (vm.config["object"]) {
                          try {
                              if (vm.config['model'] && String(vm.config['model']).indexOf('TinhThanh') !== -1) {
                                  for (let keyTT in vm.dataForm) {
                                      if (String(keyTT).startsWith(String(vm.config['model']).replace('TinhThanh', 'QuanHuyen'))) {
                                          vm.dataForm[keyTT] = null;
                                      } else if (String(keyTT).startsWith(String(vm.config['model']).replace('TinhThanh', 'PhuongXa'))) {
                                          vm.dataForm[keyTT] = null;
                                      }
                                  }
                              } else if (vm.config['model'] && String(vm.config['model']).indexOf('QuanHuyen') !== -1) {
                                  for (let keyTT in vm.dataForm) {
                                      if (String(keyTT).startsWith(String(vm.config['model']).replace('QuanHuyen', 'PhuongXa'))) {
                                          vm.dataForm[keyTT] = null;
                                      }
                                  }
                              }
                          } catch (error) {
                          }
                      } else {
                      }
                  }
              } else if (Array.isArray(data) && data.length === 0 || data === undefined || data === null) {
                  vm.dataForm[vm.config["model"]] = null;
              }
              vm.bindSelectedData();
          },
          async bindSelectedData() {
            let vm = this;
            let arrayNone = [];
            if (Array.isArray(vm.items) && vm.items.length > 0 && Array.isArray(vm.dataForm[vm.config["model"]])) {
              if (typeof vm.items[0] !== 'object') {
                  for (let el of vm.dataForm[vm.config["model"]]) {
                    if (el && el._source) {
                      arrayNone.push(el._source.shortName);
                    }
                  }
              }
            }
            if (Array.isArray(arrayNone) && arrayNone.length > 0) {
              vm.dataForm[vm.config["model"]] = arrayNone;
            }
            if (vm.dataForm[vm.config["model"]]) {
                if (Array.isArray(vm.dataForm[vm.config["model"]])) {
                    let indexFix = 0
                    for (let el of vm.dataForm[vm.config["model"]]) {
                        delete el['_index']
                        delete el['_score']
                        delete el['_type']
                        vm.dataForm[vm.config["model"]][indexFix] = window.Vue.backward(el)
                        indexFix++
                    }
                }
                let objectPick = {};
                objectPick[vm.config["model"]] = vm.dataForm[vm.config["model"]];
                if (!window.Vue && !window.Vue.pickBy) {
                    await window.sleep(500);
                }
                if (vm.comp == 'TinhThanh') {
                    if (window.Vue.set && vm.config["modelRoot"]) {
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.type', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.type', null)
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                    }
                } else if (vm.comp == 'QuanHuyen') {
                    if (window.Vue.set && vm.config["modelRoot"]) {
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.type', null)
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.PhuongXa'])
                    }
                } 
                if (vm.flatten) {
                    objectPick = window.Vue.flattenKeys(objectPick);
                    vm.dataForm = { ...vm.dataForm, ...objectPick };
                }
            } else {
                if (vm.comp == 'TinhThanh') {
                    if (window.Vue.set && vm.config["modelRoot"]) {
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.TinhThanh._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.type', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.type', null)
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.TinhThanh', vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.TinhThanh', vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.TinhThanh', vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                    }
                } else if (vm.comp == 'QuanHuyen') {
                    if (window.Vue.set && vm.config["modelRoot"]) {
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.QuanHuyen._source.type', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._id', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.MaMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.TenMuc', null)
                        window.Vue.set(vm.dataForm , vm.config["modelRoot"] + '.PhuongXa._source.type', null)
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                        vm.dataForm = window.Vue.omit(vm.dataForm, [vm.config["modelRoot"] + '.QuanHuyen', vm.config["modelRoot"] + '.PhuongXa'])
                    }
                }
            }
                vm.$emit("update:data", vm.dataForm);
                vm.$emit("change_raw", vm.dataForm);
              if (vm.config["object"]) {
                  vm.$emit('change', vm.dataForm[vm.config["model"]]);
                  vm.$emit('change_data', vm.dataForm[vm.config["model"]]);
                  vm.$emit('change_data_field',  vm.dataForm[vm.config["model"]]);
                  vm.$emit("input", vm.dataForm[vm.config["model"]]);
              } else {
                  if (!vm.config["multiple"]) {
                      vm.dataForm[vm.config["model"]] = vm.objectView(vm.dataForm[vm.config["model"]], vm.config['itemValue']);
                      delete vm.dataForm[vm.config["model"] + '._id']
                      delete vm.dataForm[vm.config["model"] + '._type']
                      delete vm.dataForm[vm.config["model"] + '._index']
                      delete vm.dataForm[vm.config["model"] + '._score']
                      delete vm.dataForm[vm.config["model"] + '._source']
                      delete vm.dataForm[vm.config["model"] + '._source.MaMuc']
                      delete vm.dataForm[vm.config["model"] + '._source.TenMuc']
                      delete vm.dataForm[vm.config["model"] + '._source.type']
                      vm.$emit('change', vm.objectView(vm.dataForm[vm.config["model"]], vm.config['itemValue']));
                      vm.$emit('change_data', vm.objectView(vm.dataForm[vm.config["model"]], vm.config['itemValue']));
                      vm.$emit('change_data_field', vm.objectView(vm.dataForm[vm.config["model"]], vm.config['itemValue']));
                      vm.$emit("input", vm.objectView(vm.dataForm[vm.config["model"]], vm.config['itemValue']));
                  } else {
                      vm.$emit('change', vm.dataForm[vm.config["model"]]);
                      vm.$emit('change_data', vm.dataForm[vm.config["model"]]);
                      vm.$emit('change_data_field', vm.dataForm[vm.config["model"]]);
                      vm.$emit("input", vm.dataForm[vm.config["model"]]);
                  }
              }
          },
          async clearCBX() {
            let vm = this;
            vm.value = null;
            vm.dataForm[this.config["model"]] = null;
            vm.dataForm[this.config["model"] + '._id'] = null;
            this.bindSelectedData();
          },
          objectViewObject(item, key, defaultVal) {
            try {
              const data = item;
              const result = eval("data." + key);
              if (result === undefined || result === null) {
                return "";
              } else {
                return result;
              }
            } catch (error) {
              return defaultVal !== undefined && defaultVal !== null
                ? defaultVal
                : "";
            }
          },
          async openCBX() {
            let vm = this;
            vm.loading = true;
            if (vm.config['data'] && Array.isArray(vm.config['data'])) {
                vm.options = vm.config['data'];
            } else {
                  if (vm.dynamicAPI || String(vm.config['model']).indexOf('QuanHuyen') !== -1 || String(vm.config['model']).indexOf('PhuongXa') !== -1) {
                      vm.options = await vm.pullDataSource();
                  } else {
                      if (Array.isArray(vm.options) && vm.options.length === 0) {
                          vm.options = await vm.pullDataSource('');
                      }
                  }
                  if (vm.options && vm.options.length === 0) {
                      vm.noOptionsText = 'Không tìm thấy dữ liệu.'
                  }
            }
            vm.loading = false;
          },
          async pullDataSource(keyword) {
              let vm = this;
              if (vm.config?.disable) {
                return []
              }
              vm.renderCBXDynamic = false;
              if (!vm.dynamicAPI && vm.options && vm.options.length > 0) {
                  return vm.options;
              }
              if (vm.config.hasOwnProperty('link')) {
                  let siteData = vm.dataForm['site'];
                  if (!siteData) {
                      siteData = vm.site
                  }
                  if (localStorage.getItem('site')) {
                      siteData = localStorage.getItem('site')
                  }
                  if (window.Vue.router.currentRoute.value.params.site) {
                      siteData = window.Vue.router.currentRoute.value.params.site
                  }
                  
                  for (const link of vm.config.link) {
                      const query = `query search($token: String, $body: JSON, $db: String, $collection: String) {
                                  results: search(token: $token, body: $body, db: $db, collection: $collection )
                              }`
                      let shortTitle = localStorage.getItem('short_tinhthanh')
                      if (link.collection == 'C_TinhThanh' && shortTitle == '1') {
                        vm.config['itemText'] = '_source.TenMuc_RutGon'
                      }
                      let bodyQuery = {
                          "size": 10000,
                          "sort": link.collection == 'C_TinhThanh' && shortTitle == '1' ? [{'TenMuc_RutGon.keyword': 'asc'}] : vm.config.sort,
                          "_source": {
                              "includes": link.collection == 'C_TinhThanh' && shortTitle == '1' ? ['MaMuc', 'TenMuc', 'type', 'TenMuc_RutGon', 'VungMien'] : vm.config.column,
                          },
                          "query": {
                              "bool": {
                                  "filter": {
                                      "match": {
                                          "site": siteData
                                      }
                                  },
                                  "must": [
                                      {
                                          "bool": {
                                              "should": []
                                          }
                                      }
                                  ]
                              }
                          }
                      }
                      if (link.hasOwnProperty('dung_chung') && link['dung_chung'] || !siteData) {
                          delete bodyQuery['query']['bool']['filter'];
                      }
                      if (link.hasOwnProperty('depends_on')) {
                          let objectDepend = {};
                          let splisx = String(link['depends_on']).split('.');
                          let objectTmp = null;
                          for (let keyS of splisx) {
                              if (objectTmp === null) {
                                  objectTmp = vm.dataForm[keyS];
                              } else if (objectTmp !== undefined && typeof objectTmp === 'object') {
                                  objectTmp = objectTmp[keyS];
                              }
                          }
                          objectDepend[link['depends_on_link']] = objectTmp;
                          bodyQuery['query']['bool']['must'].push({
                              "bool": {
                                  "should": [
                                      {
                                          "match": objectDepend
                                      }
                                  ]
                              }
                          })
                      } else {
                          if (!link.hasOwnProperty('level') || (link.hasOwnProperty('level') && link['level'])) {
                              bodyQuery['query']['bool']['must'].push({
                                  "bool": {
                                      "should": [
                                          {
                                              "match": {
                                                  "level": 1
                                              }
                                          },
                                          {
                                              "bool": {
                                                  "must_not": {
                                                      "exists": {
                                                          "field": "level"
                                                      }
                                                  }
                                              }
                                          }
                                      ]
                                  }
                              })
                          }
                      }
                      if (link.hasOwnProperty('condition') && Array.isArray(link.condition) && link.condition.length > 0) {
                          for (const key in link.condition) {
                              bodyQuery['query']['bool']['must'].push(link.condition[key])
                          }
                      }
                      if (link.hasOwnProperty('visibility') && link.collection === 'vuejx_page') {
                          bodyQuery['query']['bool']['must'].push({
                              match: {
                                  "site": vm.dataForm['shortName']
                              }
                          })
                          bodyQuery['query']['bool']['must'].push({
                              match: {
                                  "visibility": link.visibility
                              }
                          })
                      }
      
                      if (link.collection === 'dict_item') {
                          link.collection = 'dict_item'
                          let dictCollection = ''
                          if (!link.hasOwnProperty('dictCollection') && vm.dataForm['dictCollection'] !== undefined) {
                              dictCollection = vm.dataForm['dictCollection']['_source']['shortName']
                          } else {
                              dictCollection = link.dictCollection
                          }
                          if (dictCollection !== undefined && dictCollection !== null && dictCollection !== '') {
                              bodyQuery['query']['bool']['must'].push({
                                  match: {
                                      "dictCollection._source.shortName": dictCollection
                                  }
                              })
                          }
                      }
                      if (!link.hasOwnProperty('storage')) {
                          bodyQuery['query']['bool']['must'].push({
                              match: {
                                  storage: 'regular'
                              }
                          })
                      } else if (link.hasOwnProperty('storage')) {
                          bodyQuery['query']['bool']['must'].push({
                              match: {
                                  storage: link.storage
                              }
                          })
                      }
      
                      if (keyword) {
                          let keywordSea = keyword.toLocaleLowerCase()
                          .replace(/,/g, " ")
                          .replace(/\./g, " ")
                          .replace(/-/g, " ")
                          .replace(/–/g, " ")
                          .replace(/:/g, " ")
                          .replace(/\//g, " ")
                          .replace(/  /g, " ");
                          
                          const keySearchSplit = keywordSea.split(' ');
                          
                          let keyToDynamic = {};
      
                          let conditonTieuDe = {
                              bool: {
                                  must: [
                                      {
                                          "match_phrase_prefix": keyToDynamic
                                      }
                                  ]
                              }
                          }
                          if (link.dynamicText && link.dynamicText.indexOf(',') !== -1) {
                              conditonTieuDe = {
                                  bool: {
                                      should: []
                                  }
                              }
                              for (let elText of link.dynamicText.split(',')) {
                                  let keyToDynamicMul = {}
                                  let dyMust = {
                                      bool: {
                                          must: [
                                              {
                                                  "match": keyToDynamicMul
                                              }
                                          ]
                                      }
                                  }
      
                                  if (String(elText).endsWith('.keyword')) {
                                      keyToDynamicMul[String(elText).trim()] = keyword;
                                      dyMust = {
                                          bool: {
                                              must: [
                                                  {
                                                      "match": keyToDynamicMul
                                                  }
                                              ]
                                          }
                                      }
                                  } else {
                                    keyToDynamicMul[String(elText).trim()] = keyword;
                                    dyMust = {
                                          bool: {
                                              must: [
                                                  {
                                                      "match_phrase_prefix": keyToDynamicMul
                                                  }
                                              ]
                                          }
                                    }
                                    /*
                                      keyToDynamicMul[String(elText).trim()] = keywordSea;
                                      
                                      for (const keyS of keySearchSplit) {
                                          let preX = {};
                                          preX[String(elText).trim()] = String(keyS).toLocaleLowerCase();
                                          if (Object.keys(preX).length > 0) {
                                              dyMust["bool"]["must"].push({
                                                  prefix: preX,
                                              });
                                          }
                                      }
                                    */
                                      
                                  }
                                  conditonTieuDe['bool']['should'].push(dyMust);
                              }
      
                          } else {
                              if (String(link.dynamicText).endsWith('.keyword')) {
                                  keyToDynamic[link.dynamicText] = keyword;
                                  conditonTieuDe = {
                                      bool: {
                                          must: [
                                              {
                                                  "match": keyToDynamic
                                              }
                                          ]
                                      }
                                  }
                              } else {
                                  keyToDynamic[link.dynamicText] = keywordSea;
                                  conditonTieuDe = {
                                      bool: {
                                          must: [
                                              {
                                                  "match_phrase_prefix": keyToDynamic
                                              }
                                          ]
                                      }
                                  }
                                  /*
                                  for (const keyS of keySearchSplit) {
                                      let preX = {};
                                      preX[link.dynamicText] = String(keyS).toLocaleLowerCase();
                                      if (Object.keys(preX).length > 0) {
                                          conditonTieuDe["bool"]["must"].push({
                                              prefix: preX,
                                          });
                                      }
                                  }
                                    */
                              }
                              
                          }
                          bodyQuery['query']['bool']['must'].push(conditonTieuDe);
                      }
                      if (vm.dynamicAPI) {
                          bodyQuery['size'] = vm.maxItem;
                          if (window.Vue.router.currentRoute.value.query[vm.config['model']]) {
                            if (!bodyQuery.query?.bool?.should) {
                                bodyQuery['query']['bool']['should'] = []
                            }
                            let keyToDynamicSelected = {}
                            let itemValueDynamic = vm.config['itemValue'].replace('_source\.', '')
                            keyToDynamicSelected[vm.config['model'].substring(vm.config['model'].lastIndexOf(itemValueDynamic))] = window.Vue.router.currentRoute.value.query[vm.config['model']]
                            bodyQuery['query']['bool']['should'].push({
                                "match": keyToDynamicSelected
                            })
                          }
                      }

                        if (!window.Vue && !window.Vue.pickBy) {
                            await window.sleep(500);
                        }
                      await window.Vue.$root.dispatch('vuejx_manager/graphqlQuery', {
                          query: query,
                          variables: {
                              body: bodyQuery,
                              db: link.db ? link.db : localStorage.getItem("db"),
                              collection: link.collection
                          }
                      }).then(data => {
                          if (data.results !== null) {
                              vm.options = data.results.hits.hits;
                              if (link.hasOwnProperty('nullVal') && link.nullVal !== undefined) {
                                  vm.options.unshift(link.nullVal);
                              }
                              if (vm.config['itemTextLv1']) {
                                let newOptions = [];
                                for (let elOPT of vm.options) {
                                  var dotObjectOPT = window.Vue.flattenKeys(elOPT);
                                  dotObjectOPT[vm.config['itemText'] + '___raw'] = dotObjectOPT[vm.config['itemTextLv1']] + ' - ' + dotObjectOPT[vm.config['itemText']];
                                  elOPT = window.Vue.backward(dotObjectOPT);
                                  newOptions.push(elOPT);
                                }
                                vm.options = newOptions;
                              }
                          } else {
                              vm.options = [];
                          }
                      }).catch(err => {
                          vm.options = [];
                      });
                  }
              } else if (vm.config.hasOwnProperty('link_mongo') && vm.config.link_mongo === '') {
                  await window.Vue.$root.dispatch('vuejx_manager/userDb', {}).then(data => {
                      if (data !== undefined && data.hasOwnProperty('hits') && data.hits.hasOwnProperty('hits')) {
                          vm.options = data.hits.hits;
                          if (link.hasOwnProperty('nullVal') && link.nullVal !== undefined) {
                              vm.options.unshift(link.nullVal);
                          }
                      } else {
                          vm.options = [];
                      }
                  }).catch(err => {
                      vm.options = [];
                  });
              } else if (vm.config.hasOwnProperty('link_mongo') && vm.config.link_mongo !== '') {
                  vm.options = [];
                  for (const link of vm.config.link_mongo) {
                      await window.Vue.$root.dispatch('vuejx_manager/userMany', {
                          db: localStorage.getItem("db"),
                          collection: link.collection,
                          filter: link.filter,
                          limit: 1000,
                          keys: link.hasOwnProperty('keys') ? link.keys : {
                              shortName: 1,
                              title: 1,
                              type: 1
                          }
                      }).then(data => {
                          if (data !== undefined && data.hasOwnProperty('hits') && data.hits.hasOwnProperty('hits')) {
                              vm.options = data.hits.hits;
                              if (link.hasOwnProperty('nullVal') && link.nullVal !== undefined) {
                                  vm.options.unshift(link.nullVal);
                              }
                          }
                      }).catch(err => {
                      });
                  }
              }
              setTimeout(() => {
                vm.renderCBXDynamic = true;
              }, 0);
              vm.$emit('preAction', vm.options);

              return vm.options;
          },
          doKhac() {
              let vm = this;
              vm.stateKhac = !vm.stateKhac;
              if (vm.stateKhac) {
                vm.clearCBX();
              } else {
                if (confirm("Dữ liệu Khác sẽ bị xoá.")) {
                    vm.dataForm[vm.config[vm.khac.model]] = '';
                    vm.valueKhac = ''
                } else {
                    vm.stateKhac = true;
                }
              }
          }
    },
    watch: {
        valueKhac: async function (newValue) {
            let valK = {};
            valK[this.khac.model] = newValue;
            valK[this.config.model] = '';
            this.$emit("update:data", {
                ...this.data, ...valK
            })
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.dataForm = vm.data
            setTimeout(async () => {
                await vm.init();
            }, 0);
        });
    },
    data: ()  => ({
        value: null,
        options: [],
        loading: false,
        noOptionsText: 'loading ...',
        renderCBX: false,
        renderCBXDynamic: false,
        dataForm: {},
        stateKhac: false,
        valueKhac: ''
    })
  }
</script>
<template>
  <div class="relative vuejx_combobox_selection" :id="id">
        <div class="block font-semibold truncate" :class="config['label_class'] ? config['label_class'] : 'leading-normal'" v-if="!config['hidden_label'] || !config.hasOwnProperty('hidden_label')">{{ config.hasOwnProperty("label") ? config["label"] : config["model"] }}<span class="required__class" v-if="config['required']">*</span></div>
        <div class="flex flex-wrap items-stretch w-full mb-0 relative autocomplete bg-gray-200 rounded" 
            :class="[{'bg-gray-500 text-white pointer-events-none': config.disable, 'bg-gray-200 text-gray-700': !config.disable}, 'vuejx_cbx___' + String(config['model']).replace(/\./g, '____')]"
        style="min-height: 32px">
            <template v-if="!stateKhac">
                <Multiselect v-if="!dynamicAPI && renderCBX" :class="{'flex-1': khac}"
                    v-model="value"
                    :mode="config['multiple'] ? 'tags' : 'single'"
                    :placeholder="config['placeholder']"
                    :trackBy="config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'"
                    :label="config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'"
                    :valueProp="config['itemValue'] ? config['itemValue'] : '_source.shortName'"
                    :object="true" :search="true" :searchable="true" :options="options"
                    @change="changeCBX" @open="openCBX" :loading="loading"
                    :noOptionsText="config['noOptionsText'] ? config['noOptionsText'] : noOptionsText"
                    :noResultsText="config['noResultsText'] ? config['noResultsText'] : 'Không có dữ liệu.'"
                >
                    <template v-slot:singlelabel>
                    <div class="multiselect-single-label">
                        <slot name="custom_singlelabel"
                        :valData="value"
                        :config="config"
                        >
                        {{ (typeof value === 'string' ? value : objectView(value, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title')) === '' ? config['placeholder'] : typeof value === 'string' ? config['placeholder'] : objectView(value, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title') }}
                        </slot>
                    </div>
                    </template>
                    <template v-slot:tag="{ option, handleTagRemove, disabled }">
                    <div class="multiselect-tag is-user">
                        {{
                        objectView(
                            option,
                            config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'
                        )
                        }}
                        <i
                        v-if="!disabled"
                        @click.prevent
                        @mousedown.prevent.stop="handleTagRemove(option, $event)"
                        />
                    </div>
                    </template>
                    <template v-slot:option="{ option }">
                    <slot name="option" :option="option">
                        <span>{{ objectView(option, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title') }}</span>
                    </slot>
                    </template>
                </Multiselect>
                <Multiselect v-else-if="renderCBX" :class="{'flex-1': khac}"
                    v-model="value"
                    :mode="config['multiple'] ? 'tags' : 'single'"
                    :placeholder="config['placeholder']"
                    :trackBy="config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'"
                    :label="config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'"
                    :valueProp="
                    config['itemValue'] ? config['itemValue'] : '_source.shortName'
                    "
                    :object="true"
                    :filterResults="false"
                    :minChars="1"
                    :resolveOnLoad="true"
                    :delay="delay"
                    :searchable="true"
                    :options="async function(query) {
                        return await pullDataSource(query)
                    }"
                    @change="changeCBX"
                    @open="openCBX"
                    :loading="loading"
                    :noOptionsText="
                    config['noOptionsText'] ? config['noOptionsText'] : noOptionsText
                    "
                    :noResultsText="
                    config['noResultsText']
                        ? config['noResultsText']
                        : 'Không có dữ liệu.'
                    "
                >
                    <template v-slot:singlelabel>
                    <div class="multiselect-single-label">
                        <slot name="custom_singlelabel"
                        :valData="value"
                        :config="config"
                        >
                        {{ (typeof value === 'string' ? value : objectView(value, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title')) === '' ? config['placeholder'] : typeof value === 'string' ? config['placeholder'] : objectView(value, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title') }}
                        </slot>
                    </div>
                    </template>
                    <template v-slot:tag="{ option, handleTagRemove, disabled }">
                    <div class="multiselect-tag is-user">
                        {{
                        objectView(
                            option,
                            config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title'
                        )
                        }}
                        <i
                        v-if="!disabled"
                        @click.prevent
                        @mousedown.prevent.stop="handleTagRemove(option, $event)"
                        />
                    </div>
                    </template>
                    <template v-slot:option="{ option }">
                    <span>{{ objectView(option, config['itemText'] ? (config['itemTextLv1'] ? config['itemText'] + '___raw' : config['itemText']) : '_source.title') }}</span>
                    </template>
                </Multiselect>
            </template>
            <template v-else>
             <input v-model="valueKhac" class="bg-gray-200 text-gray-700 p-2 focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded flex-1" type="text" />
            </template>
            <template v-if="khac">
                <button @click="doKhac" class="leading-none font-semibold bg-blue-700 text-white ml-2 rounded px-4 py-2 focus:outline-none whitespace-nowrap flex-2" tabindex="-1">{{ dataForm[config[khac.model]] || stateKhac ? 'Quay lại' : khac.title }}</button>
            </template>
        </div>
    </div>
</template>
