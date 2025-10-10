<script>
  export default {
    props: {
      modelForm: { type: String, default: "" },
      modelFormIndex: { type: Number, default: -1 },
      item: { type: Object, default: {} },
      data: {
        type: Object,
        default: null
      },
      dataRaw: {
        type: Object,
        default: null
      },
      options: {
        type: Object,
        default(rawProps) {
          return {
            freeNumber: true
          }
        }
      },
      _class: [String, Object],
      _style: [String]
    },
    data: function() {
        return {
            displayValuez: '',
            _preValue: '',
            _options: {}
        }
    },
    watch: { 
      dataRaw: function(newVal, oldVal) { // watch it
        if (newVal && newVal != oldVal) {
          this.init()
        }
      }
    },
		mounted: function () {
      let vm = this
      this.$nextTick(function () {
        vm.init()
      })
    },
    methods: {
      init() {
        this._options = {
          	prefix: '',
            suffix: '',
            decimal: '',
            thousand: '',
            precision: 0,
            acceptNegative: true,
            isInteger: false,
            ...this.options,
          }
          let _value = ''
          if (this.data[this.item.model]) {
            _value = this._options.freeNumber ? (this.data[this.item.model] || 0).toString() : parseFloat((this.data[this.item.model] || 0).toString().replace(/[^\d\.]/g, "")).toFixed(this._options.precision);
          }
          
          //let _value = (this.data[this.item.model] || 0).toString();
          if (isNaN(this.data[this.item.model])) {
            //_value = parseFloat(0).toFixed(this._options.precision)
          }
          if (this._options.thousand && parseFloat(_value) != 0) {
            this.displayValuez = _value.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1" + this._options.thousand)
            this._preValue = String(this.displayValuez)
            this.displayValuez = this.displayValuez.replace(/[,.]/g, m => (m === ',' ? '.' : ',')).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
          } else if (!this._options.thousand && parseFloat(_value) != 0) {
            this.displayValuez = _value
            this._preValue = String(this.displayValuez)
          }
          this.$emit('initData', {
            key: this.item.model,
            data: _value
          });
      }, 
			changeinput($event) {
        this.displayValuez = String(this.displayValuez || '').replace(/[,.]/g, m => (m === ',' ? '.' : ',')).replace(/,/g, '')
				let numVal = parseFloat((this.displayValuez || 0).toString().replace(/[^\d\.]/g, ""));
        let newVal = null;
        if (this._options.thousand) {
          newVal = (this._options.freeNumber ? numVal.toString() : numVal.toFixed(this._options.precision) ).replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, "$1" + this._options.thousand);
        } else {
          newVal = this._options.freeNumber ? numVal.toString() : numVal.toFixed(this._options.precision);
        }
        newVal = $event.target.value.endsWith(".") ? $event.target.value : newVal;
				if (!isNaN($event.data) && parseFloat('0.00') == 0 ) {
          //numVal = 0
          //newVal = $event.data
        };
        //const focusCur = ($event.target.value.length == 1) || (numVal.toString().length == 1) ? 1 : $event.target.selectionStart + (newVal.length > $event.target.value.length ? 1 : 0);
        let focusCur = 1;//($event.target.value.length == 1) || (numVal.toString().length == 1) ? 1 : ($event.data == '.' ? numVal.toString().length + 1 : numVal.toString().length);
        if ($event.data == '.') {
          focusCur = numVal.toString().length + 1
        } else {
          focusCur = numVal.toString().length
        }
        this.displayValuez = ($event.target.value.length == 1) || ($event.target.value.length > this._preValue.length) ? newVal : $event.target.value;
        this._preValue = String(this.displayValuez);
        if (this._options.thousand) {
          this.displayValuez = this.displayValuez.replace(/[,.]/g, m => (m === ',' ? '.' : ',')).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        } else {
          this.displayValuez = numVal.toString()
        }
        this.$emit('input', parseFloat(numVal.toFixed(this._options.precision).toString().replace(/[^\d\.]/g, "")));
        this.$emit('changeData', {
          key: this.item.model,
          model: this.item.model,
          data: parseFloat(numVal.toFixed(this._options.precision).toString().replace(/[^\d\.]/g, "")),
          type: 'number',
          modelFormIndex: this.modelFormIndex,
          modelForm: this.modelForm
        });
        setTimeout(function() {
          $event.target.focus();
          $event.target.setSelectionRange(focusCur, focusCur);
        }, 0)

			}
    }
  }
</script>
<template>
      <input
      v-model="displayValuez"
      class="focus:cursor-text w-full border border-gray-200 focus:outline-none focus:bg-white focus:border-gray-400 rounded"
      :class="{'bg-gray-500 text-white pointer-events-none': item.disable, 'bg-gray-200 text-gray-700': !item.disable}"
      type="text"
      :placeholder="item['placeholder']"
      :disabled="item.disable"
      @input="changeinput"
      />
</template>
