export default {
    props: {
        table_class: { type: String, default: "border-b w-full bg-white" },
        table_view: { type: String, default: "" },
        title_remove: { type: String, default: "xoá" },
        custom_table: { type: Boolean, default: () => { return false } },
        remove: { type: Boolean, default: () => { return false } },
        remove_conditon: { type: Array, default: () => { return [] } },
        crud: { type: Boolean, default: () => { return false } },
        import_data: { type: Boolean, default: () => { return false } },
        import_data_adv: { type: Boolean, default: () => { return false } },
        import_data_adv_api: { type: Boolean, default: () => { return false } },
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
        custom_detail: { type: Boolean, default: () => { return false } }
    },
    methods: {
        async init(inline_query) {
            let vm = this;
            vm.renderDataLoading = false
            vm.renderData = false;
            vm.rows = vm.pagesize;
            let query = window.Vue.router.currentRoute.value.query;
            vm.sourceRef = query.sourceRef
            vm.uploadarea = query._import
            let customPagging = null;
            if (inline_query) {
                customPagging = {};
                for (const el of inline_query) {
                    if (el.key === "_s_n") {
                        customPagging.sortNext = el.value
                    }
                    if (el.key === "_s_b") {
                        customPagging.sortBack = el.value
                    }
                    if (el.key === "_pagging") {
                        customPagging.paggingType = el.value
                    }
                    if (el.key === "_page") {
                        customPagging.page = el.value
                    }
                    if (el.key === "_sizeLast") {
                        customPagging.sizeLast = el.value > 0 ? el.value : vm.pagesize;
                        customPagging.size = el.value > 0 ? el.value : vm.pagesize;
                    }
                }
                if (!customPagging.size) {
                    customPagging.size = vm.pagesize;
                    customPagging.sizeLast = vm.pagesize;
                }
            }
            if (query.adv_filter) {
                vm.adv_filter = query.adv_filter;
            } else {
                vm.adv_filter = false;
            }
            if (!vm.paging) { vm.rows = vm.pagesize; vm.page = 1; }
            vm.aggReport = {};
            if (vm.aggs_ext_keyAggs) {
                let conditonAggs = JSON.parse(JSON.stringify(vm.condition));
                conditonAggs.splice(-1);
                const aggsData = await window.VueJX.aggs(vm, 'danh_muc', {
                    keyAggs: vm.aggs_ext_keyAggs, dbAggs: vm.db, collectionAggs:vm.aggs_ext, sizeAggs:10000
                }, 10000, 1, '_source' + vm.aggs_ext_keyAggs, '_source' + vm.aggs_ext_keyAggs, [], conditonAggs, vm.queryFilter, vm.keywords, vm.queryParam, 'true', true, 0, null, null, null);
                if (aggsData && Array.isArray(aggsData.items)) {
                    for (let el of aggsData.items) {
                        vm.aggReport[el.code] = el.counter;
                    }
                }
            }
            if (vm.noRouterr && !customPagging) {
                customPagging = {
                    page: 1,
                    paggingType: "first",
                    size: vm.pagesize,
                    sizeLast: vm.pagesize,
                    sortBack: "",
                    sortNext: ""
                }
            }
            console.log('vm.queryFiltervm.queryFilter', vm.queryFilter);
            const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, vm.condition, vm.includes, vm.newSortData, vm.storage, vm.rows, vm.queryParam, vm.sizeLast, customPagging);
            vm.dataResults = searchData.dataResults;
            vm.pages = searchData.pages;
            vm.page = searchData.page;
            vm.totalRecord = searchData.totalRecord;
            vm.sortNext = searchData.sortNext;
            vm.sortBack = searchData.sortBack;
            vm.rows = searchData.size;
            vm.renderData = true;
            setTimeout(() => {
                vm.renderDataLoading = true
            }, 100);
            vm.bodyQuery = searchData.bodyQuery;
        },
        dateView(item, key, defaultVal, dateFormat) { return window.Vue.dateView(item, key, defaultVal, dateFormat) },
        objectView(item, key, defaultVal) { return window.Vue.objectView(item, key, defaultVal) },
        dateTimeView(item, key, defaultVal) { return window.Vue.dateTimeView(item, key, defaultVal) },
        toDetail(item) { 
            if (this.custom_detail) {
                this.$emit('toDetail', item)
            } else {
                if (this.detailPage && this.detailPage.indexOf('?') != -1) {
                    let [pageDetail, queryxxx] = this.detailPage.split('?');
                    let buildQuery = [{ key: "_id", value: item?._id ? item._id : "NULL" }];
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
                    window.Vue.redirect([{ key: "_id", value: item?._id ? item._id : "NULL" }], false, this.detailPage) 
                }
            }
            
        },
        async paggingData(type) {
            let vm = this;
            let typsPa = type;
            let queryBuild = [];
            vm.sizeLast = vm.rows;
            const paramsQuery = new URLSearchParams(window.location.href)
            if (type === 'next') { vm.page = parseInt(vm.page) + 1; if (vm.page >= vm.pages) { vm.page = vm.pages; vm.sizeLast = vm.totalRecord - vm.rows * (vm.page - 1); } if (Array.isArray(vm.sortNext) && vm.sortNext.length > 0) { vm.sortBack = vm.sortNext; }
            } else if (type === 'prev') { vm.page = parseInt(vm.page) - 1; if (paramsQuery.get('_s_b')) { vm.sortNext = JSON.parse(decodeURIComponent(paramsQuery.get('_s_b'))); }
            } else if (type === 'first') { vm.page = 1; } else if (type === 'last') { vm.page = vm.pages; vm.sizeLast = vm.totalRecord - vm.rows * (vm.page - 1);}
            queryBuild.push({ key: "t", value: new Date().getTime() })
            if (vm.page <= 1) {
                vm.page = 1; typsPa = 'first';
                queryBuild.push({ key: "_s_n", value: '' }); queryBuild.push({ key: "_s_b", value: '' });
            } else if (vm.page <= vm.pages) {
                if (Array.isArray(vm.sortNext) && vm.sortNext.length > 0) { queryBuild.push({ key: "_s_n", value: encodeURIComponent(JSON.stringify(vm.sortNext)) }) }
                if (Array.isArray(vm.sortBack) && vm.sortBack.length > 0) { queryBuild.push({ key: "_s_b", value: encodeURIComponent(JSON.stringify(vm.sortBack)) }) }
            }
            queryBuild.push({ key: "_pagging", value: typsPa })
            queryBuild.push({ key: "_rows", value: vm.rows })
            if (vm.sizeLast != vm.rows) {
                queryBuild.push({ key: "_sizeLast", value: vm.sizeLast })
            }
            if (type === 'rows') { queryBuild.push({ key: "_page", value: 1 }); queryBuild.push({ key: "_rows", value: vm.rows }) } else { queryBuild.push({ key: "_page", value: vm.page }) }
            if (!vm.noRouterr) {
                if ("undefined" !== typeof window.history.pushState ) {
                    let paggingURL = '/#' + window.Vue.router.currentRoute.value.path + '?t=' + new Date().getTime();
                    for (const el of queryBuild) { if (el.key != 't') { paggingURL += '&' + el.key + '=' + el.value } }
                    const query = window.Vue.router.currentRoute.value.query;
                    for (const elQuery in query) { if (['_page', 't', '_s_n', '_s_b'].indexOf(elQuery) == -1) { paggingURL += '&' + elQuery + '=' + query[elQuery] } }
                    window.history.pushState({}, '', paggingURL);
                    await vm.init();
                } else { window.Vue.redirect(queryBuild) }
            } else {
                vm.renderData = false;
                await vm.init(queryBuild);
                vm.renderData = true;
            }
            
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
            let vm = this;
            let r = confirm("Xác nhận import dữ liệu.");
            if (r == true) {
                let data = new FormData();
                let fileUPload = document.getElementById('formFile');
                for (const el of fileUPload.files) {
                    data.append('file', el, el['name']);
                }
                let uploadHeaders = {
                    headers: {
                    }
                }
                uploadHeaders['headers']['Content-Type'] = 'multipart/form-data';
                uploadHeaders['headers']['token'] = localStorage.getItem('token');
                if (vm.import_data_adv_api) {
                    await window.Vue.$axios.post(`/qtdl/importXlsx/${localStorage.getItem('db')}/import?ext_data_import=${localStorage.getItem('ext_data_import')}`, data, uploadHeaders).then(function(response) {
                        window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                        try {
                            let messageImport = `Cập nhật dữ liệu ${response.data[Object.keys(response.data)[0]]['nUpserted']} bản ghi của ${Object.keys(response.data)[0]}.`
                            alert(messageImport)
                        } catch (error) {
                        }
                        setTimeout(() => {
                            window.Vue.redirect([{
                                key: '_t',
                                value: new Date().getTime()
                            }], true)
                        }, 2000);
                    }).catch((error) => {
                        window.Vue.toastr.error(error)
                    })
                } else {
                    await window.Vue.$axios.post(`/admin/security/file/excel2mongo/${vm.db}/${vm.collection}/${vm.site}`, data, uploadHeaders).then(function(response) {
                        if (response && response.data) {
                            window.Vue.toastr.success('Thành công.');
                        } else {
                            window.Vue.toastr.error('Error.');
                        }
                    }).catch((err) => {
                        window.Vue.toastr.error(error)
                    })
                }
            }
        },
        async doImportLoData() {
            let vm = this;
            let r = confirm("Xác nhận import dữ liệu.");
            if (r == true) {
                let data = new FormData();
                let fileUPload = document.getElementById('formFile');
                let nameFile = ''
                for (const el of fileUPload.files) {
                    data.append('file', el, el['name']);
                    nameFile = el['name']
                }
                data.append('cacheDanhMuc', false);
                let uploadHeaders = {
                    headers: {
                    }
                }
                uploadHeaders['headers']['Content-Type'] = 'multipart/form-data';
                uploadHeaders['headers']['token'] = localStorage.getItem('token');
                await window.Vue.$axios.post(`/qtdl/importXlsx/${localStorage.getItem('db')}/import?ext_data_import=${localStorage.getItem('ext_data_import')}`, data, uploadHeaders).then(function(response) {
                    window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                    setTimeout(() => {
                        window.Vue.redirect([{
                            key: 'sourceRef',
                            value: nameFile
                        }], true)
                    }, 2000);
                }).catch((err) => {
                    window.Vue.toastr.error(error)
                })
            }
        },
        openTree(item, state) {
            this.indexTree = item._id;
            this.$emit('openTree', item)
        },
        async processTree(query, code, keyTree) {
            let vm = this;
            vm.keyTree = keyTree;
            if (vm.dataResultsChild[code] && !window.dotize.dotize.isEmptyObj(vm.dataResultsChild[code])) {
                vm.dataResultsChild = {};
            } else {
                const searchData = await window.VueJX.search(vm, vm.collection, vm.keywords, vm.queryFilter, query, vm.includes, vm.sort, vm.storage, vm.rows, vm.queryParam, vm.sizeLast);
                vm.dataResultsChild[code] = searchData.dataResults;
            }
        },
        processTreeEmbed(item) {
            if (!this.itemxxx[item]) {
                this.itemxxx[item] = true;
                setTimeout(() => {
                    document.getElementById(item).click()
                }, 0);
            }
            
        },
        pickAll() {
            let vm = this;
            vm.checkAll = !vm.checkAll;
            if (vm.checkAll) {
                vm.ids = [];
                for (let el of vm.dataResults) {
                    let okToPick = true
                    for (let elCon of vm.remove_conditon) {
                        let keyToCheck = Object.keys(elCon)[0]
                        if (el?._source && el._source[keyToCheck] && elCon[keyToCheck] == 'NULL') {
                            okToPick = false
                            break
                        }
                    }
                    if (okToPick) {
                        vm.ids.push(el?._source?.id)
                    }
                }
            } else {
                vm.ids = [];
            }
        },
        pickRemove(id, type, item) {
            let vm = this;
            let okToPick = true
            for (let elCon of vm.remove_conditon) {
                let keyToCheck = Object.keys(elCon)[0]
                if (item && item._source[keyToCheck] && elCon[keyToCheck] == 'NULL') {
                    okToPick = false
                    break
                }
            }
            if (okToPick) {
                if (this.ids.indexOf(id) == -1) {
                    this.ids.push(id);
                } else {
                    this.ids = this.ids.filter(el => el !== id);
                }
            } else {
                alert('Dữ liệu không được thao tác xoá.')
            }
        },
        async doUpdateMany(postData) {
            let vm = this
            if (confirm("Xác nhận thực hiện.")) {
                window.Vue.loadingBar.start();
                let action = "vuejx_manager/userUpdateMany";
                await window.Vue.$root.dispatch(action, {
                    db: localStorage.getItem("db"),
                    collection: vm.collection,
                    body: postData,
                    filter: vm.ids
                })
                .then(async (response) => {
                    if (response.data && response.data.modifiedCount) {
                        window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                        setTimeout(() => {
                            window.Vue.redirect([
                                {
                                    key: 'sourceRef',
                                    value: ''
                                }
                            ], true)
                        }, 2000);
                        window.Vue.loadingBar.finish();
                    }
                })
                .catch((err) => {
                    window.Vue.toastr.error("Yêu cầu của bạn được thực hiện thất bại.");
                    window.Vue.loadingBar.error();
                });
            }
        },
        async updateLoDL() {
            let vm = this;
            let deletePrompt = prompt("Vui lòng nhập chữ: OK để chuyển đổi trạng thái lô dữ liệu", "");

            if (deletePrompt == 'OK') {
                window.Vue.loadingBar.start();
                let postData = {
                    TrangThaiDuLieu: {
                        _source: {
                          MaMuc: '02',
                          TenMuc: 'Chính thức',
                          type: 'C_TrangThaiDuLieu'
                        }
                    },
                    storage: '01_' + new Date().getTime(),
                    editVersion: new Date().getTime()
                };
                let action = "vuejx_manager/userUpdateMany";
                let filterUpdateLo = {
                    sourceRef: vm.sourceRef
                }
                if (window.Vue.router.currentRoute.value.query.DuDieuKienSinhMa) {
                    filterUpdateLo['DuDieuKienSinhMa'] = window.Vue.router.currentRoute.value.query.DuDieuKienSinhMa
                }
                
                await window.Vue.$root.dispatch(action, {
                    db: localStorage.getItem("db"),
                    collection: vm.collection,
                    body: postData,
                    filter: filterUpdateLo
                })
                .then(async (response) => {
                    if (response.data && response.data.modifiedCount) {
                        window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                        window.Vue.loadingBar.finish();
                        setTimeout(() => {
                            window.Vue.redirect([], true)
                        }, 2000);
                    }
                })
                .catch((err) => {
                    window.Vue.toastr.error("Yêu cầu của bạn được thực hiện thất bại.");
                    window.Vue.loadingBar.error();
                });
            }

        },
        async removeLoDL() {
            let vm = this;
            let deletePrompt = prompt("Vui lòng nhập chữ: DELETE để xoá lô dữ liệu", "");

            if (deletePrompt == 'DELETE') {
                window.Vue.loadingBar.start();
                let postData = {
                    "storage": "trash"
                };
                let action = "vuejx_manager/userUpdateMany";
                await window.Vue.$root.dispatch(action, {
                    db: localStorage.getItem("db"),
                    collection: vm.collection,
                    body: postData,
                    filter: { sourceRef: vm.sourceRef }
                })
                .then(async (response) => {
                    if (response.data && response.data.modifiedCount) {
                        window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                        window.Vue.loadingBar.finish();
                        setTimeout(() => {
                            window.Vue.redirect([
                                {
                                    key: 'sourceRef',
                                value: ''
                                }
                            ], true)
                        }, 2000);
                    }
                })
                .catch((err) => {
                    window.Vue.toastr.error("Yêu cầu của bạn được thực hiện thất bại.");
                    window.Vue.loadingBar.error();
                });
            }

        },
        async doRemove() {
            let vm = this;
            let deletePrompt = prompt("Vui lòng nhập chữ: DELETE để xoá dữ liệu", "");

            if (deletePrompt == 'DELETE') {
                window.Vue.loadingBar.start();
                let postData = {
                    "storage": "trash"
                };
                let action = "vuejx_manager/userUpdateMany";
                await window.Vue.$root.dispatch(action, {
                    db: localStorage.getItem("db"),
                    collection: vm.collection,
                    body: postData,
                    filter: vm.ids
                })
                .then(async (response) => {
                    if (response.data && response.data.modifiedCount) {
                        window.Vue.toastr.success("Yêu cầu của bạn được thực hiện thành công.");
                        setTimeout(() => {
                            window.Vue.redirect([
                                {
                                    key: 'sourceRef',
                                value: ''
                                }
                            ], true)
                        }, 2000);
                        window.Vue.loadingBar.finish();
                    }
                })
                .catch((err) => {
                    window.Vue.toastr.error("Yêu cầu của bạn được thực hiện thất bại.");
                    window.Vue.loadingBar.error();
                });
            }

        },
        async douploadarea() {
            let vm = this;
            if (!vm.uploadarea) {
                window.Vue.redirect_page(window.Vue.router.currentRoute.value.params.page, [], [{
                    key: '_import',
                    value: 'data'
                }, {
                    key: '_view',
                    value: window.Vue.router.currentRoute.value.query._view
                }, {
                    key: '_tree',
                    value: window.Vue.router.currentRoute.value.query._tree
                }, {
                    key: '_tree_index',
                    value: window.Vue.router.currentRoute.value.query._tree_index
                }], true)
            } else {
                window.Vue.redirect_page(window.Vue.router.currentRoute.value.params.page, [], [{
                    key: '_import',
                    value: ''
                }, {
                    key: '_view',
                    value: window.Vue.router.currentRoute.value.query._view
                }, {
                    key: '_tree',
                    value: window.Vue.router.currentRoute.value.query._tree
                }, {
                    key: '_tree_index',
                    value: window.Vue.router.currentRoute.value.query._tree_index
                }], true)
            }
        },
        processViewHTML(itemCf, item) {
            let result = '';
            if (itemCf.date) {
                result = this.dateView(item, itemCf.value)
            } else if (itemCf.array_field && itemCf.value) {
                let arrayDataTd = window.Vue.objectViewObject(item, itemCf.array_field)
                let elIndex = 0;
                let childField = String(itemCf.value).replace(itemCf.array_field + '.', '');
                if (Array.isArray(arrayDataTd)) {
                    for (let el of arrayDataTd) {
                        result += this.objectView(el, childField, itemCf.default) + (elIndex +1 < arrayDataTd.length ? '<span>, </span>' : '')
                        elIndex++
                    }
                }
            } else if (itemCf.valueFixObject) {
                let objectFix = window.Vue.objectViewObject(item, itemCf.valueFixObject, {})
                if (objectFix) {
                    result = objectFix[itemCf.valueFix]
                }
                if (objectFix[itemCf.valueFix + '___QCVN']) {
                    result = result + ' / ' + objectFix[itemCf.valueFix + '___QCVN']
                }
            } else {
                if (String(itemCf.value).indexOf(',') != -1) {
                    let fielData = String(itemCf.value).split(',')
                    for (let index = 0; index < fielData.length; index++) {
                        if (itemCf.viewDefault[index] == 'NULL' && !this.objectView(item, fielData[index], itemCf.default)) {

                        } else {
                            result += `<span class="${itemCf.classDefault[index]}"><span class="prefix___label_td">${itemCf.prefix[index]}</span>` + 
                            (itemCf.viewTypeElement[index] == 'date' ? this.dateView(item, fielData[index]) : this.objectView(item, fielData[index], itemCf.viewDefault[index]))
                            + '</span>'
                        }
                    }
                } else {
                    result = this.objectView(item, itemCf.value, itemCf.default)
                }
            }
            return result
        },
        async submitOrder(data) {
            this.renderData = false;
            if (this.customadv['order._source.shortName']) {
                let sortKey = this.customadv['order._source.shortName'].split('___')
                let newSort = {}
                this.newSortData = []
                newSort[sortKey[0]] = sortKey[1]
                for (const elSort of this.sort) {
                    if (typeof elSort == 'object' && Object.keys(elSort)[0] != sortKey[0]) {
                        this.newSortData.push(elSort)
                    }
                }
                this.newSortData.push(newSort)
                //this.newSortData = [...this.sort, ...[newSort]]
                console.log('submitOrdersubmitOrdersubmitOrder', this.newSortData, this.sort)
                
            }
            await this.init();
            this.renderData = true;
        },
        async inlineSearchAction(data) {
            let vm = this
            console.log('data==', data)
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.renderData = false;
            if (localStorage.getItem("sortTable") && localStorage.getItem("sortTable") == 'false') {
                vm.sortTable = false
            }
            vm.newSortData = JSON.parse(JSON.stringify(vm.sort));
            setTimeout(async () => {
                await vm.init();
                vm.renderData = true;
            }, 0);
        });
    },
    data: ()  => ({
        sourceRef: '',
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
        aggReport: {},
        uploadarea: false,
        uploadarea_cfg_sate: {},
        renderDataLoading: false,
        customadv: {},
        newSortData: [],
        sortTable: true
    }),
    template: `
    <div v-if="custom_table"><slot name="custom_view" v-bind:data="dataResults"></slot></div>
    <div class="vuejx__table" v-else>
        <div class="top-content flex" v-if="!noHeader">
            <div class=" content-title bg-blue-700 text-white flex items-center uppercase font-semibold relative"> {{ title }} </div>
            <qlvt-filter @inlineSearchAction="inlineSearchAction" :inlineSearch="inlineFilter" :inlineFilter="inlineFilter" :state_query="state_query" :placeholderKeyowrds="placeholderKeyowrds" class=" flex-1" ref="filter" :filter_options="filter_options">
                <template v-slot:filter_button="{ submitSearch, showSearchAdvanced }">
                    <button aria-label="btn" class=" filter___timkiem font-semibold rounded-r text-white px-3 pb-1 leading-none focus:outline-none bg-blue-700 whitespace-no-wrap" tabindex="-1" @click="submitSearch($event)">Tìm kiếm</button>
                    <vuejx-autocomplete v-if="sortTable" style="min-width: 100px; margin-left: 8px;"
                        class="vuejx_combobox_selection"
                        :config='{
                            hidden_label: true,
                            model: "order",
                            object: false,
                            placeholder: "Sắp xếp",
                            data: [
                                {
                                    _source: {
                                        shortName: "createdAt___desc",
                                        title: "Mới nhất"
                                    }
                                },
                                {
                                    _source: {
                                        shortName: "createdAt___asc",
                                        title: "Cũ nhất"
                                    }
                                }
                            ]
                        }'
                        v-model:data='customadv'
                        v-model='customadv'
                        @change="submitOrder"
                    ></vuejx-autocomplete>
                    <slot name="ext_btn"> 
                        <button aria-label="btn" v-if="!inlineFilter && filter_options.length > 0 && !uploadarea" class=" filter___adv font-semibold rounded border border-blue-700 text-blue-700 px-3 leading-none focus:outline-none hover:bg-blue-700 hover:text-white ml-2 whitespace-no-wrap" tabindex="-1" @click="showSearchAdvanced()">{{ adv_filter ? 'Xoá bộ lọc' : 'Nâng cao'}}</button>
                        <button aria-label="btn" v-if="crud && !uploadarea" class="filter___add_cms whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 bg-blue-700 text-white px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="toDetail('')">Thêm mới</button>
                    </slot>
                    <slot name="ext_btn_2"> 
                    </slot>
                    <button @click="import_data_adv ? douploadarea() : ''" v-if="import_data" aria-label="btn" class=" filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 text-blue-700 px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1">
                        <template v-if="!import_data_adv">
                            <label for="formFile">Lô dữ liệu</label>
                            <input class="hidden" type="file" id="formFile" @change="doImport">
                        </template>
                        <template v-else>
                            <label>{{ uploadarea ? 'Quay lại danh sách' : 'Lô dữ liệu'}}</label>
                        </template>
                    </button>
                    <button v-if="export_data && !uploadarea" aria-label="btn" class=" filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 text-blue-700 px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="doExport">{{ export_data_label }}</button>
                </template>
            </qlvt-filter>
        </div>
        <slot name="button_remove" v-bind:doRemove="doRemove" v-bind:doUpdateMany="doUpdateMany" v-bind:ids="ids">
            <button aria-label="btn" v-if="ids.length > 0" @click="doRemove" class="whitespace-no-wrap mb-2 font-semibold rounded border border-red-700 text-red-700 p-2 leading-none focus:outline-none hover:bg-red-200 hover:text-gray-900 px-3" tabindex="-1">
                Xác nhận {{title_remove}} {{ ids.length }} bản ghi.
            </button>
        </slot>
        <slot name="button_ext"></slot>
        <slot name="import_ext">
            <div v-if="uploadarea" class="flex flex-wrap -mx-2">
                <div class="xs12" :class="{'xs8': sourceRef}">
                    <label for="formFile" class="n-upload n-upload--dragger-inside" style="--n-bezier:cubic-bezier(0.4, 0, 0.2, 1); --n-border-radius:3px; --n-dragger-border:1px dashed rgb(224, 224, 230); --n-dragger-border-hover:1px dashed #18a058; --n-dragger-color:rgb(250, 250, 252); --n-font-size:14px; --n-item-color-hover:rgb(243, 243, 245); --n-item-color-hover-error:rgba(208, 48, 80, 0.06); --n-item-disabled-opacity:0.5; --n-item-icon-color:rgba(194, 194, 194, 1); --n-item-text-color:rgb(51, 54, 57); --n-item-text-color-error:#d03050; --n-item-text-color-success:#18a058; --n-line-height:1.6; --n-item-border-image-card-error:1px solid #d03050; --n-item-border-image-card:1px solid rgb(224, 224, 230);">
                        <div class="n-upload-trigger">
                        <div class="n-upload-dragger">
                            <div style="margin-bottom: 12px;"><i role="img" class="n-icon n-icon--depth n-icon--color-transition" style="--n-bezier:cubic-bezier(0.4, 0, 0.2, 1); --n-color:#000; --n-opacity:0.38; font-size: 48px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                                <path d="M80 152v256a40.12 40.12 0 0 0 40 40h272a40.12 40.12 0 0 0 40-40V152" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
                                <rect x="48" y="64" width="416" height="80" rx="28" ry="28" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"></rect>
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M320 304l-64 64l-64-64"></path>
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 345.89V224"></path>
                                </svg></i></div><span class="n-text" style="--n-bezier:cubic-bezier(0.4, 0, 0.2, 1); --n-text-color:rgb(51, 54, 57); --n-font-weight-strong:500; --n-font-famliy-mono:v-mono, SFMono-Regular, Menlo, Consolas, Courier, monospace; --n-code-border-radius:2px; --n-code-text-color:rgb(51, 54, 57); --n-code-color:rgb(244, 244, 248); --n-code-border:1px solid #0000; font-size: 16px;">Chọn hoặc kéo thả File dữ liệu vào khu vực này để thực hiện tải lên</span>
                            <p class="n-p" style="--n-bezier:cubic-bezier(0.4, 0, 0.2, 1); --n-font-size:14px; --n-line-height:1.6; --n-margin:16px 0 16px 0; --n-text-color:rgb(118, 124, 130); margin: 8px 0px 0px;">File định dạng Excel theo mãu thiết kế CSDL</p>
                        </div>
                        </div>
                        <div class="n-upload-file-list">
                        <!---->
                        </div>
                    </label>
                    <input class="hidden" type="file" id="formFile" @change="doImportLoData">
                </div>
                <div class="xs12 sm4" v-if="sourceRef">
                    <div class="p-2 mx-2 rounded px-0" style="border: 1px dashed #01662e;">
                        <button @click="updateLoDL" style="border-radius: 4px !important;" aria-label="btn" class="filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 text-blue-700 px-3 p-2 block leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1">
                            <label>Xác nhận dữ liệu theo lô</label>
                        </button>
                        <button @click="removeLoDL" aria-label="btn" class="filter___import whitespace-no-wrap ml-2 font-semibold rounded border border-red-700 text-red-700 px-3 p-2 block mt-4 leading-none focus:outline-none hover:bg-white hover:text-red-700" tabindex="-1">
                            <label>Xoá lô đã chọn</label>
                        </button>
                    </div>
                </div>
            </div>
        </slot>
        <div class="overflow-x-auto">
            <slot name="report_ext">
            <div>
            <table :id="idtable" class="vuejx__table___comp" :class="[{'done___loading': renderDataLoading}, table_class]" v-bind:style="{'border-bottom': (dataResults && dataResults.length == 0) ? 'unset' : ''}">
                <thead :class="{ 'w-full': !employee__table }">
                    <slot name="thead_title"> </slot>
                    <slot name="thead">
                    <tr>
                        <th v-if="remove" width="40" @click="pickAll"><p class="relative"><i class="mdi mdi-checkbox-blank-outline absolute___checked" v-if="!checkAll"></i><i class="mdi mdi-checkbox-marked absolute___checked" v-else></i></p></th>
                        <th width="50">STT</th>
                        <th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </th>
                    </tr>
                    </slot>
                </thead>
                <!--
                <tbody class="border-b w-full bg-white" v-show="!renderData">
                    <tr class="h-16 relative">
                        <td class="loading___table">
                            Chờ trong giây lát ...
                        </td>
                    </tr> 
                </tbody>
                -->
                <tbody class="border-b w-full bg-white">
                    <slot name="tbody" v-bind:page="rows" v-bind:data="dataResults"> <slot name="tbody_title"></slot>
                        <template v-for="(item, index) in dataResults">
                            <tr v-bind:key="index">
                                <td width="40" align="center" v-if="remove" class="cursor-pointer" @click="pickRemove(item._id, ids.length > 0 && ids.indexOf(item._id) != -1, item)"
                                    :class="{'bg-yellow-200': ids.length > 0 && ids.indexOf(item._id) != -1}"
                                >
                                    <slot :name="'cell_pick_item'" v-bind:celldata="item" v-bind:index="index" v-bind:ids="ids">
                                        <p class="relative">
                                            <i class="mdi mdi-checkbox-marked absolute___checked" v-if="ids.length > 0 && ids.indexOf(item._id) != -1"></i>
                                            <i class="mdi mdi-checkbox-blank-outline absolute___checked" v-else></i>
                                        </p>
                                    </slot>
                                </td>
                                <td :width="widthSTT" align="center"
                                    :class="{'bg-yellow-200': indexTree == item._id}"    
                                >{{ page * rows - rows + index + 1 }} </td>
                                <td v-for="(itemCf, indexx) of table_config" v-bind:key="indexx" :width="itemCf.width" 
                                    :class="[{'bg-yellow-200': indexTree == item._id, 'font-bold text-blue-700': itemCf.aggs && aggReport[objectView(item, itemCf.value, itemCf.default)]}, itemCf.class]"    
                                    @click="itemCf.action ? '' : toDetail(item)" >
                                    <slot v-if="itemCf.model" :name="'cell_' + itemCf.model" v-bind:celldata="item" v-bind:index="index">
                                        <template v-if="itemCf.value_1 && itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1, itemCf.default)">
                                            <span class="title_slot_table font-semibold" v-html="itemCf.value_title"></span>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="itemCf.date ? dateView(item, itemCf.value) : objectView(item, itemCf.value, itemCf.default)" v-else></span><br/>
                                            <span class="title_slot_table font-semibold" v-html="itemCf.value_title_1"></span>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', ''))" v-html="item.highlight[itemCf.value_1.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1)" v-else></span>
                                        </template>
                                        <template v-if="itemCf.aggs">
                                            {{ aggReport[objectView(item, itemCf.value, itemCf.default)] ? aggReport[objectView(item, itemCf.value, itemCf.default)] : 0 }}
                                        </template>
                                        <template v-else-if="itemCf.date && itemCf.time">
                                            {{ dateTimeView(item, itemCf.value) }}
                                        </template>
                                        <template v-else>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="processViewHTML(itemCf, item)" v-else></span>
                                        </template>
                                    </slot>
                                    <slot v-else :name="'cell_' + indexx" v-bind:celldata="item">
                                        <template v-if="itemCf.value_1 && itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1, itemCf.default)">
                                            <span class="title_slot_table font-semibold" v-html="itemCf.value_title"></span>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="itemCf.date ? dateView(item, itemCf.value) : objectView(item, itemCf.value, itemCf.default)" v-else></span><br/>
                                            <span class="title_slot_table font-semibold" v-html="itemCf.value_title_1"></span>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', ''))" v-html="item.highlight[itemCf.value_1.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value_1.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value_1.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="itemCf.date ? dateView(item, itemCf.value_1) : objectView(item, itemCf.value_1)" v-else></span>
                                        </template>
                                        <template v-if="itemCf.aggs">
                                            {{ aggReport[objectView(item, itemCf.value, itemCf.default)] ? aggReport[objectView(item, itemCf.value, itemCf.default)] : 0 }}
                                        </template>
                                        <template v-else-if="itemCf.date && itemCf.time">
                                            {{ dateTimeView(item, itemCf.value) }}
                                        </template>
                                        <template v-else>
                                            <span v-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', ''))" v-html="item.highlight[itemCf.value.replace('_source.', '')].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.raw')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.raw'].toString()"> </span>
                                            <span v-else-if="item.hasOwnProperty('highlight') && item.highlight.hasOwnProperty(itemCf.value.replace('_source.', '') + '.keyword')" v-html="item.highlight[itemCf.value.replace('_source.', '') + '.keyword'].toString()"> </span>
                                            <span v-html="processViewHTML(itemCf, item)" v-else></span>
                                        </template>
                                    </slot>
                                </td>
                            </tr> 
                        </template>
                    </slot>
                </tbody>
            </table>
            <slot name="pagging" v-bind:paggingData="paggingData" v-bind:totalRecord="totalRecord" v-bind:page="page" v-bind:pages="pages">
            <header v-if="paging" class="bg-white flex items-center py-1 pr-4"><div class="flex"><button class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1"  @click="paggingData('first')"  aria-label="first"> <i class="mdi" :class="{'mdi-chevron-double-left': !loadingAction}"></i> </button><button class="font-semibold text-blue-700 pl-0 pr-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('prev')" aria-label="back" > <i class="mdi" :class="{'mdi-chevron-left': !loadingAction}"></i> </button><button class="text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary btn__pagging" tabindex="-1" > Trang {{ page }} / {{ pages }} </button><button v-if="page < pages" class="font-semibold text-blue-700 pl-2 pr-0 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('next')" aria-label="next" > <i class="mdi" :class="{'mdi-chevron-right': !loadingAction}"></i> </button><button v-if="page < pages" class="font-semibold text-blue-700 px-2 py-2 leading-none focus:outline-none hover:text-primary" tabindex="-1" @click="paggingData('last')" aria-label="last"><i class="mdi" :class="{'mdi-chevron-double-right': !loadingAction}"></i> </button><button class="focus:outline-none btn__pagging_info" tabindex="-1"> <div> <h4 class="font-semibold"> <span>Tổng số bản ghi: </span> <span class='text-blue-700'>{{totalRecord}}</span> </h4> </div> </button></div> <div class="ml-auto"> <span>Hiển thị</span> <input style="width: 60px" class="text-center appearance-none bg-gray-200 text-blue-700 border border-gray-200 rounded py-1 px-1 focus:outline-none focus:bg-white focus:border-gray-400 ml-2" v-model="rows" @change="paggingData('rows')" type="text" aria-label="total" /></div></header>
            </slot></slot>
        </div>
    </div>
    `
}