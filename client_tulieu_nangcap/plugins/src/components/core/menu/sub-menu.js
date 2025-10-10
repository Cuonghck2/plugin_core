export default {
    props: {
        api: {
            type: String,
            default: () => {
              return "";
            },
          },
          api_report: {
            type: String,
            default: () => {
              return "";
            },
          },
          groupId: {
            type: String,
            default: () => {
              return "";
            },
          },
          token: {
            type: String,
            default: () => {
              return "";
            },
          },
          classMenu: {
            type: String,
            default: () => {
              return "text-xs font-semibold text-gray-700 leading-none focus:outline-none mb-2 border hover:bg-blue-100 hover:text-blue-500 flex";
            },
          },
          classMenuStatic: {
            type: String,
            default: () => {
              return "text-xs bg-white px-3 py-2 font-semibold text-gray-700 leading-none focus:outline-none mb-2 border hover:bg-blue-100 hover:text-blue-500 flex";
            },
          },
          sort: {
            type: Array,
            default: () => {
              return [ {'order': 'asc'} ];
            },
          },
          columns: {
            type: Array,
            default: () => {
              return [ 'type', 'MaMuc', 'TenMuc', 'PageGroup', 'targetURL' ];
            },
          },
          db: {
            type: String,
            default: () => {
              return localStorage.getItem("db");
            },
          },
          collection: {
            type: String,
            default: () => {
              return "";
            },
          },
          page_group: {
            type: String,
            default: () => {
              return "";
            },
          }
    },
    methods: {
        async pullDataSourceAPI() {
            let vm = this;
            const current = window.Vue.router.currentRoute.value;
            vm.menu_group = current.query['menu_group'] ? current.query['menu_group'] : ''
            vm.menu_group_step = current.query['step'] ? current.query['step'] : ''
            await window.Vue.$axios.post("/tbtv-service/post", {
              "headers": {
                  "headers": {
                  "accept": "application/json",
                  "groupid": vm.groupId,
                  'Authorization': 'Bearer ' + (vm.token ? vm.token : localStorage.getItem('token'))
                  }
              },
              "api": vm.api,
              "body": null,
              "method": "GET"
            }, {
              headers: {
                "Content-Type": "application/json"
              }
            })
            .then(function(responseX) {
                vm.submenus = [];
                if (responseX.data && Array.isArray(responseX.data.data)) {
                  for (const el of responseX.data.data) {
                    let steps = [];
                    if (Array.isArray(el['steps'])) {
                      for (let elStep of el['steps']) {
                        steps.push({
                          buttonConfig: elStep['buttonConfig'],
                          dossierStatus: elStep['dossierStatus'],
                          dossierSubStatus: elStep['dossierSubStatus'],
                          menuStepName: elStep['menuStepName'],
                          stepCode: elStep['stepCode'],
                          stepName: elStep['stepName'],
                          menuGroup: el['menuGroup']
                        })
                      }
                    } else {
                      steps = [ {
                        buttonConfig: el['buttonConfig'],
                        dossierStatus: el['dossierStatus'],
                        dossierSubStatus: el['dossierSubStatus'],
                        menuStepName: el['menuStepName'],
                        stepCode: el['stepCode'],
                        stepName: el['stepName']
                      } ]
                    }
                    vm.submenus.push({
                      _source: {
                        MaMuc: el['menuGroup'],
                        TenMuc: el['menuName'],
                        buttonConfig: el['buttonConfig'],
                        hasViewText: el['hasViewText'],
                        icon: el['icon'],
                        menuType: el['menuType'],
                        order: el['order'],
                        queryParams: el['queryParams'],
                        steps: steps
                      }
                    })
                  }
                }
            })
            .catch(function(xhr) {
             vm.submenus = [];
            });
            vm.menu_group_report = {};
            await window.Vue.$axios.post("/tbtv-service/post", {
              "headers": {
                  "headers": {
                  "accept": "application/json",
                  "groupid": vm.groupId,
                  'Authorization': 'Bearer ' + (vm.token ? vm.token : localStorage.getItem('token'))
                  }
              },
              "api": vm.api_report,
              "body": null,
              "method": "GET"
            }, {
              headers: {
                "Content-Type": "application/json"
              }
            })
            .then(function(responseX) {
                if (responseX.data && Array.isArray(responseX.data.data)) {
                  let menuGroupReport = {};
                  for (let el of responseX.data.data) {
                    if (el['stepName']) {
                      if (menuGroupReport[el['menuGroup']]) {
                        menuGroupReport[el['menuGroup']] += el['totalCount'];
                      } else {
                        menuGroupReport[el['menuGroup']] = el['totalCount'];
                      }
                      vm.menu_group_report[el['stepCode']] = el['totalCount']
                    }
                  }
                  vm.menu_group_report = { ...vm.menu_group_report, ...menuGroupReport }
                  for (let el of responseX.data.data) {
                    if (el['stepName']) {
                      
                    } else {
                      if (vm.menu_group_report[el['menuGroup']]) {
                      } else {
                        vm.menu_group_report[el['menuGroup']] = el['totalCount'];
                      }
                    }
                  }
                }
            })
            .catch(function(xhr) {
            });
          },
          async pullDataSource() {
            let vm = this;
            const current = window.Vue.router.currentRoute.value;
            let sitePage = current.params['site'] ? current.params['site'] : localStorage.getItem('site');
            let curPage = current.params['page'];
            const query = `query search($token: String, $body: JSON, $db: String, $collection: String) {
              results: search(token: $token, body: $body, db: $db, collection: $collection )
          }`
            let bodyQuery = {
              "size": 50,
              "sort": vm.sort,
              "_source": {
                "includes": vm.columns,
              },
              "query": {
                "bool": {
                  "filter": {
                    "match": {
                      "site": sitePage
                    }
                  },
                  "must": [
                    {
                      "match": {
                        "PageGroup": curPage
                      }
                    }
                  ]
                }
              }
            }
        
            if (vm.page_group) {
              bodyQuery['query']['bool']['must'] = [{
                "match": {
                  "PageGroup": vm.page_group
                }
              }];
            }
        
            await window.Vue.$root.dispatch('vuejx_manager/graphqlQuery', {
              query: query,
              variables: {
                body: bodyQuery,
                db: localStorage.getItem("db"),
                collection: vm.collection
              }
            }).then(data => {
              if (data.results !== null) {
                vm.submenus = data.results.hits.hits;
              } else {
                vm.submenus = [];
              }
            }).catch(err => {
              vm.submenus = [];
            });
            vm.$emit('preAction', vm.submenus);
            return vm.submenus;
          },
          toPage(targetURL, code) {
            if (targetURL === undefined || targetURL === null || targetURL === '') {
              const current = window.Vue.router.currentRoute.value;
              let sitePage = current.params['site'] ? current.params['site'] : localStorage.getItem('site');
              window.Vue.redirect([{
                key: '_id',
                value: ''
              }], true, '/' + current.params.visibility + '/' + sitePage + '/' + code, true);
            } else {
              window.location.href = targetURL;
            }
          },
          toPageFilter(item) {
            let vm = this;
            const uri = item.queryParams.substring(item.queryParams.indexOf('?') + 1)
            let regex = /[?&]([^=#]+)=([^&#]*)/g, match = {}, params = {};
            while (match = regex.exec("&" + uri)) {
              params[match[1]] = decodeURIComponent(match[2]);
            }
            let query = [{
              key: 'menu_group',
              value: item.MaMuc
            }, {
              key: '_id',
              value: ''
            }];
            for (let key in params) {
              if (key !== '_id') {
                query.push({
                  key: key,
                  value: params[key]
                })
              }
            }
            vm.menu_group = item.MaMuc
            vm.menu_group_step = ''
            window.Vue.redirect(query, true, '', true);
          },
          toPageFilterStep(item) {
            let vm = this;
            let query = [{
              key: 'menu_group',
              value: item.menuGroup
            }, {
              key: 'step',
              value: item.stepCode
            }, {
              key: '_id',
              value: ''
            }];
            vm.menu_group_step = item.stepCode
            window.Vue.redirect(query, true, '', true);
          }
    },
    watch: {
        $route: async function (newRoute, oldRoute) {
            let pageURL = window.location.hash.split('/');
            let pageSitePrepare = '';
            if (Array.isArray(pageURL) && pageURL.length > 0 && pageURL[pageURL.length - 1]) {
                if (String(pageURL[pageURL.length - 1]).indexOf('?') != -1) {
                    pageSitePrepare = String(pageURL[pageURL.length - 1]).substring(0, String(pageURL[pageURL.length - 1]).indexOf('?'))
                } else {
                    pageSitePrepare = pageURL[pageURL.length - 1]
                }
            }
            if (oldRoute.params.page == pageSitePrepare) {
                let vm = this;
                setTimeout(async () => {
                    const current = window.Vue.router.currentRoute.value;
                    vm.menu_group = current.query['menu_group'] ? current.query['menu_group'] : window.Vue.router.currentRoute.value.params.page
                }, 0);
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
                vm.submenus = []
                vm.renderMenu = false
                if (vm.api) {
                    await vm.pullDataSourceAPI();
                } else {
                    await vm.pullDataSource();
                }
                const current = window.Vue.router.currentRoute.value;
                vm.menu_group = current.query['menu_group'] ? current.query['menu_group'] : window.Vue.router.currentRoute.value.params.page
                vm.renderMenu = true
            }, 0);
        });
    },
    data: ()  => ({
        submenus: [],
        renderMenu: false,
        menu_group: '',
        menu_group_step: '',
        menu_group_report: {}
    }),
    template: `
    <div>
        <div class="flex">
        <template v-if="api && renderMenu">
            <button aria-label="btn"
            v-bind:class="[{ 'border-r-0': index < submenus.length - 1, 'border-l-0': index > 0, 'bg-blue-200': item._source.MaMuc == menu_group && menu_group }, classMenu, item._source.MaMuc]"
            tabindex="-1"
            v-for="(item, index) in submenus" v-bind:key="index"
            @click="toPageFilter(item._source)"
            >
            <div class="px-3 py-2">{{ item._source.TenMuc }} </div>
            <div class="-ml-1 bg-red-700 px-2 py-1 text-white rounded-lg mt-1 mr-3 font-normal counter">{{ menu_group_report[item._source.MaMuc] ? menu_group_report[item._source.MaMuc] : 0 }}</div>
            <template v-if="item._source.menuType == 1">
                <teleport to="#steps_submenu">
                <template v-for="(itemStep, indexStep) in item._source.steps" >
                    <button aria-label="btn" v-if="itemStep.menuGroup == menu_group && menu_group"
                    v-bind:class="[{ 'border-r-0': indexStep < item._source.steps.length - 1, 'border-l-0': indexStep > 0, 'bg-blue-200': itemStep.stepCode == menu_group_step && menu_group_step }, classMenu]"
                    tabindex="-1"
                    v-bind:key="indexStep"
                    @click="toPageFilterStep(itemStep)"
                    >
                    <div class="px-3 py-2">{{ itemStep.stepName }} </div>
                    <div class="-ml-1 bg-red-700 px-2 py-1 text-white rounded-lg mt-1 mr-3 font-normal">{{ menu_group_report[itemStep.stepCode] ? menu_group_report[itemStep.stepCode] : 0 }}</div>
                    </button>   
                </template>
                </teleport>
            </template>
            </button>
        </template>
        <template v-else-if="renderMenu">
            <button aria-label="btn"
            v-bind:class="[{ 'border-r-0': (index < submenus.length - 1 && menu_group !== item._source.MaMuc), 'bg-blue-200 border-blue-700 border-r-1': menu_group === item._source.MaMuc }, classMenuStatic, item._source.MaMuc]"
            tabindex="-1"
            v-for="(item, index) in submenus" v-bind:key="index"
            @click="toPage(item._source.targetURL, item._source.MaMuc)"
            >
            {{ item._source.TenMuc }}  
            </button>
        </template>
        </div>
        <div id="steps_submenu" class="flex">

        </div>
    </div>
    `
}