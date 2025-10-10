<script>
  export default {
    props: {
      config: {
        type: Object,
        default: () => {
          return {};
        },
      },
      data: {
        type: Object,
        default: () => {
          return {};
        },
      },
      site: {
        type: String,
        default: localStorage.getItem('site'),
      },
      text_style: {
        type: Boolean,
        default: false,
      },
      call_onload: {
        type: Boolean,
        default: false,
      },
      helpText: {
        type: String,
        default: "Tải file đính kèm",
      },
      uploadUrl: {
        type: String,
        default: "",
      },
      multiple: {
        type: Boolean,
        default: false
      },
      editable: {
        type: Boolean,
        default: true
      },
      maxFiles: {
        type: Number,
        default: 20
      },
      maxFileSize: {
        type: Number,
        default: 100 *  1024 * 1024
      },
      metadata: {
        type: Object,
        default: {}
      },
      accept: {
        type: String,
        default: "*"
      },
      id: {
        type: String,
        default: 'file___' + new Date().getTime() + ''
      },
      auto_upload: {
        type: Boolean,
        default: true
      }
    },
    methods: {
      async clean() {
        this.formData = {};
      },
      async init() {
      },
      async change_data(val) {
          this.$emit("input", val);
      },
      async doUploadFile(event) {
          let vm = this;
          if (!vm.multiple) {
              vm.files = []
          }
          if (Array.isArray(vm.files) && vm.files.length === 0) {
              vm.files = Array.from(event.target.files)
          } else {
              const newFiles = Array.from(event.target.files)
              for (const el of newFiles) {
                  vm.files.push(el)
              }
          }
      },
      async removeFile(index) {
          this.files.splice(index, 1)
      },
      async removeFileData(index, itemRemove) {
          let vm = this;
          vm.data[vm.config['model']].splice(index, 1);
          vm.$emit("update:dataForm", vm.data);
          vm.confirmDeleteFile = true;
          vm.idFileToRemoves.push({
              id: itemRemove['id'],
              bucketName: itemRemove['bucketName'],
              filename: itemRemove['filename']
          })
      },
      async autoUpload() {
          if (this.auto_upload) {
              this.doUploadFileAPIAuto()
          }
      },
      async doUploadFileAPIAuto() {
          let vm = this;
          let data = new FormData();
          vm.renderUploadFile  = true;
          let fileUPload = document.getElementById(vm.id);
          for (const el of fileUPload.files) {
              data.append('files', el, el['name']);
          }
          
          let uploadHeaders = {
              headers: {
              
              }
          }
          uploadHeaders['headers']['Content-Type'] = 'multipart/form-data';
          uploadHeaders['headers']['token'] = localStorage.getItem('token');
          uploadHeaders['headers']["metadata"] = encodeURIComponent(
              JSON.stringify(vm.metadata)
          );
          await window.Vue.$axios.post(vm.uploadUrl.replace("security", "admin/security/file"), data, uploadHeaders).then(function(response) {
              if (response) {
                  if (vm.multiple) {
                    if (Array.isArray(vm.data[vm.config['model']]) && vm.data[vm.config['model']].length > 0) {
                      console.log(vm.data[vm.config['model']][0], vm.data[vm.config['model']][0].TenTep);
                      if (vm.data[vm.config['model']][0] && vm.data[vm.config['model']][0].TenTep) {
                        for (let elFile of response.data) {
                          vm.data[vm.config['model']].push({
                              ...{
                                  TenTep: elFile?.originalname,
                                  DinhDang: elFile?.contentType ? elFile?.contentType : elFile.filename.substring(elFile.filename.lastIndexOf("\.") + 1),
                                  fileName: elFile?.fileName,
                                  sourceRefId: vm.data?.sourceRefId,
                                  idTepDuLieu: elFile?.id,
                                  uploadData: elFile
                              }, ...elFile
                          })
                        }
                      } else {
                        vm.data[vm.config['model']] = [...vm.data[vm.config['model']], ...response.data];
                      }
                    } else {
                      vm.data[vm.config['model']] = response.data;
                    }
                  } else {
                    vm.data[vm.config['model']] = response.data;
                  }
                  vm.$emit("update:dataForm", vm.data);
                  vm.$emit("done_upload", response.data);
                  window.Vue.toastr.success('Thành công.');
              } else {
                  window.Vue.toastr.error('Error.');
              }
              
          }).catch((err) => {
              window.Vue.toastr.error(err)
          })
          vm.renderUploadFile  = false;
      },
      async doUploadFileAPI() {
          let vm = this;
          let r = confirm("Xác nhận tải file.");
          if (r == true) {
              let data = new FormData();
              let fileUPload = document.getElementById(vm.id);
              for (const el of fileUPload.files) {
                  data.append('files', el, el['name']);
              }
              let uploadHeaders = {
                  headers: {
                  }
              }
              uploadHeaders['headers']['Content-Type'] = 'multipart/form-data';
              uploadHeaders['headers']['token'] = localStorage.getItem('token');
              uploadHeaders['headers']["metadata"] = encodeURIComponent(
                  JSON.stringify(vm.metadata)
              );
              await window.Vue.$axios.post(API.security + vm.uploadUrl.replace("security", "admin/security/file"), data, uploadHeaders).then(function(response) {
                  if (response) {
                      if (vm.multiple) {
                        if (vm.data[vm.config['model']][0] && vm.data[vm.config['model']][0].TenTep) {
                          for (let elFile of response.data) {
                            vm.data[vm.config['model']].push({
                                ...{
                                    TenTep: elFile?.originalname,
                                    DinhDang: elFile?.contentType ? elFile?.contentType : elFile.filename.substring(elFile.filename.lastIndexOf("\.") + 1),
                                    fileName: elFile?.fileName,
                                    sourceRefId: vm.data?.sourceRefId,
                                    idTepDuLieu: elFile?.id,
                                    uploadData: elFile
                                }, ...elFile
                            })
                          }
                        } else {
                          vm.data[vm.config['model']] = [...vm.data[vm.config['model']], ...response.data];
                        }
                      } else {
                        vm.data[vm.config['model']] = response.data;
                      }
                      vm.$emit("update:dataForm", vm.data);
                      vm.$emit("done_upload", response.data);
                      window.Vue.toastr.success('Thành công.');
                  } else {
                      window.Vue.toastr.error('Error.');
                  }
                  
              }).catch((err) => {
                  window.Vue.toastr.error(error)
              })
          }
      },
      async doRemoveFile() {
          let vm = this;
          let r = confirm("Xác nhận xoá file.");
          if (r == true) {
              for (let el of vm.idFileToRemoves) {
                  await window.Vue.$axios.post('/admin/security/file/upload_remove/' + el['bucketName'] + '/' + el['filename'], {}, {
                      headers: {
                        
                      }
                  }).then(function(response) {
                      let indexRemoveFile = 0;
                      for (let elFile of vm.data[vm.config['model']]) {
                          if (elFile['id'] === el['id']) {
                              vm.data[vm.config['model']].splice(indexRemoveFile, 1);
                          }
                          indexRemoveFile = indexRemoveFile + 1;
                          break;
                      }
                      vm.$emit("update:dataForm", vm.data);
                      vm.$emit("done_upload", response.data);
                  }).catch((err) => {
                  })
              }
              vm.confirmDeleteFile = false
          }
      },
      previewFile(bucketName, filename) {
          window.open("/admin/security/file/" + bucketName + "/" + filename);
      }
    },
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            setTimeout(async () => {
              await vm.clean();
              await vm.init();
            }, 0);
        });
    },
    data: ()  => ({
      formData: {},
      files: [],
      loadingAction: false,
      confirmDeleteFile: false,
      idFileToRemoves: [],
      renderUploadFile: true
    })
  }
</script>
<template>
  <div>
    <label class="cursor-pointer flex" @change="doUploadFile">
      <div class="flex block font-semibold leading-tight truncate upload___comp pb-1">
        <span v-html="helpText.replace('*', '<span>*</span>')"></span> &nbsp;
        <svg v-if="editable"
          class="w-4 h-4"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path
            d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"
          />
        </svg>
        <input :id="id" type="file" class="hidden" :multiple="multiple" :accept="accept" @change="autoUpload"/>
      </div>
      <button aria-label="btn"
        v-if="files.length > 0 && !auto_upload && editable"
        class="flex items-center px-4 py-0 text-xs font-semibold leading-none focus:outline-none bg-white text-blue-700 hover:bg-button border-blue-700"
        tabindex="-1"
        :class="{'opacity-50 cursor-not-allowed pointer-events-none bg-gray-300': loadingAction}"
        @click="doUploadFileAPI"
      >
        Tải lên
        <i
          class="mdi cursor-pointer text-blue-700 ml-1"
          :class="{'mdi-loading mdi-spin': loadingAction, 'mdi-check-all': !loadingAction}"
          style="font-size: 14px;"
        ></i>
      </button>
      <button aria-label="btn"
        v-if="confirmDeleteFile && editable"
        class="flex items-center px-4 py-0 text-xs font-semibold leading-none focus:outline-none bg-white text-blue-700 hover:bg-button border-blue-700"
        tabindex="-1"
        :class="{'opacity-50 cursor-not-allowed pointer-events-none bg-gray-300': loadingAction}"
        @click="doRemoveFile"
      >
        Xoá file
        <i
          class="mdi cursor-pointer text-blue-700 ml-1"
          :class="{'mdi-loading mdi-spin': loadingAction, 'mdi-check-all': !loadingAction}"
          style="font-size: 14px;"
        ></i>
      </button>
    </label>
    <div
      class="flex flex-wrap items-stretch w-full mb-0 relative"
      style="min-height: 32px;"
      v-if="files.length > 0 && renderUploadFile"
    >
      <div
        class="p-0 focus:outline-none focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
      >
        <span
          class="file___wrap text-xs bg-white py-1 px-2 text-primary align-middle inline-block m-1 relative"
          style="margin: 3px 4px;padding: 2px 26px 2px 2px;overflow: hidden;border-radius: 4px;"
          v-for="(item, index) in files"
          v-bind:key="index"
        >
          <i
            class="mdi text-xs text-blue-700 absolute"
          ></i>
          <span class="mx-1">{{ item['name'] }}</span>
          <i v-if="editable" class="mdi mdi-close text-xs cursor-pointer text-red-700 absolute" @click="removeFile(index)"></i>
        </span>
      </div>
    </div>
    <div
      class="flex flex-wrap items-stretch w-full mb-0 relative"
      style="min-height: 32px;"
      v-if="Array.isArray(data[config.model]) && data[config.model].length > 0"
    >
      <div
        class="p-0 focus:outline-none focus:cursor-text w-full border border-gray-200 bg-gray-200 text-gray-700 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
      >
        <span
          class="file___wrap text-xs bg-white py-1 px-2 text-primary align-middle inline-block m-1 relative"
          style="margin: 3px 4px;padding: 2px 26px 2px 2px;overflow: hidden;border-radius: 4px;"
          v-for="(item, index) in data[config.model]"
          v-bind:key="index"
        >
          <a :href="'/admin/security/file/' + item['bucketName'] + '/' + item['filename']" target="_blank" class="append___icons">
            <i
              class="mdi text-xs text-blue-700 absolute"
            ></i>
          </a>
          <span class="mx-1 cursor-pointer" @click="previewFile(item['bucketName'], item['filename'])">{{ item['originalname'] }}</span>
          <i v-if="editable" class="mdi mdi-close text-xs cursor-pointer text-red-700 absolute" @click="removeFileData(index, item)"></i>
        </span>
      </div>
    </div>
  </div>
</template>
