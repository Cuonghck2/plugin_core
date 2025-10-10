export default {
    props: {
        table_config: { type: Array, default: () => { return []; } },
        form_config: { type: Array, default: () => { return []; } },
        data: { type: Object, default: () => { return {}; } },
        dataResults: { type: Array, default: () => { return []; } },
        title: { type: String, default: () => { return '' } },
        mode: { type: String, default: () => { return 'vertical' } },
        groupBy: { type: String, default: () => { return '' } },
        groupByKeyArray: { type: String, default: () => { return '' } },
        footer_header: { type: Boolean, default: () => { return false } },
        showAll: { type: Boolean, default: () => { return false } },
        crud: { type: Boolean, default: () => { return false } },
        collection: { type: String, default: () => { return '' } }
    },
    methods: {
        objectView(item, key, defaultVal) { return window.Vue.objectView(item, key, defaultVal) },
        objectViewObject(item, key, defaultVal) { return window.Vue.objectViewObject(item, key, defaultVal) },
        dateView(item, key, defaultVal, dateFormat, itemCf) { 
            return window.Vue.dateView(item, key, defaultVal, dateFormat, itemCf ? itemCf.time : false) 
        },
        isNotEmpty() {
            if (this.data && !window.dotize.dotize.isEmptyObj(this.data)) {
                return true
            } else if (this.data) {
                return true;
            } else {
                return false;
            }
        },
        isArrayData(item, key) {
          try {
            const data = item;
            let result = eval("data." + key);
            if (Array.isArray(result)) {
                return result;
            }
          } catch (error) {
            return [];
          }
        },
        menuTab(index) {
            this.indexTab = index;
        },
        processView(itemData) {
            let vm = this;
            let result = false;
            if (vm.groupBy && vm.groupByKeyArray) {
                for (const elX of vm.isArrayData(itemData, vm.groupBy)) {
                    if (vm.tabs[vm.indexTab] == vm.objectView(elX, vm.groupByKeyArray)) {
                        result = false;
                        break;
                    }
                }
            } else if (vm.groupBy && !vm.groupByKeyArray) {
                result = vm.tabs[vm.indexTab] != vm.objectView(itemData, vm.groupBy)
            }
            return result;
        },
        doEdit() {
            this.isCrud = !this.isCrud;
        }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.isCrud = vm.crud;
            if (this.data && Array.isArray(this.data)) {
                vm.tabs = [];
                vm.indexTab = 0;
                if (vm.groupBy) {
                    if (vm.groupByKeyArray) {
                        for (const el of vm.data) {
                            for (const elX of vm.isArrayData(el, vm.groupBy)) {
                                vm.tabs.push(vm.objectView(elX, vm.groupByKeyArray));
                            }
                        }
                    } else {
                        for (const el of vm.data) {
                            vm.tabs.push(vm.objectView(el, vm.groupBy));
                        }
                    }
                }
                vm.tabs = [...new Set(vm.tabs)];
                vm.emptyData = vm.data.length > 0;
            } else if (this.data && !Array.isArray(this.data)) {
                //vm.emptyData = !window.dotize.dotize.isEmptyObj(this.data);
                vm.emptyData = false;
                for (const el of this.table_config) {
                    if (this.objectView(this.data, el.value)) {
                        vm.emptyData = true
                        break;
                    }
                }
            }
            vm.formConfig['form'] = vm.form_config;
        });
    },
    data: ()  => ({
        emptyData: false,
        tabs: [],
        indexTab: 0,
        isCrud: false,
        formConfig: {
            type: 0,
            form: []
        }
    }),
    template: `
    <div class="vuejx__table bg-white border border-gray-400">
        <div class="font-bold text-blue-700 border-b border-gray-400 table___view__heading relative" v-if="title">
            {{ title }}
            <button v-if="isCrud" @click="doEdit" style="margin-top: -2px;" aria-label="btn" class=" absolute right-0 mr-2 py-1 font-semibold rounded border border-blue-700 text-blue-700 px-3 leading-none focus:outline-none hover:bg-blue-700 hover:text-white ml-2 whitespace-no-wrap" tabindex="-1"> 
                {{  !isCrud && !crud ? 'Cập nhật' : 'Quay lại' }}
            </button>
        </div>
        <div v-if="!title || !isCrud">
            <div class="flex p-1 border-b border-gray-400" v-if="tabs.length > 0">
                <template v-for="(item, index) in tabs">
                    <button v-bind:="index" aria-label="btn" tabindex="-1"
                        @click="menuTab(index)"
                        v-bind:class="[{ 'border-r-0': index < tabs.length - 1, 'bg-blue-100 text-green-800': index == indexTab }, 'text-xs bg-white px-3 py-2 font-semibold text-gray-700 leading-none focus:outline-none border hover:bg-blue-100 hover:text-blue-500 header___btn_menu']"
                    >
                        {{ item }}
                    </button>
                </template>
            </div>
            <table v-if="mode !== 'vertical' && emptyData" :id="idtable" class="border-b w-full bg-white table___view_mode table___view_mode_simple" v-bind:style="{'border-bottom': (dataResults && dataResults.length == 0) ? 'unset' : ''}">
                <thead class="full">
                    <slot name="thead_title"> </slot>
                    <slot name="thead"> <tr><th v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class" style="border-top: 0 !important;"> {{ item.title }} </th> </tr> </slot>
                </thead>
                <tbody class="border-b w-full bg-white"> <slot name="tbody" v-bind:data="data"> <slot name="tbody_title"></slot>
                        <template v-for="(item, index) in data">
                            <tr v-bind:key="index" :class="{'hidden': processView(item) }">
                                <td v-for="(itemCf, indexx) of table_config" v-bind:key="indexx" :width="itemCf.width" :class="itemCf.class">
                                    <slot :name="'cell_' + itemCf.value" v-bind:celldata="item">
                                        <span v-html="itemCf.date ? dateView(item, itemCf.value, '', '', itemCf) : objectView(item, itemCf.value)"></span>
                                    </slot>
                                </td>
                            </tr>
                            <slot :name="'footer_data'" v-bind:celldata="item"></slot>
                            <tr  class="sub__table_title" v-if="footer_header"><td colspan="100" class="font-bold border-b border-gray-400 table___view__heading text-blue-700">{{title}}</td></tr>
                            <tr class="sub__table_info" v-if="footer_header"><td v-for="(item, index) of table_config" v-bind:key="index" :width="item.width" :class="item.class"> {{ item.title }} </td> </tr>
                        </template>
                    </slot>
                </tbody>
            </table>
            <table v-else-if="emptyData" :id="idtable" class="border-b w-full bg-white table___view_mode" v-bind:style="{'border-bottom': (dataResults && dataResults.length == 0) ? 'unset' : ''}">
                <tbody class="border-b w-full bg-white" v-if="Array.isArray(data)" v-for="(itemData, indexData) in data" v-bind:key="indexData">
                    <template v-for="(item, index) in table_config">
                        <tr v-bind:key="index" v-if="objectView(itemData, item.value) || showAll"
                            :class="{'hidden': processView(itemData) }"
                        >
                            <td :width="25" class="font-semibold" v-if="data.length >= 1" v-bind:style="{'border-top': indexData > 0 && index == 0 ? '1px solid #cbd5e0 !important' : ''}">
                                {{ index == 0 ? indexData + 1 : '' }}
                            </td>
                            <td :width="item.width ? item.width : 200" class="font-semibold" v-bind:style="{'border-top': indexData > 0 && index == 0 ? '1px solid #cbd5e0 !important' : ''}">
                                {{ item.title }}
                            </td>
                            <td v-bind:style="{'border-top': indexData > 0 && index == 0 ? '1px solid #cbd5e0 !important' : ''}">
                                <slot :name="'cell_' + item.value" v-bind:celldata="itemData">
                                    <span v-html="item.date ? dateView(itemData, item.value) : objectView(itemData, item.value)"></span> <template v-if="item.prefix">{{ item.prefix }}</template>
                                </slot>
                            </td>
                        </tr>
                    </template>
                    <slot :name="'footer_data'" v-bind:celldata="itemData"></slot>
                </tbody>
                <tbody class="border-b w-full bg-white" v-else>
                    <template v-for="(item, index) in table_config">
                        <tr v-if="item.type == 'label'" v-bind:key="index">
                            <td :colspan="table_config.length" class="td-title">
                                <p>{{ item.title }}</p>
                            </td>
                        </tr>
                        <tr v-else v-bind:key="index" v-if="objectView(data, item.value) || showAll">
                            <td :width="item.width ? item.width : 200" class="font-semibold" :class="item.class" :colspan="item.type == 'header_info' ? 100: ''">
                                <p>{{ item.title }}</p>
                            </td>
                            <td v-if="!crud && item.type != 'header_info'">
                                <slot :name="'cell_' + item.value" v-bind:celldata="data">
                                    <template v-if="item.type === 'file' && objectViewObject(data, item.value)">
                                        <p class="font-semibold text-blue-700 cursor-pointer">
                                            <a class="file__links flex" v-for="(itemxFile, indexFile) in objectViewObject(data, item.value)"
                                                :href="'/admin/security/file/' + itemxFile['bucketName'] + '/' + itemxFile['filename']" target="_blank"    
                                            >
                                                <span class="flex">
                                                    <svg class="attach___file" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                        <g>
                                                            <path id="icon/editor/attach_file_24px" d="M10 3.75V10.9375C10 12.3188 8.88125 13.4375 7.5 13.4375C6.11875 13.4375 5 12.3188 5 10.9375V3.125C5 2.2625 5.7 1.5625 6.5625 1.5625C7.425 1.5625 8.125 2.2625 8.125 3.125V9.6875C8.125 10.0312 7.84375 10.3125 7.5 10.3125C7.15625 10.3125 6.875 10.0312 6.875 9.6875V3.75H5.9375V9.6875C5.9375 10.55 6.6375 11.25 7.5 11.25C8.3625 11.25 9.0625 10.55 9.0625 9.6875V3.125C9.0625 1.74375 7.94375 0.625 6.5625 0.625C5.18125 0.625 4.0625 1.74375 4.0625 3.125V10.9375C4.0625 12.8375 5.6 14.375 7.5 14.375C9.4 14.375 10.9375 12.8375 10.9375 10.9375V3.75H10Z" fill="black" fill-opacity="0.54"/>
                                                        </g>
                                                    </svg>
                                                    <span class="pl-4">{{ itemxFile?.originalname ? itemxFile?.originalname : 'File đính kèm' }}</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 18 18" fill="none">
                                                        <path d="M4.125 15C3.825 15 3.5625 14.8875 3.3375 14.6625C3.1125 14.4375 3 14.175 3 13.875V11.1938H4.125V13.875H13.875V11.1938H15V13.875C15 14.175 14.8875 14.4375 14.6625 14.6625C14.4375 14.8875 14.175 15 13.875 15H4.125ZM9 12.1312L5.38125 8.5125L6.1875 7.70625L8.4375 9.95625V3H9.5625V9.95625L11.8125 7.70625L12.6188 8.5125L9 12.1312Z" fill="#1B5884"></path>
                                                    </svg>
                                                    <span class="mr-1" v-if="indexFile + 1 < objectViewObject(data, item.value).length">, </span>
                                                </span>
                                            </a>
                                        </p>
                                    </template>
                                    <template v-else-if="item.type == 'leaflet' && objectViewObject(data, item.value)">
                                        <vuejx-leaflet-wrap mode="view" :id="item['value']" :item="item" v-model:data="data" 
                                        ></vuejx-leaflet-wrap>
                                    </template>
                                    <span v-else v-html="item.date ? dateView(data, item.value) : objectView(data, item.value)"></span> <template v-if="item.prefix">{{ item.prefix }}</template>
                                </slot>
                            </td>
                            <td class="table___crud" style="padding: 2px 8px !important;" v-else-if="item.type != 'header_info'">
                                <slot :name="'cell_' + item.value" v-bind:celldata="data">
                                    <template v-if="!item.type || item.type == 'text'">
                                        <input style="padding: 6px 8px;"
                                            class="bg-gray-200 focus:outline-none focus:cursor-text w-full border border-gray-200 focus:bg-white focus:border-gray-400 rounded"
                                            type="text" :placeholder="item.title"
                                        />
                                    </template>
                                    <template v-else-if="item.type == 'autocomplete'">
                                        <vuejx-autocomplete :config="{
                                            placeholder: item.title,
                                            modelView: 'object', label_class: '', multiple: false,
                                            chips: false, required: false,
                                            label: '', object: true, itemText: '_source.TenGoi', itemValue: '_source.MaDinhDanh',
                                            link: [ { db: 'CSDL_MTQA', collection: 'T_ChuDauTu', condition: [] } ],
                                            column: ['MaDinhDanh', 'TenGOi', 'type'], sort: [ '_score' ]
                                        }"
                                        ></vuejx-autocomplete>
                                    </template>
                                    <template v-else-if="item.type == 'date'">
                                        <vuejx-date-combobox :config="{}">
                                        </vuejx-date-combobox>
                                    </template>
                                </slot>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
            <div class="p-2" v-else-if="!emptyData">
                Không có dữ liệu
            </div>
        </div>
        <div class="p-2" v-else>
            <vuejx-screen
                ref="uploadFile"
                grid_class="grid grid-cols-4 gap-2 px-2 pb-0"
                :collection="collection"
                :config="formConfig"
            ></vuejx-screen>
        </div>
        <div v-if="!title && crud" class="relative mb-2 pt-2 text-right border-t border-gray-400">
            <button @click="doEdit" class="leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2 focus:outline-none pr-4" tabindex="-1">
                Ghi lại
            </button>                            
        </div>
    </div>
    `
}