<script setup>
  const emit = defineEmits(['closeAccordion'])
  defineProps({
    items: { type: Object, default: null }
  })
  const closeAccordion = () => {
    emit('closeAccordion')
  }
</script>

<template>
    
  <div class="accordion relative" v-if="items">
    <div @click="closeAccordion" class="absolute top-0 right-0 mt-4 mr-6 border-b cursor-pointer border-dashed border-green-700">Quay lại</div>
    <div class="accordion-item bg-white border-b border-gray-400"
      v-for="(value, key, index) in items" v-bind:key="index"
    >
      <h3 class="accordion-header mb-0">
        <span class="accordion_header">
          {{ key }}
        </span>
      </h3>
      <div class="accordion-collapse" v-if="Array.isArray(value)">
        <div class="accordion-body py-4 px-5 pt-2">
          <div v-for="(fieldErr, indexErr) in value" v-bind:key="indexErr">
              - {{fieldErr}}
          </div>
        </div>
      </div>
    </div>
  </div>

</template>