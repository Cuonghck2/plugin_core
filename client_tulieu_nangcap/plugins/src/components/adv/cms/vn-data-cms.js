export default {
    props: {
        crud: { type: Boolean, default: () => { return false } },
        remove: { type: Boolean, default: () => { return true } },
        import_data: { type: Boolean, default: () => { return true } },
        export_data: { type: Boolean, default: () => { return true } },
        tags: { type: Array, default: () => { return []; } },
        mode: { type: String, default: () => { return "edit"; } }
    },
    methods: {
        async init(renderList) {
            let vm = this;
            if (renderList) {
                vm.renderpage = 0
            } else {
                vm.renderpage++
            }
            const newRoute = window.Vue.router.currentRoute.value;
            let condition = {
                bool: {
                    should: []
                }
            };
            for (const el of vm.tags) {
                condition['bool']['should'].push({
                    "match": {
                        "tag": el
                    }
                })
            }
            if (newRoute.query['_collection']) {
                vm.collection = newRoute.query['_collection'];
                condition['bool']['should'].push({
                    "match": {
                        "shortName": {
                            "query": vm.collection,
                            "boost": 10
                        }
                    }
                })
            }
            if (newRoute.query['_id']) {
                vm.id = newRoute.query['_id'];
            }
            if (renderList) {
                vm.tableConfig = null;
                const searchData = await window.VueJX.search(vm, 'vuejx_collection', [], [], [condition], null, [ { _score: "desc" }, { order: 'asc' } ], 'regular', 10000, false, 10000);
                if (searchData && Array.isArray(searchData.dataResults) && searchData.dataResults.length > 0) {
                    vm.collections = searchData.dataResults;
                    if (Array.isArray(vm.collections) && vm.collections.length > 0) {
                        vm.detail = vm.collections[0]['_source'];
                        if (vm.detail.tableConfig && String(vm.detail.tableConfig).length > 20) {
                            vm.tableConfig = eval('( ' + vm.detail.tableConfig + ' )');
                        }
                        if (vm.detail.metadataConfig && String(vm.detail.metadataConfig).length > 20) {
                            vm.metadataConfig = eval('( ' + vm.detail.metadataConfig + ' )');
                            if (vm.metadataConfig && Array.isArray(vm.metadataConfig.form)) {
                                vm.metadataConfig.form.push({ type: 'done' });
                            }
                        } else {
                            vm.metadataConfig = {
                                type: 0,
                                form: [
                                    {
                                        model: 'MaMuc',
                                        type: 'text',
                                        class: 'xs12 sm4',
                                        label: 'Mã Mục:'
                                    },
                                    {
                                        model: "TenMuc",
                                        type: "text",
                                        class: "xs12 sm8",
                                        label: "TenMuc:"
                                    },
                                    { type: 'done' }
                                ]
                            }
                        }
                        if (vm.tableConfig && Array.isArray(vm.tableConfig.config_columns)) {
                            for (let el of vm.tableConfig.config_columns) {
                                el['value'] = el['field'];
                                el['title'] = el['headerText'];
                                el['width'] = el['width'];
                                if (!el['class']) {
                                    el['class'] = 'text-left';
                                }
                            }
                        } else {
                            vm.tableConfig = {
                                "title":"Danh sách",
                                "columns":[
                                   "MaMuc",
                                   "TenMuc"
                                ],
                                "config_columns":[
                                   {
                                      "field":"_source.MaMuc",
                                      "field_query":"MaMuc",
                                      "field_sort":"MaMuc",
                                      "headerText":"MaMuc",
                                      "class":"text-left",
                                      "width":250,
                                      "minWidth":250,
                                      "value":"_source.MaMuc",
                                      "title":"MaMuc"
                                   },
                                   {
                                      "field":"_source.TenMuc",
                                      "field_query":"TenMuc",
                                      "field_sort":"TenMuc",
                                      "headerText":"TenMuc",
                                      "class":"text-left",
                                      "value":"_source.TenMuc",
                                      "title":"TenMuc"
                                   }
                                ],
                                "filter_options":[
                                   {
                                      "keyName":"MaMuc",
                                      "keyCode":"MaMuc",
                                      "fields":"input",
                                      "class":"xs12 sm3 px-2",
                                      "model":"MaMuc"
                                   },
                                   {
                                      "keyName":"TenMuc",
                                      "keyCode":"TenMuc.raw",
                                      "fields":"input",
                                      "class":"xs12 sm3 px-2",
                                      "model":"TenMuc.raw"
                                   }
                                ],
                                "re_calculator": [
                                    {key: 'MaMuc', relation: 'eq'},
                                    {key: 'TenMuc.raw', relation: 'eq'}
                                ],
                                "sort":[
                                   {
                                      "createdAt":"asc"
                                   }
                                ]
                            }
                        }
                    } else {
                        vm.detail = null;
                        vm.tableConfig = null;
                        vm.metadataConfig = null;
                    }
                } else {
                    vm.collections = []
                    vm.detail = null;
                    vm.tableConfig = null;
                    vm.metadataConfig = null;
                }
            }
        },
        backCol() {
            let queryBuild = [];
            queryBuild.push({ key: "_id", value: "" })
            queryBuild.push({ key: "_t", value: new Date().getTime() })
            window.Vue.redirect(queryBuild);
        },
        pickColl(type, _id) {
            let queryBuild = [];
            queryBuild.push({ key: "_collection", value: type })
            queryBuild.push({ key: "_idCol", value: _id  })
            queryBuild.push({ key: "_id", value: "" })
            queryBuild.push({ key: "_pagging", value: "" })
            queryBuild.push({ key: "_page", value: "1" })
            queryBuild.push({ key: "_s_n", value: "" })
            queryBuild.push({ key: "_s_b", value: "" })
            queryBuild.push({ key: "keywords", value: "" })
            queryBuild.push({ key: "_t", value: new Date().getTime() })
            window.Vue.redirect(queryBuild);
        },
        afterSubmit() {
            const newRoute = window.Vue.router.currentRoute.value;
            let queryBuild = [];
            queryBuild.push({ key: "_collection", value: newRoute.query._collection })
            queryBuild.push({ key: "_idCol", value: newRoute.query._idCol })
            queryBuild.push({ key: "_id", value: "" })
            setTimeout(() => {
                window.Vue.redirect(queryBuild);
            }, 500);
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            if (oldRoute.query != newRoute.query) {
                let vm = this; vm.id = '';
                console.log(oldRoute.query._collection, newRoute.query._collection);
                await vm.init(oldRoute.query._collection != newRoute.query._collection);
            }
        }
    },
    mounted: function() {
        let vm = this;
        console.log('mountedmounted');
        vm.$nextTick(function() {
            setTimeout(async () => {
                await vm.init(true);
            }, 0);
        });
    },
    data: ()  => ({
        collections: [],
        collection: '',
        detail: null,
        tableConfig: null,
        metadataConfig: null,
        id: '',
        site: localStorage.getItem('site'),
        vuejxData: {},
        searchCol: '',
        renderpage: 0
    }),
    template: `
    <div class="flex-grow flex min-h-0 container grid-list-md">
        <section class="flex flex-col w-full max-w-xs flex-none bg-gray-100 min-h-0 overflow-auto h-screen">
            <div class="flex flex-wrap py-1 mb-0 px-4 pl-0 relative">
                <div class="w-full">
                    <input v-model="searchCol" class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400" placeholder="Tìm kiếm đối tượng ...">
                </div>
                <article tabindex="-1" v-if="detail"
                    class="border-primary w-full mt-3 cursor-pointer border rounded-md p-3 bg-white flex text-gray-700 hover:border-primary focus:outline-none focus:border-primar"><span class="flex-none pt-0 pr-2">1.</span>
                    <div class="flex-1">
                    <header class="mb-1">
                        <h4 class="inline text-blue-700">{{ detail.shortName }}</h4>
                    </header>
                    <header class="mb-1"><span class="font-semibold">{{ detail.title }}</span></header>
                    </div>
                </article>
            </div>
            <div class="scrollbar p-4 pl-0 pt-1 pb-32">
            <ul>
                <li v-for="(item, index) of collections" v-bind:key="index" @click="pickColl(item?._source?.shortName, item?._id)"
                    :class="[{'hidden': !String(item?._source?.shortName).toLocaleLowerCase().includes(String(searchCol).toLocaleLowerCase())}, item?._source?.shortName]"
                >
                    <article v-if="index > 0" tabindex="-1" class="cursor-pointer border rounded-md p-3 bg-white flex text-gray-700 mb-2 hover:border-primary focus:outline-none focus:border-primar">
                        <span class="flex-none pt-0 pr-2">{{ index + 1 }}.</span>
                        <div class="flex-1">
                        <header class="mb-1">
                            <h4 class="inline text-blue-700">{{ item?._source?.shortName }}</h4>
                        </header>
                        <header class="mb-1"><span class="font-semibold">{{ item?._source?.title }}</span></header>
                        </div>
                    </article>
                </li>
            </ul>
            </div>
        </section>
        <section class="flex min-h-0 flex-col flex-auto border bg-white" v-if="detail" :key="renderpage">
            <div class="mirror__form" v-if="tableConfig && !id">
                <vuejx-table-simple-khcn class="m-2" :keywords="['MaMuc', 'TenMuc', 'shortName', 'title', 'TenMuc.raw', 'title.raw', 'TenMuc.keyword', 'title.keyword']"
                    :crud="!crud" :remove="remove" :import_data="import_data" :export_data="export_data"
                    :pagesize="15" :db="detail.storeDb" :collection="detail.shortName" :sort="tableConfig.sort"
                    :title="detail.title"
                    :table_config="tableConfig.config_columns"
                    :filter_options="tableConfig.filter_options"
                    :queryFilter="tableConfig.re_calculator"
                    :state_query="['_collection', '_idCol']"
                >
                </vuejx-table-simple-khcn>
            </div>
            <div class="mirror__form m-2" v-if="tableConfig && id">
            <div class="top-content flex items-center bg-white rounded p-1 cursor-pointer"><div @click="backCol" class="text-green-700 uppercase font-bold"><i class="mdi mdi-backburger text-xs mr-1"></i> {{ detail.title }} </div></div>
                <vuejx-screen
                    ref="uploadFile"
                    grid_class="flex flex-wrap cms_form"
                    :site="$site"
                    :db="detail.storeDb"
                    :collection="detail.shortName"
                    :config="metadataConfig"
                    v-model="vuejxData"
                    :customRedirect="true"
                    @afterSubmit="afterSubmit"
                ></vuejx-screen>
            </div>
        </section>
        <section class="flex min-h-0 flex-col flex-auto border bg-white" v-else>
            <div class="font-bold text-center p-4 pt-64">
                Quản lý dữ liệu danh mục
            </div> 
        </section>
    </div>
    `
}