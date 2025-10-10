<script setup>
  import { onMounted, ref, reactive, defineExpose } from 'vue'
  const props = defineProps({
    noti: { type: Boolean, default: true},
    modelFormReject: { type: String, default: "" },
    modelForm: { type: String, default: "" },
    modelFormIndex: { type: Number, default: -1 },
    detailPage: { type: String, default: '' },
    db: { type: String, default: localStorage.getItem('db') },
    collection: { type: String, default: ''},
    action_guest: { type: Boolean, default: false},
    demoaction: { type: Array, default: [
      {
        'action': 'Lưu',
        'dest': {
          'TrangThai': {
            '_source': {
              'MaMuc': '01',
              'TenMuc': 'Hiệu lực',
              'type': 'C_TrangThaiQuyTrinh'
            }
          }
        }
      },
      {
        'action': 'Thoát',
        'class': 'back__btn',
        'url': 'back'
      }
    ]},
    grid_class: { type: String, default: 'grid grid-cols-3 gap-2' },
    backPage: { type: String, default:'' },
    codemirrors: { type: Array, default: [] },
    site: { type: String, default: localStorage.getItem('site') },
    config: { type: Object, default: null },
    keys: { type: Object, default: null },
    data: { type: Object, default: null },
    id: { type: String, default: 'NULL' },
    customRedirect: { type: Boolean, default: false }
  })
  const renderPageLoadView = ref(false)
  let detailActin = ref({})
  const formJSON = ref([])
  const dataForm = ref({})
  let itemRole = ref({})
  let vuejxData = ref({
    viewRole: [],
    ignoreRole: []
  })
  let extData = ref(null)
  let searchablePick = ref({})
  let crudablePick = ref({})
  let crudableArrayAdd = ref({})
  const ext_form_popup = ref(false)
  const afterSubmit = ref(false)
  const user = reactive(window.Vue.store.state.user)
  let role = reactive(['guest'])
  const query = reactive(window.Vue.router.currentRoute.value.query)
  const renderScreen = ref(false)
  const emitList = ref([])
  const injectLoadForm = ref(-1)
  const emit = defineEmits(['update:dataForm', 'changeData', 'pingDone', 'dataChange', 'submitData', 'afterSubmit', 'responseSubmit', 'dataChangeArray'])

  const changeData = async (data) => {
    if (data.type == 'autocomplete') {
      let selectedObject = {}
      selectedObject[data.model] = data.data
      delete dataForm.value[data.model]
      window.Vue.set(dataForm.value, data.model, data.data)
      const xxx = window.Vue.flattenKeys(selectedObject)
      for (const el in xxx) {
        dataForm.value[el] = xxx[el]
      }
    } else if (data.type == 'date') {
      dataForm.value[data.model] = data.data
    }
    if (!props.modelForm && !dataForm.value.hasOwnProperty('no___render')) {
      emit('changeData', dataForm.value);
      emit('dataChange', {
        data: dataForm.value,
        key: data.model,
        index: props.modelFormIndex,
        model: props.modelForm
      });
    } else if (props.modelFormIndex != -1 && data.model && props.modelForm) {
        emit('dataChangeArrayForm', {
          data: dataForm.value,
          key: data.model,
          index: props.modelFormIndex,
          model: props.modelForm
        });
    }
  }
  const init = async () => {
    renderPageLoadView.value = false
    setTimeout(() => {
      renderPageLoadView.value = true
    }, 100);
    renderScreen.value = false
    if (user) {
      role = user.role
      if (props.collection == 'vuejx_collection' && user.username == 'admin') {
        props.demoaction.push({
            'action': 'Reindex',
            'class': 'leading-none font-semibold border border-red-700 text-red-700 mx-2 rounded px-4 py-2 reindex__btn focus:outline-none',
            'reindex': true
        })
      }
    }
  
    formJSON.value = Array.isArray(props.config.form) ? props.config.form : [
      { model: 'MaMuc', type: 'text', class: 'xs12 sm4', label: 'Mã mục' },
      { model: 'TenMuc', type: 'text', class: 'xs12 sm8', label: 'Tên mục' },
      { type: "done" }
    ]
    if (props.data) {
      dataForm.value = props.data
    } else {
      if (query._id && query._id != 'NULL') {
        dataForm.value = await window.Vue.$root
          .dispatch("vuejx_manager/userById", {
            db: localStorage.getItem("db"),
            collection: props.collection,
            id: query["_id"],
            keys: props.keys
          })
      } else if (query.referenceUid) {
        
        dataForm.value = await window.Vue.$root
          .dispatch("vuejx_manager/userOne", {
            db: localStorage.getItem("db"),
            collection: props.collection,
            keys: null,
            filter: {
              referenceUid:
                query["referenceUid"],
            },
            skip: 0,
          })
            
      }
      if (dataForm.value) {
        dataForm.value = window.Vue.flattenKeys(dataForm.value, null, true);
      } else {
        dataForm.value = {}
      }
    }

    let missingPingDone = true
    formJSON.value.reduce(function(s, a) {
        if (a.type === "text") {
          if (a.defaultVal) {
            dataForm.value[a.model] = a.defaultVal;
          }
        } else if (a.type === "number") {
          if (a.defaultVal) {
            dataForm.value[a.model] = a.defaultVal;
          } else if (a.currentYear) {
            dataForm.value[a.model] = new Date().getFullYear();
          } else if (a.currentQuarter) {
            const monthCur = Math.floor(new Date().getMonth()/3) + 2;
            dataForm.value[a.model] =  monthCur > 4? monthCur - 4 : monthCur;
          }
        } else {
          if (a.defaultVal) {
            dataForm.value[a.model] = a.defaultVal;
          }
        }
        if (a.type == 'done') {
          missingPingDone = false
        }
        return s;
    }, {});
    if (missingPingDone) {
      formJSON.value.push({type: 'done' })
    }
    setTimeout(() => {
      injectLoadForm.value = 1
    }, 1000);
    renderScreen.value = true
    emit("update:dataForm", dataForm.value);
  }

  onMounted(() => {
    injectLoadForm.value = -1
    setTimeout(async () => {
      await init()
    }, 0);
  })
  
  const objectView = (item, key, defaultVal) => {
    return window.Vue.objectView(item, key, defaultVal)
  }
  const dateView = (item, key, defaultVal, dateFormat) => {
    return window.Vue.dateView(item, key, defaultVal, dateFormat)
  }
  const pingDone = async (data) => {
    emit('pingDone', dataForm.value);
  }

  const submitData = async (action, doneExt) => {
    afterSubmit.value = true;
    console.log('action', action, action.emit);
    if (action.emit) {
      emit(action.emit, action);
      return;
    }
    if (action.reindex) {
      //reindex
      return;
    }
    let valid = true
    if (Array.isArray(formJSON.value)) {
      for (let el of formJSON.value) {
        if (el.required && !dataForm.value[el.model] && el.type != 'label') {
          valid = false;
          break
        }
      }
    }
    setTimeout(async () => {
      if (!valid && !action.novalid) {
        window.Vue.toastr.error("Kiểm tra các trường thông tin bắt buộc.");
        emit('required_action', {});
      } else {
        if (!valid && action.novalid && !action.novalidConfirm) {
          alert(action.novalidMsg ? action.novalidMsg : 'Lưu sơ bộ cập nhật cập nhật các trường dữ liệu bắt buộc, kiểm tra các trường thông tin bắt buộc')
        }
        detailActin.value = {};
        ext_form_popup.value = false;
        if (action.ext_field && !doneExt) {
          ext_form_popup.value = true;
          detailActin.value = action;
        } else {
          if (action.url) {
            if (action.url == 'back') {
              window.Vue.router.go(-1);
            } else {
              window.location.href = action.url;
            }
            return;
          } else if (action.del) {
            let r = confirm('Bạn muốn xoá bản ghi này?');
            if (r != true) {
              return;
            }
            dataForm.value['storage'] = 'trash'
          }
          if (action.dest) {
            dataForm.value = { ...dataForm.value, ...window.Vue.flattenKeys(action.dest) };
          }
          if (extData.value) {
            dataForm.value = { ...dataForm.value, ...extData.value };
          }
          dataForm.value['PostDB'] = props.db;
          dataForm.value['PostCollection'] = (dataForm.value['type'] && dataForm.value['type'] != props.collection) ? dataForm.value['type'] : props.collection;
          if (window.Vue.router.currentRoute.value.query["referenceUid"]) {
            dataForm.value['referenceUid'] = window.Vue.router.currentRoute.value.query["referenceUid"];
          }
          if (action.confirm) {
            if (confirm(action.confirm)) {
              renderPageLoadView.value = false
              await submitDataAction(dataForm.value, props.customRedirect, action);
              emit('submitData', dataForm.value);
            }
          } else {
            renderPageLoadView.value = false
            await submitDataAction(dataForm.value, props.customRedirect, action);
            emit('submitData', dataForm.value);
          }
          setTimeout(() => {
            renderPageLoadView.value = true
          }, 100);
        } 
      }
    }, 100);
  }
  const submitDataAction = async (dataForm, customRedirect, actionEv) => {
          let postData = dataForm;
          if (postData["site"]) {
          } else {
            postData["site"] = props.site;
          }
          let action = "vuejx_manager/userCreate";
          if (postData._id) {
            action = "vuejx_manager/userUpdateById";
          }
          let dbPost = postData["PostDB"];
          let collectionPost = postData["PostCollection"];
          let actionCode = postData["actionCode"];
          delete postData["actionCode"];
          delete postData["PostCollection"];
          delete postData["PostDB"];
          delete postData['metadata']
          for (let rKey in postData) {
            if (String(rKey).startsWith('metadata.') && rKey != 'metadata.MaPhienBan' && rKey != 'metadata.LoiRangBuocDuLieu' && rKey != 'metadata.NguonThamChieu'
            && rKey != 'metadata.TrungLapDuLieu' && rKey != 'metadata.ThoiGianTao') {
              delete postData[rKey]
            }
          }
          if (dbPost !== undefined && dbPost !== null && dbPost !== "") {
            await window.Vue.$root
              .dispatch(action, {
                db: localStorage.getItem("db"),
                collection: collectionPost,
                body: postData,
                actionCode: actionCode,
              })
              .then((response) => {
                emit("responseSubmit", response);
                if (response?.status == 500 || response?.status == 409 || response?.status == 404) {
                  return
                } else {
                  window.Vue.toastr.success("Thành công.");
                }
                if (
                  response.data !== undefined &&
                  response.data.insertedId !== undefined
                ) {
                  dataForm['_id'] = response.data.insertedId;
                  if (customRedirect) {
                    if (actionEv.ignore_query) {
                      let redirectQuery = [ { key: "t", value: new Date().getTime() } ]
                      for (let elRe of actionEv.ignore_query) {
                        redirectQuery.push({ key: elRe, value: "" })
                      }
                      setTimeout(() => {
                        window.Vue.redirect( redirectQuery, true );
                      }, 500);
                    } else {
                      emit("afterSubmit", {
                        insertedId: response.data.insertedId,
                        postData: postData,
                        modelForm: props.modelForm
                      });
                    }
                  } else {
                    if (actionEv.ignore_query) {
                      let redirectQuery = [ { key: "t", value: new Date().getTime() } ]
                      for (let elRe of actionEv.ignore_query) {
                        redirectQuery.push({ key: elRe, value: "" })
                      }
                      setTimeout(() => {
                        window.Vue.redirect( redirectQuery, true );
                      }, 500);
                    } else {
                      window.Vue.redirect([ { key: "_id", value: response.data.insertedId, }, { key: "t", value: new Date().getTime() } ], true );
                    }
                  }
                } else {
                  if (customRedirect) {
                    if (actionEv.ignore_query) {
                      let redirectQuery = [ { key: "t", value: new Date().getTime() } ]
                      for (let elRe of actionEv.ignore_query) {
                        redirectQuery.push({ key: elRe, value: "" })
                      }
                      setTimeout(() => {
                        window.Vue.redirect( redirectQuery, true );
                      }, 500);
                    } else {
                      emit("afterSubmit", {
                        modifiedCount: 1,
                      });
                    }
                  } else {
                    if (actionEv.ignore_query) {
                      let redirectQuery = [ { key: "t", value: new Date().getTime() } ]
                      for (let elRe of actionEv.ignore_query) {
                        redirectQuery.push({ key: elRe, value: "" })
                      }
                      setTimeout(() => {
                        window.Vue.redirect( redirectQuery, true );
                      }, 500);
                    } else {
                      window.Vue.redirect( [ { key: "t", value: new Date().getTime() } ], true );
                    }
                  }
                }
              })
              .catch((err) => {
                console.log('errerr ', err);
                window.Vue.toastr.error("Error.");
              });
          }
  }

  

  const dataChangeArray = (data) => {
    emit("dataChange", {
      data: data.data,
      key: data.key
    })
  }
  const changeDatedata = (data) => {
    emit("dataChange", {
      data: data.data,
      key: data.key,
      index: props.modelFormIndex,
      model: props.modelForm
    })
  }
  const dataChange = async (key, type) => {
    emit("dataChange", {
      data: dataForm.value,
      key: key,
      index: props.modelFormIndex,
      model: props.modelForm
    })
  }

  const processArrayDelete = async (index, model) => {
    if (confirm('a Bạn muốn xoá bản ghi này?')) {
      dataForm.value[model].splice(index, 1);
    }
  }
  const processArray = async (data, model, config) => {
    crudableArrayAdd.value[model] = true;
    let dataClean = window.Vue.backward(data);
    let valid = true
    if (Array.isArray(config.form)) {
      for (let el of config.form) {
        if (el.required && !objectView(dataClean, el.model)) {
          valid = false;
          break
        }
      }
    }
    if (valid) {
      if (Array.isArray(dataForm.value[model])) {
        dataForm.value[model].push(dataClean)
      } else {
        dataForm.value[model] = [dataClean];
      }
    } else {
      alert('Trường thông tin bắt buộc nhập.')
    }
    emit("dataChange", {
      data: dataForm.value,
      key: model,
      index: props.modelFormIndex,
      model: props.modelForm
    })
    setTimeout(() => {
      crudableArrayAdd.value[model] = false
    }, 0);
  }
  const processArrayTable = async (data, model, multiple, item) => {
    if (multiple) {
      if (Array.isArray(dataForm.value[model])) {
        dataForm.value[model].push({
          _id: data._id,
          _source: data._source
        })
      } else {
        dataForm.value[model] = [{
          _id: data._id,
          _source: data._source
        }];
      }
    } else {
      let flatObject = {}
      flatObject[model] = {
        _id: data._id,
        _source: data._source
      };
      flatObject = window.Vue.flattenKeys(flatObject);
      console.log('flatObject', flatObject)
      dataForm.value = {...dataForm.value, ...flatObject};
      if (item?.formConfigEdit) {
        delete searchablePick.value[model]
      }
    }
    emit("dataChange", {
      data: dataForm.value,
      key: model,
      index: props.modelFormIndex,
      model: props.modelForm
    })
  }
  const flattenKeysData = (data, flattenKeysData) => {
    let modelToFlatten = data
    if (flattenKeysData) {
      modelToFlatten[flattenKeysData] = data
    }
    return window.Vue.flattenKeys(modelToFlatten);
  }
  const isPickTableSelect = async (data, model, multiple) => {
    let isPick = false;
    return isPick;
  }
  const changeBoolean = async (model) => {
    dataForm.value[model] = !dataForm.value[model];
  }
  const removeArray = async (index, model, id, mutiple) => {
    if (confirm("Bạn có muốn xoá bản ghi này.")) {
      if (id) {
        if (mutiple && Array.isArray(dataForm.value[model])) {
          const indexOfObject = dataForm.value[model].findIndex(object => {
            return object._id == id;
          });
          dataForm.value[model].splice(indexOfObject, 1);
        } else if (!mutiple && Array.isArray(dataForm.value[model])) {
          const indexOfObject = dataForm.value[model].findIndex(object => {
            return object._id == id;
          });
          dataForm.value[model].splice(indexOfObject, 1);
        } else if (!mutiple && !Array.isArray(dataForm.value[model])) {
          dataForm.value[model] = null
        }
      } else {
        console.log('mutiplemutiplemutiple', mutiple, model, index, dataForm.value[model]);
        if (mutiple && Array.isArray(dataForm.value[model])) {
          dataForm.value[model].splice(index, 1); 
        } else if (!mutiple && Array.isArray(dataForm.value[model])) {
          dataForm.value[model].splice(index, 1); 
        } else if (!mutiple && !Array.isArray(dataForm.value[model])) {
          dataForm.value[model] = null
        }
      }
      emit("dataChange", {
        data: dataForm.value,
        key: model,
        index: props.modelFormIndex,
        model: props.modelForm
      })
    }
  }
  const changeRole = async () => {
    let accessRoles = [];
    if (Array.isArray(dataForm.value['viewRole'])) {
      for (const el of dataForm.value['viewRole']) {
        accessRoles.push({
          "shortName": el._source.MaMuc,
          "title": el._source.TenMuc,
          "permission": 1
        })
      }
    }
    if (Array.isArray(dataForm.value['ignoreRole'])) {
      for (const el of dataForm.value['ignoreRole']) {
        accessRoles.push({
          "shortName": el._source.MaMuc,
          "title": el._source.TenMuc,
          "permission": 5
        })
      }
    }
    dataForm.value['accessRoles'] = accessRoles;
  }
  const copyTestingCode = (id, model) => {
    let htmlTemplate = document.getElementById(id).innerHTML;
    dataForm.value[model] = htmlTemplate.trim();
  }
  const inlineSearchAction = (data) =>{
    searchablePick.value[data.modelName] = data.state
    if (Array.isArray(dataForm.value[data.modelName]) && dataForm.value[data.modelName].length == 0) {
      dataForm.value = window.Vue.omit(dataForm.value, [data.modelName])
      dataForm.value = window.Vue.omit(dataForm.value, [data.modelName])
      dataForm.value = window.Vue.omit(dataForm.value, [data.modelName])
    }
  }
  const afterSubmitTable = (data) => {
    dataForm.value[data.modelForm].push({
      _id: data.insertedId,
      _source: window.Vue.backward(data.postData)
    })
    crudablePick.value[data.modelForm] = false
  }
  const doAddTableData = (model) => {
    //this.$refs['formCRUDTable' + model][0].submitData({})
  }
  const changeDataFormArrayTable = (data) => {
    if (!Array.isArray(dataForm.value[data.model])) {
      for (let key in data.data) {
        dataForm.value[data.model + '._source.' + key] = data.data[key]
      }
    } else if (Array.isArray(dataForm.value[data.model]) && dataForm.value[data.model][data.index]) {
      if (window.Vue.get(data.data, data.key) != window.Vue.get(dataForm.value[data.model][data.index], data.key)) {
        dataForm.value[data.model][data.index] = {
          _source: window.Vue.backward(data.data)
        }
      }
    }
  }
  const changeDataFormArray = (data) => {
    if (Array.isArray(dataForm.value[data.model]) && dataForm.value[data.model][data.index]) {
      if (window.Vue.get(data.data, data.key) != window.Vue.get(dataForm.value[data.model][data.index], data.key)) {
        dataForm.value[data.model][data.index] = window.Vue.backward(data.data)
      }
    }
    emit('dataChangeArrayRoot', {
      data: dataForm.value,
      key: data.key,
      index: data.index,
      model: data.model
    });
  }
  const processArrayTableView = (item) => {
    let result = []
    if (dataForm.value && Array.isArray(dataForm.value[item.model])) {
      result = dataForm.value[item.model]
    } else if (dataForm.value) {
      result = [dataForm.value[item.model]]
    }
    return result;
  }

  const doneMapData = (data) => {
    console.log('doneMapDatadoneMapDatadoneMapData', data);
    dataForm.value = { ...dataForm.value, ...data};
  }

  defineExpose({
    changeData,
    dataForm, formJSON,
    submitData, submitDataAction
  })
  
</script>

<template>
  <div class="dynamic__form__vuejx___wrap relative z-50" :class="{'done___loading': renderPageLoadView}">
    <div class="dynamic__form__vuejx" :class="[{'done___loading': renderPageLoadView}, grid_class]">
      <slot name="top" v-bind:dataForm="dataForm"></slot>
        <template v-if="renderScreen">

          <div :class="item['class']" v-for="(item, index) in formJSON" v-bind:key="index">
            <label v-if="item['type'] === 'text'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate">
                {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                <span
                    class="required__class"
                    v-if="item['required']"
                >*</span>
                </div>
                <input :id="item.model"
                v-model="dataForm[item.model]"
                class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
                :type="item.type_text ? item.type_text : 'text'"
                :placeholder="item['placeholder']"
                :disabled="item.disable"
                @change="changeData({
                  model: item.model,
                  modelFormIndex: modelFormIndex,
                  modelForm: modelForm
                })"
                />
                <div v-if="item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
            </label>
            <label v-else-if="item['type'] === 'textarea'" :class="'vuejx_comp___' + item['model']">
              <div class="block font-semibold leading-tight pb-1 truncate">
              {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
              <span
                  class="required__class"
                  v-if="item['required']"
              >*</span>
              </div>
              <n-input
                v-model:value="dataForm[item.model]"
                class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                :placeholder="item['placeholder'] ? item['placeholder'] : item['label']"
                type="textarea"
                size="small"
                :autosize="item['autosize'] ? item['autosize'] : {
                  minRows: 1,
                  maxRows: 25
                }"
                :on-change="changeData({
                  model: item.model,
                  modelFormIndex: modelFormIndex,
                  modelForm: modelForm
                })"
              />
              <div v-if="item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
            </label>
            <vuejx-autocomplete-wrap v-else-if="item['type'] === 'autocomplete'" 
              :item="item" :dataForm="dataForm" @changeData="changeData"
              :modelFormIndex="modelFormIndex"
              :modelForm="modelForm"
            ></vuejx-autocomplete-wrap>
            <vuejx-date-combobox v-else-if="item['type'] === 'date'" :key="dataForm[item.model]"
              :config="item" :data="dataForm" :dataForm="dataForm" @changeData="changeData"
              :time="item.time"
            ></vuejx-date-combobox>
            <div v-else-if="item['type'] === 'file'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate text-left" v-if="item['label'] && !item.hidden_label">
                {{ item['label'] }}
                <span
                    class="required__class"
                    v-if="item['required']"
                >*</span>
                </div>
                <vuejx-upload :id="item['model']" :class="item['upload_class']"
                :uploadUrl="item['uploadUrl']" :multiple="String(item['multiple']) == 'true'" 
                :maxFiles="item['maxFiles']" 
                :accept="item['accept'] ? item['accept'] : '.jpeg, .jpg, .png, .pdf, .doc, .docx'" 
                :helpText="item['helpText'] ? item['helpText'] : 'Đính kèm'" 
                v-model:data="dataForm" 
                :config="{
                    model: item['model']
                }
                ">
                </vuejx-upload>
                <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
            </div>
            <div v-else-if="item['type'] === 'number'" :class="'vuejx_comp___' + item['model']">
              <div class="block font-semibold leading-tight pb-1 truncate">
                  {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                  <span
                  class="required__class"
                  v-if="item['required']"
                  >*</span>
              </div>
              <vuejx-number :key="item.disable ? dataForm[item.model] : ''"
                v-model:data="dataForm" v-model="dataForm[item.model]"
                :dataRaw="dataForm[item.model]"
                :item="item"
                :options="{...{
                  prefix: '',
                  suffix: '',
                  decimal: '',
                  thousand: '',
                  precision: 0,
                  acceptNegative: false,
                  isInteger: false
                }, ...item.options}"
                @changeData="changeData"
                :modelFormIndex="modelFormIndex"
                :modelForm="modelForm"
                class="relative p-2 focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
              >
              </vuejx-number>
              <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
            </div>
            <vuejx-boolean v-else-if="item['type'] === 'boolean'" :item="item" :dataForm="dataForm"></vuejx-boolean>
            <vuejx-region v-else-if="item['type'] === 'region'"
              :item="item" :dataForm="dataForm" @changeData="changeData"
            ></vuejx-region>
            <div v-else-if="item['type'] === 'leaflet'" :class="'vuejx_comp___' + item['model']">
              <vuejx-leaflet-wrap v-model="dataForm[item.model]" :id="item['model']" :item="item" v-model:data="dataForm" 
                @doneMapData="doneMapData"
              ></vuejx-leaflet-wrap>
            </div>
            <div v-else-if="item['type'] === 'table'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate">
                {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                <span
                    class="required__class"
                    v-if="item['required']"
                >*</span>
                </div>
                <vuejx-table-simple-selected
                  :pagesize="10"
                  :noRouterr="true"
                  :noHeader="item.noHeader"
                  :storage="item.storage"
                  :modelName="item.model"
                  @inlineSearchAction="inlineSearchAction"
                  :inlineSearch="true"
                  :paging="searchablePick[item.model] ? true : false"
                  :collection="item.collection"
                  :table_config="item.table_config"
                  :filter_options="item.filter_options"
                  :includes="item.includes"
                  :keywords="item.keywordsCfg"
                  :queryFilter="item.re_calculator"
                  :condition="item.condition"
                >
                
                
                    <template v-if="searchablePick[item.model] && item.formConfigEdit" v-slot:ext_btn_2>
                        <button @click="processArrayTable({
                          _source: {}
                        }, item.model, item.multiple, item)" aria-label="btn" class="filter___adv font-semibold rounded border border-blue-700 text-blue-700 px-3 leading-none focus:outline-none hover:bg-blue-700 hover:text-white ml-2 whitespace-no-wrap" tabindex="-1">
                          Thêm mới
                        </button>
                      </template>
                      <template v-if="!item.formConfigEdit" v-slot:total_pick>
                          <span v-if="Array.isArray(dataForm[item.model])">{{dataForm[item.model].length}}</span>
                          <span v-else>{{dataForm[item.model] ? 1 : 0 }}</span>
                      </template>

                      <template v-if="crudablePick[item.model]" v-slot:button_ext>
                          <vuejx-screen v-if="crudablePick[item.model]" :ref="'formCRUDTable' + item.model" :grid_class="item.grid_class" 
                          :collection="item.collection"
                          :config="item.formConfig" 
                          :customRedirect="true"
                          :modelForm="item.model"
                          @afterSubmit="afterSubmitTable"
                        >
                          <template v-slot:action="submitData">
                            <div class="my-3 text-right">
                              <button aria-label="btn" class="leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2 focus:outline-none" tabindex="-1" @click="doAddTableData(item.model)">Thêm mới</button>
                              <button style="border-radius: 4px !important;" aria-label="btn" class="leading-none font-semibold border border-blue-700 text-blue-700 rounded px-4 py-2 back__btn focus:outline-none" tabindex="-1" @click="crudablePick[item.model] = !crudablePick[item.model]">Thoát</button>
                            </div>
                          </template>
                        </vuejx-screen>
                      </template>
                      <template v-if="item.formConfig && !crudablePick[item.model] && !item.formConfigEdit" v-slot:ext_btn_2>
                        <button aria-label="btn" class="filter___add_cms whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 bg-blue-700 text-white px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="crudablePick[item.model] = !crudablePick[item.model]">Thêm mới</button>
                      </template>
                      <template v-if="dataForm[item.model] && !searchablePick[item.model] && item.formConfigEdit" v-slot:thead>
                          <span></span>
                      </template>
                      <template v-else v-slot:thead>
                        <tr>
                        <th :width="40">STT</th>
                        <th v-for="(itemTH, indexTH) of item.table_config" v-bind:key="indexTH" :width="itemTH.width" :class="itemTH.class"> {{ itemTH.title }} </th>
                        <th :width="80"></th>
                        </tr>
                      </template>
                      <template v-slot:tbody="{ data }">
                        <template v-if="dataForm[item.model] && !searchablePick[item.model] && !item.formConfigEdit">
                            <tr v-for="(celldata, index) in processArrayTableView(item)" v-bind:key="index">
                              <td align="center" >
                                {{ index + 1 }}
                              </td>
                              <td :width="tblConfig.width" v-for="(tblConfig, indexTblConfig) in item.table_config" :key="indexTblConfig" :class="tblConfig.class" >
                                  
                                  <template v-if="tblConfig.viewType == 'autocomplete'">
                                    <vuejx-autocomplete :config="{
                                        placeholder: tblConfig.placeholder,
                                        modelView: 'object',
                                        model: '' + tblConfig.model, required: false,
                                        label: '', object: true, 
                                        itemText: tblConfig.itemText ? tblConfig.itemText : '_source.TenMuc', 
                                        itemValue: tblConfig.itemValue ? tblConfig.itemValue : '_source.MaMuc',
                                        link: [ { collection: tblConfig.collection } ],
                                        column: tblConfig.column ? tblConfig.column : ['MaMuc', 'TenMuc', 'type'], 
                                        sort: tblConfig.sort ? tblConfig.sort : [ '_score' ]
                                    }" :data="celldata._source" v-model:data="celldata._source"
                                      :flatten="false"
                                    ></vuejx-autocomplete>
                                  </template>
                                  <template v-else>
                                    <template v-if="tblConfig && tblConfig.arrayTableKey">
                                      <template v-for="(elementArr, elementArrInd) in (celldata._source[tblConfig.arrayTableKey] || [])">
                                        <div v-html="dateView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1]) || objectView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1])"></div>
                                        <br>
                                      </template>
                                    </template>
                                    <template v-else-if="tblConfig && tblConfig.value">
                                      <template v-if="tblConfig.value.indexOf(',') == -1">
                                        <div v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, tblConfig.value, tblConfig.dataView)] : objectView(celldata, tblConfig.value)"></div>
                                      </template>
                                      <template v-else>
                                        <div v-for="(valueReal, indexReal) in tblConfig.value.split(',')">
                                        <span class="prefix___label_td" 
                                        v-if="tblConfig.prefix && tblConfig.prefix[indexReal]" 
                                        v-html="tblConfig.prefix[indexReal].startsWith('_') && !(tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date' ? dateView(celldata, valueReal) : objectView(celldata, valueReal)) ? tblConfig.prefix[indexReal].substr(1) + ' <i>Chưa cập nhật</i>' : (tblConfig.prefix[indexReal].startsWith('_') ? tblConfig.prefix[indexReal].substr(1) : tblConfig.prefix[indexReal])"></span>
                                          <span v-if="tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date'" class="val___label_td" v-html="dateView(celldata, valueReal)"></span>
                                          <span v-else class="val___label_td" v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, valueReal, tblConfig.dataView)] : objectView(celldata, valueReal)"></span>
                                        </div>
                                      </template>
                                    </template>
                                    
                                  </template>
                              </td>
                              <td class="text-center" >
                                <button class="table_button___clear" tabindex="0" type="button" @click="removeArray(index, item.model, null, item.multiple)">
                                  <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                </button>
                              </td>
                          </tr>
                        </template>
                        <template v-else-if="dataForm[item.model] && !searchablePick[item.model] && item.formConfigEdit">
                          <template v-for="(itemDataArray, indexAr) in processArrayTableView(item)" v-bind:key="indexAr">
                            <tr>
                              <td :colspan="item.table_config.length" class="relative sub___array_crud">
                                <button 
                                  @click.stop="removeArray(indexAr, item.model, itemDataArray._id, item.multiple)"
                                  aria-label="btn" class="table_button___clear remove__table_array_index" tabindex="0" type="button" style="left: -66px;">
                                  <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                </button>
                                <vuejx-screen class="z-10" :ref="'formInputArray_' + indexAr" :grid_class="item.grid_class" :config="item.formConfigEdit" 
                                  :modelForm="item.model" :modelFormIndex="indexAr"
                                  @dataChangeArrayForm="changeDataFormArrayTable" 
                                  :data="flattenKeysData(itemDataArray?._source)">
                                    <template v-slot:action="{ modelx, dataFormX }" >
                                      <span></span>
                                    </template>
                                </vuejx-screen>
                              </td>
                            </tr>
                            <tr v-if="indexAr + 1 < processArrayTableView(item).length" style="height: 8px;"></tr>
                          </template>
                        </template>
                        <template v-else-if="searchablePick[item.model]">
                          <tr v-for="(celldata, index) in (data && data.length ? data : [] )" v-bind:key="index">
                            <td :width="widthSTT" align="center" >
                            {{ index + 1 }}
                            </td>
                            <td :width="tblConfig.width" v-for="(tblConfig, indexTblConfig) in item.table_config" :key="indexTblConfig" class="text-left" >
                                <template v-if="tblConfig && tblConfig.arrayTableKey">
                                  <template v-for="(elementArr, elementArrInd) in (celldata._source[tblConfig.arrayTableKey] || [])">
                                    <div v-html="dateView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1]) || objectView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1])"></div>
                                    <br/>
                                  </template>
                                </template>
                                <template v-else-if="tblConfig && tblConfig.value">
                                  <template v-if="tblConfig.value.indexOf(',') == -1">
                                    <div v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, tblConfig.value, tblConfig.dataView)] : objectView(celldata, tblConfig.value)"></div>
                                  </template>
                                  <template v-else>
                                    <div v-for="(valueReal, indexReal) in tblConfig.value.split(',')">
                                      <span class="prefix___label_td" 
                                        v-if="tblConfig.prefix && tblConfig.prefix[indexReal]" 
                                        v-html="tblConfig.prefix[indexReal].startsWith('_') && !(tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date' ? dateView(celldata, valueReal) : objectView(celldata, valueReal)) ? tblConfig.prefix[indexReal].substr(1) + ' <i>Chưa cập nhật</i>' : (tblConfig.prefix[indexReal].startsWith('_') ? tblConfig.prefix[indexReal].substr(1) : tblConfig.prefix[indexReal])"></span>
                                      <span v-if="tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date'" class="val___label_td" v-html="dateView(celldata, valueReal)"></span>
                                      <span v-else class="val___label_td" v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, valueReal, tblConfig.dataView)] : objectView(celldata, valueReal)"></span>
                                    </div>
                                  </template>
                                </template>
                            </td>
                            <td :width="60" class="text-center" >
                                <button v-if="Array.isArray(dataForm[item.model]) && dataForm[item.model].findIndex(item => item._id == celldata._id) >= 0"
                                  @click.stop="removeArray(index, item.model, celldata._id, item.multiple)" aria-label="btn"
                                  class="table_button___clear" tabindex="0" type="button">
                                  <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                </button>
                                <button v-else-if="!item.multiple && dataForm[item.model] && dataForm[item.model]['_id'] == celldata._id"
                                  @click.stop="removeArray(index, item.model, celldata._id, item.multiple)" aria-label="btn"
                                  class="table_button___clear" tabindex="0" type="button">
                                  <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                </button>
                                <button v-else class="table_button___clear" tabindex="0" type="button" @click="processArrayTable(celldata, item.model, item.multiple, item)">
                                  <span class="n-button__icon font-semibold text-blue-700 border-b border-blue-700">Chọn</span>
                                </button>
                            </td>
                        </tr>
                    </template>
                    <tr v-else>
                        <td :width="widthSTT"
                            :colspan="item.table_config.length + 2" align="left">
                            Chưa có dữ liệu
                        </td>
                    </tr>
                  </template>
                </vuejx-table-simple-selected>
                <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
            </div>
            <div class="-mt-4" v-else-if="item['type'] === 'array' && Array.isArray(item.form)">
              <div class="block___label">
                <div><div class="block font-semibold leading-tight pb-1 truncate">{{ item.label }}
                <span class="text-white ml-2" style="position: absolute;font-size: 24px;margin-top: 5px;" v-if="item['required']" >*</span></div></div>
              </div>

                <vuejx-screen class="-mt-3" :grid_class="item.grid_class" :config="item" 
                  v-if="!crudableArrayAdd[item.model]" :modelForm="item.model"
                >
                    <template v-slot:action="{ modelx, dataFormX }" >
                      <slot :name="'array_button_' + item['model']" v-bind:processArray="processArray" v-bind:dataFormXInput="dataFormX" v-bind:dataFormX="dataForm" v-bind:item="item" v-bind:modelx="modelx">
                        <div class="my-2 text-right">
                          <button @click="processArray(dataFormX, item.model, item)"
                            class="leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2 focus:outline-none" tabindex="-1">
                            Thêm mới
                          </button>
                        </div>
                      </slot>
                    </template>
                </vuejx-screen>

                <slot :name="'array_' + item['model']" v-bind:dataArrayModel="dataForm[item.model]" v-bind:processArrayDelete="processArrayDelete" v-bind:dataFormX="dataForm" v-bind:item="item">

                  <div class="relative" v-for="(itemDataArray, indexAr) in dataForm[item.model]" v-bind:key="indexAr">
                    <div class="block___label block___label_index">
                      <div><div class="block font-semibold leading-tight pb-1 truncate">
                      <button @click.stop="processArrayDelete(indexAr, item.model)"
                        tabindex="0" type="button" class="remove__table_array_index"><span class="text-red-700 mr-1">Xoá dữ liệu</span></button>
                      {{ indexAr + 1 }}
                      </div></div>
                    </div>
                    <vuejx-screen class="z-10" :ref="'formInputArray_' + indexAr" :grid_class="item.grid_class" :config="item" 
                      :modelForm="item.model" :modelFormIndex="indexAr" @dataChangeArrayForm="changeDataFormArray"
                      :data="flattenKeysData(itemDataArray)">
                        <template v-slot:action="{ modelx, dataFormX }" >
                          <span></span>
                        </template>
                    </vuejx-screen>
                  </div>
                
                </slot>
                <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>  
            </div>
            <div v-else-if="item['type'] === 'role'">
              <div class="col-span-4 text-green-700 uppercase font-bold mt-4">
                <div class="vuejx_comp___undefined">
                  <div class="block font-semibold leading-tight pb-1 truncate">{{ item.label }}</div>
                </div>
              </div>
              <vuejx-autocomplete :config="{
                modelView: 'object', itemText: '_source.TenMuc', itemValue: '_source.MaMuc',
                model: 'viewRole', multiple: true,
                label: 'Quyền đọc dữ liệu', object: true,
                link: [{ collection: 'C_ROLE' }],
                column: ['MaMuc', 'TenMuc', 'type'],
              }" :data="vuejxData" v-model="vuejxData['viewRole']"
                @change="changeRole"
              ></vuejx-autocomplete>
              <vuejx-autocomplete :config="{
                modelView: 'object', itemText: '_source.TenMuc', itemValue: '_source.MaMuc',
                model: 'ignoreRole', multiple: true,
                label: 'Quyền không nhìn dữ liệu', object: true,
                link: [{ collection: 'C_ROLE' }],
                column: ['MaMuc', 'TenMuc', 'type'],
              }" :data="vuejxData" v-model="vuejxData['ignoreRole']"
                @change="changeRole"
              ></vuejx-autocomplete>
            </div>
            <div v-else-if="item['type'] === 'logs'">
              <vuejx-table-simple-khcn class="table___logs"
                  :pagesize="15" :db="db" :collection="item['collection']" :sort="item['sort'] ? item['sort'] : [{createdAt:'desc'}]"
                  :title="item['label']" :noHeader="true"
                  :table_config="[
                    { value: '_source.createdAt', title: 'Ngày tạo', width: '120', class: 'text-center', date: true },
                    { value: '_source.lastusername', title: 'Người cập nhật dữ liệu', width: '300', class: 'text-left' },
                    { value: '_source.updatedFields', title: 'Dữ liệu thay đổi', class: 'text-left' },
                    { value: '_source.removedFields', title: 'Trường dữ liệu bị xoá', width: '200', class: 'text-left' }
                  ]"
              >
                <template v-slot:cell_2="{ celldata }" >
                  {{ celldata?._source?.updatedFields }}
                </template>
                <template v-slot:cell_3="{ celldata }" >
                  {{ celldata?._source?.removedFields }}
                </template>
              </vuejx-table-simple-khcn>
            </div>
            <div v-else-if="item['type'] === 'done' || (index + 1) >= formJSON.length">
                <vuejx-done @pingDone="pingDone"></vuejx-done>
            </div>
            <div v-else-if="item['type'] === 'teleport'" :class="'vuejx_comp___' + item['model']" :id="item['model']">
              <slot :name="item['model']" v-bind:dataFormX="dataForm" v-bind:item="item"></slot>
            </div>
            <div v-else-if="item['type'] === 'hidden'" :class="'vuejx_comp___' + item['model']">
            </div>
            <div v-else-if="item['type'] === 'label'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate" :class="item['class__label']">
                {{ item['label'] }}
                </div>
            </div>
            <div v-else-if="item['type'] === 'phantothongke'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate" :class="item['class__label']">
                {{ item['label'] }}
                </div>
                <vuejx-phanto :key="item.disable ? dataForm[item.model] : ''"
                  v-model:data="dataForm" v-model="dataForm[item.model]"
                  :dataRaw="dataForm[item.model]"
                  :item="item"
                  @changeData="changeData"
                >
                </vuejx-phanto>
            </div>
            <div v-else-if="item['type'] === 'html'" :class="'vuejx_comp___' + item['type']">
                <button @click="copyTestingCode('html___' + item.model, item.model)"
                  class="leading-none font-semibold border border-blue-700 text-blue-700 mb-2 rounded px-4 py-2 focus:outline-none"
                  tabindex="-1"
                >
                  Xác nhận thay đổi nội mẫu email
                </button>
                <div :id="'html___' + item.model" v-html="dataForm[item.model]"></div>
            </div>
            <div v-else-if="item['type'] === 'view'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate">
                {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                <span
                    class="required__class"
                    v-if="item['required']"
                >*</span>
                </div>
                <div
                class="block leading-normal truncate"
                >{{ objectView(dataForm, item.model) }}</div>
            </div>
          </div>
        <slot name="bottom" v-bind:dataFormX="dataForm"></slot>
        </template>
    </div>

    <slot name="action" v-bind:submitData="submitData" v-bind:dataFormX="dataForm">
      <div class="btn-group flex mt-8 action___buttons" v-if="renderScreen && !action_guest">
        <template v-for="(item, index) of demoaction">
          <button aria-label="btn" v-if="role.some(r=> (item.access && item.access.indexOf(r) >= 0 || !item.access)) && (!item.input || (item.input && item.input.value.indexOf(objectView(dataForm, item.input.key, 'null')) != -1 ))" v-bind:key="index"
              :class="[{'leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2': !item.class && item.url !== 'back', 'leading-none font-semibold border border-blue-700 text-blue-700 mx-2 rounded px-4 py-2': item.url == 'back'}, item.class]"
              class="focus:outline-none hover:bg-blue-700 hover:border hover:border-blue-700" tabindex="-1" @click="submitData(item)">
              {{ item.action }}
          </button>
        </template>
      </div>
      <div class="btn-group flex mt-8 action___buttons" v-else>
        <template v-for="(item, index) of demoaction">
          <button aria-label="btn" v-bind:key="index"
            v-if="item && item.access && item.access.indexOf('GUEST') != -1"
            :class="[{'leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2': !item.class && item.url !== 'back', 'leading-none font-semibold border border-blue-700 text-blue-700 mx-2 rounded px-4 py-2': item.url == 'back'}, item.class]"
            class="focus:outline-none hover:bg-blue-700" tabindex="-1" @click="submitData(item)">
            {{ item.action }}
          </button>
        </template>
      </div>
    </slot>
    
    <div v-if="ext_form_popup" class="fixed rounded shadow-lg bg-white border border-blue-700 z-50 overflow-hidden" style="padding: initial; top: 50%; left:50%; min-width: 500px;max-width: 90vw;z-index: 9999;border-radius: 20px; transform: translate(-50%, -50%);">
      <div class="flex justify-between items-center bg-gray-300" style="border-radius: 20px 20px 0px 0px;">
          <p class="text-lg font-bold text-white py-2 px-6 bg-blue-500 uppercase" style="border-radius: 20px 0;"> {{ detailActin.ext_field.title }}</p>
          <div class="cursor-pointer z-50 px-6" @click="ext_form_popup = false">
            <i class="mdi mdi-close"></i>
          </div>
      </div>
      <div class="overflow-y-auto" style="max-height: 70vh;">
        <v-layout class="px-4 py-2">
          <div :class="detailActin.ext_field.class" v-if="Array.isArray(detailActin.ext_field.value)">
            <div :class="item['class']" v-for="(item, index) in detailActin.ext_field.value" v-bind:key="index">
              <label v-if="item['type'] === 'text'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate">
                  {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                  <span
                      class="required__class"
                      v-if="item['required']"
                  >*</span>
                  </div>
                  <input
                  v-model="dataForm[item.model]"
                  class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                  :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
                  :type="item.type_text ? item.type_text : 'text'"
                  :placeholder="item['placeholder']"
                  :disabled="item.disable"
                  @change="changeData({
                    model: item.model,
                    modelFormIndex: modelFormIndex,
                    modelForm: modelForm
                  })"
                  />
                  <div v-if="item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
              </label>
              <label v-else-if="item['type'] === 'textarea'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate">
                {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                <span
                    class="required__class"
                    v-if="item['required']"
                >*</span>
                </div>
                <n-input
                  v-model:value="dataForm[item.model]"
                  class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                  :placeholder="item['placeholder'] ? item['placeholder'] : item['label']"
                  type="textarea"
                  size="small"
                  :autosize="item['autosize'] ? item['autosize'] : {
                    minRows: 1,
                    maxRows: 25
                  }"
                  :on-change="changeData({
                    model: item.model,
                    modelFormIndex: modelFormIndex,
                    modelForm: modelForm
                  })"
                />
                <div v-if="item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
              </label>
              <vuejx-autocomplete-wrap v-else-if="item['type'] === 'autocomplete'" 
                :item="item" :dataForm="dataForm" @changeData="changeData"
                :modelFormIndex="modelFormIndex"
                :modelForm="modelForm"
              ></vuejx-autocomplete-wrap>
              <vuejx-date-combobox v-else-if="item['type'] === 'date'" :key="dataForm[item.model]"
                :config="item" :data="dataForm" :dataForm="dataForm" @changeData="changeData"
                :time="item.time"
              ></vuejx-date-combobox>
              <div v-else-if="item['type'] === 'file'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate text-left" v-if="item['label'] && !item.hidden_label">
                  {{ item['label'] }}
                  <span
                      class="required__class"
                      v-if="item['required']"
                  >*</span>
                  </div>
                  <vuejx-upload :id="item['model']" :class="item['upload_class']"
                  :uploadUrl="item['uploadUrl']" :multiple="String(item['multiple']) == 'true'" 
                  :maxFiles="item['maxFiles']" 
                  :accept="item['accept'] ? item['accept'] : '.jpeg, .jpg, .png, .pdf, .doc, .docx'" 
                  :helpText="item['helpText'] ? item['helpText'] : 'Đính kèm'" 
                  v-model:data="dataForm" 
                  :config="{
                      model: item['model']
                  }
                  ">
                  </vuejx-upload>
                  <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
              </div>
              <div v-else-if="item['type'] === 'number'" :class="'vuejx_comp___' + item['model']">
                <div class="block font-semibold leading-tight pb-1 truncate">
                    {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                    <span
                    class="required__class"
                    v-if="item['required']"
                    >*</span>
                </div>
                <vuejx-number :key="item.disable ? dataForm[item.model] : ''"
                  v-model:data="dataForm" v-model="dataForm[item.model]"
                  :dataRaw="dataForm[item.model]"
                  :item="item"
                  :options="{...{
                    prefix: '',
                    suffix: '',
                    decimal: '',
                    thousand: '',
                    precision: 0,
                    acceptNegative: false,
                    isInteger: false
                  }, ...item.options}"
                  @changeData="changeData"
                  :modelFormIndex="modelFormIndex"
                  :modelForm="modelForm"
                  class="relative p-2 focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
                  :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
                >
                </vuejx-number>
                <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" v-show="afterSubmit" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
              </div>
              <vuejx-boolean v-else-if="item['type'] === 'boolean'" :item="item" :dataForm="dataForm"></vuejx-boolean>
              <vuejx-region v-else-if="item['type'] === 'region'"
                :item="item" :dataForm="dataForm" @changeData="changeData"
              ></vuejx-region>
              <div v-else-if="item['type'] === 'leaflet'" :class="'vuejx_comp___' + item['model']">
                <vuejx-leaflet-wrap v-model="dataForm[item.model]" :id="item['model']" :item="item" v-model:data="dataForm" 
                  @doneMapData="doneMapData"
                ></vuejx-leaflet-wrap>
              </div>
              <div v-else-if="item['type'] === 'table'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate">
                  {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                  <span
                      class="required__class"
                      v-if="item['required']"
                  >*</span>
                  </div>
                  <vuejx-table-simple-selected
                    :pagesize="10"
                    :noRouterr="true"
                    :storage="item.storage"
                    :modelName="item.model"
                    @inlineSearchAction="inlineSearchAction"
                    :inlineSearch="true"
                    :paging="searchablePick[item.model] ? true : false"
                    :collection="item.collection"
                    :table_config="item.table_config"
                    :filter_options="item.filter_options"
                    :includes="item.includes"
                    :keywords="item.keywordsCfg"
                    :queryFilter="item.re_calculator"
                    :condition="item.condition"
                  >
                  
                        <template v-slot:total_pick>
                            <span v-if="Array.isArray(dataForm[item.model])">{{dataForm[item.model].length}}</span>
                            <span v-else>{{dataForm[item.model] ? 1 : 0 }}</span>
                        </template>

                        <template v-if="crudablePick[item.model]" v-slot:button_ext>
                            <vuejx-screen v-if="crudablePick[item.model]" :ref="'formCRUDTable' + item.model" :grid_class="item.grid_class" 
                            :collection="item.collection"
                            :config="item.formConfig" 
                            :customRedirect="true"
                            :modelForm="item.model"
                            @afterSubmit="afterSubmitTable"
                          >
                            <template v-slot:action="submitData">
                              <div class="my-3 text-right">
                                <button aria-label="btn" class="leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2 focus:outline-none" tabindex="-1" @click="doAddTableData(item.model)">Thêm mới</button>
                                <button style="border-radius: 4px !important;" aria-label="btn" class="leading-none font-semibold border border-blue-700 text-blue-700 rounded px-4 py-2 back__btn focus:outline-none" tabindex="-1" @click="crudablePick[item.model] = !crudablePick[item.model]">Thoát</button>
                              </div>
                            </template>
                          </vuejx-screen>
                        </template>
                        <template v-if="item.formConfig && !crudablePick[item.model]" v-slot:ext_btn_2>
                          <button aria-label="btn" class="filter___add_cms whitespace-no-wrap ml-2 font-semibold rounded border border-blue-700 bg-blue-700 text-white px-3 pb-1 leading-none focus:outline-none hover:bg-white hover:text-blue-700" tabindex="-1" @click="crudablePick[item.model] = !crudablePick[item.model]">Thêm mới</button>
                        </template>
                        <template v-slot:thead>
                          <tr>
                          <th :width="40">STT</th>
                          <th v-for="(itemTH, indexTH) of item.table_config" v-bind:key="indexTH" :width="itemTH.width" :class="itemTH.class"> {{ itemTH.title }} </th>
                          <th :width="80"></th>
                          </tr>
                        </template>
                        <template v-slot:tbody="{ data }">
                          <template v-if="dataForm[item.model] && !searchablePick[item.model]">
                              <tr v-for="(celldata, index) in processArrayTableView(item)" v-bind:key="index">
                                <td align="center" >
                                  {{ index + 1 }}
                                </td>
                                <td :width="tblConfig.width" v-for="(tblConfig, indexTblConfig) in item.table_config" :key="indexTblConfig" :class="tblConfig.class" >
                                    
                                    <template v-if="tblConfig.viewType == 'autocomplete'">
                                      <vuejx-autocomplete :config="{
                                          placeholder: tblConfig.placeholder,
                                          modelView: 'object',
                                          model: '' + tblConfig.model, required: false,
                                          label: '', object: true, 
                                          itemText: tblConfig.itemText ? tblConfig.itemText : '_source.TenMuc', 
                                          itemValue: tblConfig.itemValue ? tblConfig.itemValue : '_source.MaMuc',
                                          link: [ { collection: tblConfig.collection } ],
                                          column: tblConfig.column ? tblConfig.column : ['MaMuc', 'TenMuc', 'type'], 
                                          sort: tblConfig.sort ? tblConfig.sort : [ '_score' ]
                                      }" :data="celldata._source" v-model:data="celldata._source"
                                        :flatten="false"
                                      ></vuejx-autocomplete>
                                    </template>
                                    <template v-else>
                                      <template v-if="tblConfig && tblConfig.arrayTableKey">
                                        <template v-for="(elementArr, elementArrInd) in (celldata._source[tblConfig.arrayTableKey] || [])">
                                          <div v-html="dateView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1]) || objectView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1])"></div>
                                          <br>
                                        </template>
                                      </template>
                                      <template v-else-if="tblConfig && tblConfig.value">
                                        <template v-if="tblConfig.value.indexOf(',') == -1">
                                          <div v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, tblConfig.value, tblConfig.dataView)] : objectView(celldata, tblConfig.value)"></div>
                                        </template>
                                        <template v-else>
                                          <div v-for="(valueReal, indexReal) in tblConfig.value.split(',')">
                                          <span class="prefix___label_td" 
                                          v-if="tblConfig.prefix && tblConfig.prefix[indexReal]" 
                                          v-html="tblConfig.prefix[indexReal].startsWith('_') && !(tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date' ? dateView(celldata, valueReal) : objectView(celldata, valueReal)) ? tblConfig.prefix[indexReal].substr(1) + ' <i>Chưa cập nhật</i>' : (tblConfig.prefix[indexReal].startsWith('_') ? tblConfig.prefix[indexReal].substr(1) : tblConfig.prefix[indexReal])"></span>
                                            <span v-if="tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date'" class="val___label_td" v-html="dateView(celldata, valueReal)"></span>
                                            <span v-else class="val___label_td" v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, valueReal, tblConfig.dataView)] : objectView(celldata, valueReal)"></span>
                                          </div>
                                        </template>
                                      </template>
                                      
                                    </template>
                                </td>
                                <td class="text-center" >
                                  <button class="table_button___clear" tabindex="0" type="button" @click="removeArray(index, item.model, null, item.multiple)">
                                    <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                  </button>
                                </td>
                            </tr>
                          </template>
                          <template v-else-if="searchablePick[item.model]">
                            <tr v-for="(celldata, index) in (data && data.length ? data : [] )" v-bind:key="index">
                              <td :width="widthSTT" align="center" >
                              {{ index + 1 }}
                              </td>
                              <td :width="tblConfig.width" v-for="(tblConfig, indexTblConfig) in item.table_config" :key="indexTblConfig" class="text-left" >
                                  <template v-if="tblConfig && tblConfig.arrayTableKey">
                                    <template v-for="(elementArr, elementArrInd) in (celldata._source[tblConfig.arrayTableKey] || [])">
                                      <div v-html="dateView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1]) || objectView(elementArr, tblConfig.value.split(tblConfig.arrayTableKey + '.')[1])"></div>
                                      <br/>
                                    </template>
                                  </template>
                                  <template v-else-if="tblConfig && tblConfig.value">
                                    <template v-if="tblConfig.value.indexOf(',') == -1">
                                      <div v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, tblConfig.value, tblConfig.dataView)] : objectView(celldata, tblConfig.value)"></div>
                                    </template>
                                    <template v-else>
                                      <div v-for="(valueReal, indexReal) in tblConfig.value.split(',')">
                                        <span class="prefix___label_td" 
                                          v-if="tblConfig.prefix && tblConfig.prefix[indexReal]" 
                                          v-html="tblConfig.prefix[indexReal].startsWith('_') && !(tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date' ? dateView(celldata, valueReal) : objectView(celldata, valueReal)) ? tblConfig.prefix[indexReal].substr(1) + ' <i>Chưa cập nhật</i>' : (tblConfig.prefix[indexReal].startsWith('_') ? tblConfig.prefix[indexReal].substr(1) : tblConfig.prefix[indexReal])"></span>
                                        <span v-if="tblConfig.viewTypeElement && tblConfig.viewTypeElement[indexReal] == 'date'" class="val___label_td" v-html="dateView(celldata, valueReal)"></span>
                                        <span v-else class="val___label_td" v-html="tblConfig.dataView ? tblConfig.dataView[objectView(celldata, valueReal, tblConfig.dataView)] : objectView(celldata, valueReal)"></span>
                                      </div>
                                    </template>
                                  </template>
                              </td>
                              <td :width="60" class="text-center" >
                                  <button v-if="Array.isArray(dataForm[item.model]) && dataForm[item.model].findIndex(item => item._id == celldata._id) >= 0"
                                    @click.stop="removeArray(index, item.model, celldata._id, item.multiple)" aria-label="btn"
                                    class="table_button___clear" tabindex="0" type="button">
                                    <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                  </button>
                                  <button v-else-if="!item.multiple && dataForm[item.model] && dataForm[item.model]['_id'] == celldata._id"
                                    @click.stop="removeArray(index, item.model, celldata._id, item.multiple)" aria-label="btn"
                                    class="table_button___clear" tabindex="0" type="button">
                                    <span class="n-button__icon font-semibold text-red-700 border-b border-red-700">Bỏ chọn</span>
                                  </button>
                                  <button v-else class="table_button___clear" tabindex="0" type="button" @click="processArrayTable(celldata, item.model, item.multiple, item)">
                                    <span class="n-button__icon font-semibold text-blue-700 border-b border-blue-700">Chọn</span>
                                  </button>
                              </td>
                          </tr>
                      </template>
                      <tr v-else>
                          <td :width="widthSTT"
                              :colspan="item.table_config.length + 2" align="left">
                              Chưa có dữ liệu
                          </td>
                      </tr>
                    </template>
                  </vuejx-table-simple-selected>
                  <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>
              </div>
              <div class="-mt-4" v-else-if="item['type'] === 'array' && Array.isArray(item.form)">
                <div class="block___label">
                  <div><div class="block font-semibold leading-tight pb-1 truncate">{{ item.label }}
                  <span class="text-white ml-2" style="position: absolute;font-size: 24px;margin-top: 5px;" v-if="item['required']" >*</span></div></div>
                </div>

                  <vuejx-screen class="-mt-3" :grid_class="item.grid_class" :config="item"
                    v-if="!crudableArrayAdd[item.model]"
                    :modelForm="item.model"
                  >
                      <template v-slot:action="{ modelx, dataFormX }" >
                        <div class="my-2 text-right">
                          <button @click="processArray(dataFormX, item.model, item)"
                            class="leading-none font-semibold bg-blue-700 text-white mx-2 rounded px-4 py-2 focus:outline-none" tabindex="-1">
                            Thêm mới
                          </button>
                        </div>
                      </template>
                  </vuejx-screen>
                  <div class="relative" v-for="(itemDataArray, indexAr) in dataForm[item.model]" v-bind:key="indexAr">
                    <div class="block___label block___label_index">
                      <div><div class="block font-semibold leading-tight pb-1 truncate">
                      <button @click.stop="processArrayDelete(indexAr, item.model)"
                        tabindex="0" type="button" class="remove__table_array_index"><span class="text-red-700 mr-1">Xoá dữ liệu</span></button>
                      {{ indexAr + 1 }}
                      </div></div>
                    </div>
                    <vuejx-screen class="z-10" :ref="'formInputArray_' + indexAr" :grid_class="item.grid_class" :config="item" 
                      :modelForm="item.model" :modelFormIndex="indexAr" @dataChangeArrayForm="changeDataFormArray" 
                      :data="itemDataArray">
                        <template v-slot:action="{ modelx, dataFormX }" >
                          <span></span>
                        </template>
                    </vuejx-screen>
                  </div>
                  <div v-if="afterSubmit && item['required'] && !dataForm[item.model]" class="text-red-600 mt-2 italic error___form"> {{ item.required_title ? item.required_title : 'Trường dữ liệu bắt buộc' }}</div>  
              </div>
              <div v-else-if="item['type'] === 'role'">
                <div class="col-span-4 text-green-700 uppercase font-bold mt-4">
                  <div class="vuejx_comp___undefined">
                    <div class="block font-semibold leading-tight pb-1 truncate">{{ item.label }}</div>
                  </div>
                </div>
                <vuejx-autocomplete :config="{
                  modelView: 'object', itemText: '_source.TenMuc', itemValue: '_source.MaMuc',
                  model: 'viewRole', multiple: true,
                  label: 'Quyền đọc dữ liệu', object: true,
                  link: [{ collection: 'C_ROLE' }],
                  column: ['MaMuc', 'TenMuc', 'type'],
                }" :data="vuejxData" v-model="vuejxData['viewRole']"
                  @change="changeRole"
                ></vuejx-autocomplete>
                <vuejx-autocomplete :config="{
                  modelView: 'object', itemText: '_source.TenMuc', itemValue: '_source.MaMuc',
                  model: 'ignoreRole', multiple: true,
                  label: 'Quyền không nhìn dữ liệu', object: true,
                  link: [{ collection: 'C_ROLE' }],
                  column: ['MaMuc', 'TenMuc', 'type'],
                }" :data="vuejxData" v-model="vuejxData['ignoreRole']"
                  @change="changeRole"
                ></vuejx-autocomplete>
              </div>
              <div v-else-if="item['type'] === 'logs'">
                <vuejx-table-simple-khcn class="table___logs"
                    :pagesize="15" :db="db" :collection="item['collection']" :sort="item['sort'] ? item['sort'] : [{createdAt:'desc'}]"
                    :title="item['label']" :noHeader="true"
                    :table_config="[
                      { value: '_source.createdAt', title: 'Ngày tạo', width: '120', class: 'text-center', date: true },
                      { value: '_source.lastusername', title: 'Người cập nhật dữ liệu', width: '300', class: 'text-left' },
                      { value: '_source.updatedFields', title: 'Dữ liệu thay đổi', class: 'text-left' },
                      { value: '_source.removedFields', title: 'Trường dữ liệu bị xoá', width: '200', class: 'text-left' }
                    ]"
                >
                  <template v-slot:cell_2="{ celldata }" >
                    {{ celldata?._source?.updatedFields }}
                  </template>
                  <template v-slot:cell_3="{ celldata }" >
                    {{ celldata?._source?.removedFields }}
                  </template>
                </vuejx-table-simple-khcn>
              </div>
              <div v-else-if="item['type'] === 'done' || (index + 1) >= formJSON.length">
                  <vuejx-done @pingDone="pingDone"></vuejx-done>
              </div>
              <div v-else-if="item['type'] === 'teleport'" :class="'vuejx_comp___' + item['model']" :id="item['model']">
                <slot :name="item['model']" v-bind:dataFormX="dataForm" v-bind:item="item"></slot>
              </div>
              <div v-else-if="item['type'] === 'hidden'" :class="'vuejx_comp___' + item['model']">
              </div>
              <div v-else-if="item['type'] === 'label'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate" :class="item['class__label']">
                  {{ item['label'] }}
                  </div>
              </div>
              <div v-else-if="item['type'] === 'phantothongke'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate" :class="item['class__label']">
                  {{ item['label'] }}
                  </div>
                  <vuejx-phanto :key="item.disable ? dataForm[item.model] : ''"
                    v-model:data="dataForm" v-model="dataForm[item.model]"
                    :dataRaw="dataForm[item.model]"
                    :item="item"
                    @changeData="changeData"
                  >
                  </vuejx-phanto>
              </div>
              <div v-else-if="item['type'] === 'html'" :class="'vuejx_comp___' + item['type']">
                  <button @click="copyTestingCode('html___' + item.model, item.model)"
                    class="leading-none font-semibold border border-blue-700 text-blue-700 mb-2 rounded px-4 py-2 focus:outline-none"
                    tabindex="-1"
                  >
                    Xác nhận thay đổi nội mẫu email
                  </button>
                  <div :id="'html___' + item.model" v-html="dataForm[item.model]"></div>
              </div>
              <div v-else-if="item['type'] === 'view'" :class="'vuejx_comp___' + item['model']">
                  <div class="block font-semibold leading-tight pb-1 truncate">
                  {{ item.hasOwnProperty('label') ? item['label'] : item['model'] }}
                  <span
                      class="required__class"
                      v-if="item['required']"
                  >*</span>
                  </div>
                  <div
                  class="block leading-normal truncate"
                  >{{ objectView(dataForm, item.model) }}</div>
              </div>
            </div>
          </div>
          <v-flex xs12 class="px-2 my-2">
            <button aria-label="btn" @click="submitData(detailActin, true)" class="font-semibold bg-blue-7000 px-4 py-2 leading-none rounded focus:outline-none whitespace-no-wrap" tabindex="-1">
            Xác nhận
            </button>
          </v-flex>
        </v-layout>
      </div>
    </div>
  </div>
</template>