export default {
    props: {
        ChiTieuQuanTrac: { type: Array, default: () => { return []; } },
        collection: { type: String, default: () => { return ""; } },
        db: { type: String, default: () => { return localStorage.getItem('db'); } },
        mode: { type: String, default: () => { return 'dinh_ky'; } },
        data: { type: Object, default: () => { return null; } },
        dataRef: { type: Object, default: () => { return null; } },
        BieuMau: { type: String, default: () => { return ''; } },
        NamQuanTrac: { type: String, default: () => { return new Date().getFullYear(); } },
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            if (vm.data) {
                vm.vuejxData = vm.data
            }
            vm.vuejxData = { ...vm.dataTieuChi, ...vm.vuejxData}

            vm.idTram = window.Vue.router.currentRoute.value.query._id;
            vm.vuejxData['TramQuanTrac'] = {
                _id: vm.idTram,
                BieuMau: vm.BieuMau
            }
            if (vm.dataRef) {
                vm.vuejxData['TramQuanTrac'] = { ...vm.vuejxData['TramQuanTrac'], ...vm.dataRef }
            }
            if (Array.isArray(vm.condition) && vm.condition.length == 0) {
                vm.condition = [
                    {
                        match: {
                            "TramQuanTrac._id": vm.idTram
                        }
                    },
                    {
                        match: {
                            "TramQuanTrac.BieuMau": vm.BieuMau
                        }
                    }
                ]
            }
            console.log('ChiTieuQuanTrac vm.vuejxDatavm.vuejxData', vm.vuejxData, vm.condition)
            vm.table_config = [{ 
                title: 'Thời gian quan trắc', class: 'text-center', date: true,
                value: '_source.DotQuanTrac'
            }];
            vm.renderTable = false;
            vm.renderF = false;
            if (Array.isArray(vm.ChiTieuQuanTrac)) {
                for (const el of vm.ChiTieuQuanTrac) {
                    vm.formConfig['form'].push({
                        model: 'KetQuaQuanTrac.' + String(el._source?.TenMuc).trim(), label: String(el._source?.TenMuc).trim() + '/QCVN', type: 'textQCVN'
                    })
                    vm.table_config.push({ 
                        action: true,
                        title: String(el._source?.TenMuc).trim() + '/QCVN', class: 'text-center',
                        value: '_source.KetQuaQuanTrac.' + String(el._source?.TenMuc).trim(),
                        valueFix: String(el._source?.TenMuc).trim(),
                        valueFixObject: '_source.KetQuaQuanTrac'
                    })
                }
                vm.table_config.push({ 
                    action: true,
                    title: '', class: 'text-center',
                    model: 'ThaoTac',
                    value: '_source.ThaoTac'
                })
            }
            console.log('vm.table_config', vm.table_config);
            vm.renderF = true;
            vm.renderTable = true;
        });
    },
    methods: {
        afterSubmit() {
            let vm = this;
            vm.vuejxData = {};
            vm.renderTable = false;
            setTimeout(() => {
                vm.renderTable = true;
            }, 400);
        },
        async removeKQ(celldata, index) {
            let vm = this;
            let r = confirm("Bạn có muốn xoá kết quả này.");
            if (r == true) {
                vm.renderTable = false;
                let postData = {
                    _id: celldata._id,
                    "storage": "trash"
                }
                let action = "vuejx_manager/userUpdateById";
                let actionCode = 'NEW'
                await window.VueJX
                .dispatch(action, {
                    db: localStorage.getItem("db"),
                    collection: vm.collection,
                    body: postData,
                    actionCode: actionCode,
                })
                .then((response) => {
                    window.Vue.toastr.success("Thành công.");
                })
                .catch((err) => {
                    window.Vue.toastr.error("Error.");
                });
                setTimeout(() => {
                    vm.renderTable = true;
                }, 200);
            }
        }
    },
    watch: {
        vuejxData: {
            handler(val){
               let KetQuaQuanTrac = {
                KetQuaQuanTrac: val
               }
               const postData = {...val, ...window.dotize.dotize.convert(val), ...window.dotize.dotize.convert(KetQuaQuanTrac)};
               this.$emit('changeData', postData)
            },
            deep: true
        }
    },
    data: ()  => ({
        idTram: '',
        curpage: '',
        condition: [],
        formConfig: {
            type: 0,
            form: []
        },
        vuejxData: {
            'thiet_ke': {},
            'nhan_duoc': {},
            'loi_bat_thuong': {},
            'trung_binh_1h': {},
            'gia_tri_quan_trac': {},
            'so_ngay_trung_binh_1h_vuot_qcvn': {},
            'gia_tri_quan_trac_qcvn': {}
        },
        table_config: [],
        renderF: false,
        renderTable: false,
        dataTieuChi: {
            'thiet_ke': {},
            'nhan_duoc': {},
            'loi_bat_thuong': {},
            'trung_binh_1h': {},
            'gia_tri_quan_trac': {},
            'so_ngay_trung_binh_1h_vuot_qcvn': {},
            'gia_tri_quan_trac_qcvn': {}
        }
    }),
    template: `<div class="vuejx__table" v-if="renderF">
        <div class="flex border-b mb-4">
            <ol class="inline-flex items-center space-x-1 md:space-x-3 flex-1 breadcrumb breadcrumb_crud pl-0" style="padding-left: 0;"><li aria-current="page"><div class="flex items-center"><span class="text-sm font-medium text-gray-400 md:ml-2 dark:text-gray-500"><div class="top-content flex items-center bg-white rounded py-1"><div class="text-green-700 font-bold">Cập nhật kết quả quan trắc</div></div></span></div></li></ol>
        </div>
        <template v-if="mode == 'dinh_ky'">
            <vuejx-screen v-if="formConfig && formConfig.form"
                grid_class="grid grid-cols-4 gap-2"
                :collection="collection"
                :config="formConfig"
                v-model="vuejxData"
                :customRedirect="true"
                @afterSubmit="afterSubmit"
                :data_default="{
                    NamQuanTrac: NamQuanTrac,
                    TramQuanTrac: vuejxData['TramQuanTrac']
                }"
            >
                <template v-slot:action="{ submitData, dataFormX}">
                    <div class="grid grid-cols-4 gap-2 mt-4">
                        <div class="col-span-2"></div>
                        <div>
                            <vuejx-date-combobox v-model="dataFormX['DotQuanTrac']"
                            :data-value="dataFormX['DotQuanTrac']" 
                            :data="dataFormX" :config='{ "model": "DotQuanTrac", "label": "Thời gian quan trắc", "type": "date", "label_class": "leading-tight pb-1 truncate" }'
                            >
                            </vuejx-date-combobox>
                        </div>
                        <div class="hidden">
                            <div class="block font-semibold leading-tight pb-1 truncate">
                                Năm quan trắc
                            </div>
                            <input v-model="dataFormX['NamQuanTrac']"
                                class="bg-gray-200 text-gray-700 p-2 focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                                type="text" :placeholder="'Năm quan trắc...'"
                            />
                        </div>
                        <div class="relative"><button @click="submitData" class=" w-full leading-none font-semibold bg-blue-700 text-white rounded px-4 py-2 focus:outline-none absolute" tabindex="-1" style="height: 32px;bottom: 1px;"> Thêm kết quả quan trắc </button></div>
                    </div>
                </template>
            </vuejx-screen>
            <template v-if="renderTable">
                <vuejx-table-simple-khcn class="mt-4" :noHeader="true" :pagesize="15" :db="db" :collection="collection"
                    :condition="condition" :table_config="table_config">
                    <template v-slot:cell_ThaoTac="{ celldata, index }">
                        <button @click="removeKQ(celldata, index)">
                            <i class="mdi mdi-delete text-red-700 cursor-pointer mx-1"></i>
                        </button>
                    </template>
                </vuejx-table-simple-khcn>
            </template>
        </template>
        <template v-else>
            <table class="border-b w-full bg-white">
                <thead class="w-full">
                    <tr>
                    <th width="50">STT</th>
                    <th class="text-center px-2">Chỉ tiêu quan trắc</th>
                    <th class="text-center px-2">Giá trị quan trắc</th>
                    <th class="text-center px-2">Giá trị QCVN</th>
                    <th class="text-center px-2">Số giá trị quan trắc theo thiết kế</th>
                    <th class="text-center px-2">Số giá trị quan trắc nhận được</th>
                    <th class="text-center px-2">Số giá trị quan trắc lỗi/bất thường</th>
                    <th class="text-center px-2">Số ngày có giá trị trung bình 1 giờ vượt QCVN</th>
                    <th class="text-center px-2">Số giá trị trung bình 1 giờ vượt QCVN</th>
                    </tr>
                </thead>
                <tbody class="border-b w-full bg-white">
                    <tr v-for="(item, index) in formConfig.form" v-bind:key="index">
                        <td width="50" align="center" class="">{{index + 1}}</td>
                        <td class="text-center">
                            <span>{{ item.label }}</span>
                        </td>
                        <td class="text-center  px-2">
                            <input v-model="vuejxData['gia_tri_quan_trac'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                        <td class="text-center px-2">
                            <input v-model="vuejxData['gia_tri_quan_trac_qcvn'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                        <td class="text-center px-2">
                            <input v-model="vuejxData['trung_binh_1h'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                        <td class="text-center  px-2">
                            <input v-model="vuejxData['thiet_ke'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                        <td class="text-center  px-2">
                            <input v-model="vuejxData['nhan_duoc'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">   
                        </td>
                        <td class="text-center  px-2">
                            <input v-model="vuejxData['loi_bat_thuong'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                        <td class="text-center  px-2">
                            <input v-model="vuejxData['so_ngay_trung_binh_1h_vuot_qcvn'][String(item.model).substring(String(item.model).indexOf('\.') + 1)]" class="p-2 ocus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded bg-gray-200 text-gray-700" type="text">
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>
    </div>`
}