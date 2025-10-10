export default {
    props: {
        table_class: { type: String, default: "border-b w-full bg-white" },
        table_view: { type: String, default: "" },
        title_remove: { type: String, default: "xoá" },
        custom_table: { type: Boolean, default: () => { return false } },
        remove: { type: Boolean, default: () => { return false } },
        crud: { type: Boolean, default: () => { return false } },
        import_data: { type: Boolean, default: () => { return false } },
        export_data: { type: Boolean, default: () => { return false } },
        export_data_label: { type: String, default: () => { return 'Export' } },
        noHeader: { type: Boolean, default: () => { return false } },
        noRouterr: { type: Boolean, default: () => { return false } },
        storage: { type: Object, default: () => { return null } },
        widthSTT: { type: Number, default: () => { return 50; } },
        filter_options: {  type: Array, default: () => { return []; } },
        table_config: { type: Array, default: () => { return []; } },
        title: { type: String, default: "" },
        detailPage: { type: String, default: "" },
        employee__table: { type: Boolean, default: false },
        idtable: { type: String, default: "table__to__export" },
        db: { type: String, default: () => { return localStorage.getItem("db"); } },
        collection: { type: String, default: () => { return ""; } },
        site: { type: String, default: () => { return ""; } },
        includes: { type: Array, default: () => { return []; } },
        sort: { type: Array, default: () => { return []; } },
        pagesize: { type: Number, default: () => { return 15; } },
        paging: { type: Boolean, default: () => { return true; } },
        condition: { type: Array, default: () => { return []; } },
        queryFilter: { type: Array, default: () => { return []; } },
        keywords: { type: Array, default: () => { return []; } },
        queryParam: { type: Boolean, default: () => { return true; } },
        empty: { type: Boolean, default: () => { return false; } },
        skeleton: { type: Object, default: () => { return { th: [], td: [] } } },
        exportTemplate: { type: String, default: "" },
        exportTemplateTitle: { type: String, default: "" },
        aggs_ext: { type: String, default: "" },
        aggs_ext_keyAggs: { type: String, default: "" },
        placeholderKeyowrds: { type: String, default: "Tìm kiếm ..." },
        treeParentKey: { type: String, default: "LoaiChiTieuRoot" },
        state_query: { type: Array, default: null },
        inlineFilter: { type: Boolean, default: () => { return false } },
        items: { type: Array, default: () => { return []; } }
    },
    methods: {
        async init(inline_query) {
            let vm = this;
            vm.renderData = false;
            vm.rows = vm.items.length;
            vm.dataResults = vm.items;
            vm.totalRecord = vm.items.length;
            vm.renderData = true;
        },
        dateView(item, key, defaultVal, dateFormat) { return window.Vue.dateView(item, key, defaultVal, dateFormat) },
        objectView(item, key, defaultVal) { return window.Vue.objectView(item, key, defaultVal) },
        toDetail(id) { 
            if (this.detailPage && this.detailPage.indexOf('?') != -1) {
                let [pageDetail, queryxxx] = this.detailPage.split('?');
                let buildQuery = [{ key: "_id", value: id ? id : "NULL" }];
                if (queryxxx && queryxxx.indexOf('&') != -1) {
                    let listQuery = queryxxx.split('&');

                    for (let el of listQuery) {
                        if (el && el.indexOf('=') != -1) {
                            const [keyx, valx] =  el.split('=');
                            buildQuery.push({ key: keyx, value: valx })
                        } else {
                            buildQuery.push({ key: el, value: '' })
                        }
                    }
                }
                window.Vue.redirect(buildQuery, false, pageDetail) 
            } else {
                window.Vue.redirect([{ key: "_id", value: id ? id : "NULL" }], false, this.detailPage) 
            }
            
        },
        async paggingData(type) {
        },
        async doExport() {
            let vm = this;

            if (vm.exportTemplate) {

                window.Vue.$axios.post("/admin/vuejx/docx/generateexcel", {
                    docFileName: vm.exportTemplate,
                    site: localStorage.getItem('site'),
                    db: localStorage.getItem('db'),
                    collection: vm.collection,
                    bodyQuery: vm.bodyQuery,
                    dataId: vm.exportTemplateTitle
                }, {
                    responseType: "arraybuffer",
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem('token'),
                      token: localStorage.getItem('token'),
                      "Content-Type": "application/json",
                      "Accept": "application/octet-stream",
                    },
                  })
                    .then((response) => {
                      const blob = new Blob([response.data], {
                        type: "application/octet-stream",
                      });
                      var a = document.createElement("a");
                      a.href = window.URL.createObjectURL(blob);
                      a.download = vm.exportTemplateTitle.endsWith('.pdf') ? vm.exportTemplateTitle : vm.exportTemplateTitle + ".xlsx";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    })
                    .catch((error) => {
                      console.log(error);
                    });

            } else {
                let fileName = vm.collection + '.xlsx';
                let data = JSON.stringify({ "fileName": fileName });
            
                let config = {
                    method: 'post',
                    url: '/admin/security/file/mongo2excel/' + vm.db + '/' + vm.collection + '/' + vm.site,
                    headers: {
                        'Content-Type': 'application/json',
                        'token': localStorage.getItem('token')
                    },
                    responseType: "blob",
                    data: data
                };
                await window.Vue.$axios(config)
                .then(function (response) {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', fileName); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
            
        },
        async doImport() {
        }
    },
    watch: {
        '$route': async function(newRoute, oldRoute) {
            let pageSitePrepare = window.VueJX.page()
            if (oldRoute.params.page == pageSitePrepare) {
                let vm = this;
                vm.renderData = false;
                await vm.init();
                vm.renderData = true;
            }
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.renderData = false;
            setTimeout(async () => {
                await vm.init();
                vm.renderData = true;
            }, 0);
        });
    },
    data: ()  => ({
        itemxxx: {},
        renderData: false,
        site: localStorage.getItem('site'),
        rows: 15,
        sizeLast: 15,
        dataResults: [],
        dataResultsChild: {},
        page: 1,
        pages: 1,
        totalRecord: 0,
        sortBack: [],
        sortNext: [],
        paggingType: '',
        indexTree: '',
        keyTree: '',
        checkAll: false,
        ids: [],
        adv_filter: false,
        bodyQuery: null,
        aggReport: {}
    }),
    template: `
    <div v-if="custom_table"><slot name="custom_view" v-bind:data="dataResults"></slot></div>
    <div class="vuejx__table" v-else>
        <div class="top-content flex" v-if="!noHeader">
            <div class=" content-title bg-blue-700 text-white flex items-center uppercase font-semibold relative"> {{ title }} </div>
        </div>
        <slot name="button_ext"></slot>
        <slot name="report_ext">
        <table v-if="!renderData" class="border-b w-full bg-white"> <thead class="w-full bg-white"> <slot name="thead"> <tr> <th width="50">STT</th> <th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </th> </tr> </slot> </thead> <tbody class="w-full bg-white p-4"> <tr> <td colspan="100"> <p class="loading___table"> Chờ trong giây lát ... </p> </td> </tr> </tbody></table>
        <table :id="idtable" v-else :class="table_class" v-bind:style="{'border-bottom': (dataResults && dataResults.length == 0) ? 'unset' : ''}">
        <thead :class="{ 'w-full': !employee__table }">
            <slot name="thead_title"> </slot>
            <slot name="thead"> <tr><th width="50">STT</th> <th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </th> </tr> </slot>
        </thead>
        <tbody class="border-b w-full bg-white"> <slot name="tbody" v-bind:page="rows" v-bind:data="dataResults"> <slot name="tbody_title"></slot>
            <template v-for="(item, index) in dataResults">
                <tr v-bind:key="index">
                    <td :width="widthSTT" align="center"
                        :class="{'bg-yellow-200': indexTree == item._id}"    
                    >{{ page * rows - rows + index + 1 }} </td>
                    <td v-for="(itemCf, indexx) of table_config" v-bind:key="indexx" :width="itemCf.width" 
                        :class="[{'bg-yellow-200': indexTree == item._id, 'font-bold text-blue-700': itemCf.aggs && aggReport[objectView(item, itemCf.value)]}, itemCf.class]"    
                        @click="itemCf.action ? '' : toDetail(item._id)" >
                        <slot :name="'cell_' + indexx" v-bind:celldata="item" v-bind:index="index">
                            <template v-if="itemCf.value_1 && itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1)">
                                <span class="title_slot_table font-semibold" v-html="itemCf.value_title"></span>
                                <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                <span v-html="itemCf.date ? dateView(item, itemCf.value) : objectView(item, itemCf.value)" v-else></span><br/>
                                <span class="title_slot_table font-semibold" v-html="itemCf.value_title_1"></span>
                                <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', ''))" v-html="item.highlight[itemCf.value_1.replace('_source.', '')].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.raw'].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.keyword'].toString()"> </span>
                                <span v-html="itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1)" v-else></span>
                            </template>
                            <template v-if="itemCf.aggs">
                                {{ aggReport[objectView(item, itemCf.value)] ? aggReport[objectView(item, itemCf.value)] : 0 }}
                            </template>
                            <template v-else>
                                <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                <span v-html="itemCf.date ? dateView(item, itemCf.value) : objectView(item, itemCf.value)" v-else></span>
                            </template>
                        </slot>
                    </td>
                </tr>
            </template>
            </slot>
        </tbody>
        </table>
        </slot>
    </div>
    `
}