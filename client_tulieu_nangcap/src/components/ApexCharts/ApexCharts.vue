<template>
  <slot></slot>
</template>
<script>
export default {
 name: "ApexCharts",
 mounted: function() {
   let vm = this;
   console.log('xxxx===== ApexChartsApexCharts');
   if (!document.getElementById('ApexCharts_lib_script')) {
     let ApexCharts = document.createElement("script");
     ApexCharts.setAttribute(
       "id",
       "ApexCharts_lib_script"
     );
     ApexCharts.setAttribute(
       "src",
       "/apexcharts.min.js"
     );
     ApexCharts.setAttribute(
       "type",
       "application/javascript"
     );
     document.head.appendChild(ApexCharts);
   }
   vm.$nextTick( async function() {
    do {
      await window.sleep(50);
    } while (typeof window.ApexCharts != 'function');
    vm.$emit('done');
   });
 }
};
</script>