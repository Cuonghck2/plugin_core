<template>
  <slot></slot>
</template>
<script>
export default {
 name: "ApexCharts",
 mounted: function() {
   let vm = this;
   if (!document.getElementById('ApexCharts_lib_script')) {
     let ApexCharts = document.createElement("script");
     ApexCharts.setAttribute(
       "id",
       "ApexCharts_lib_script"
     );
     ApexCharts.setAttribute(
       "src",
       "https://cdnjs.cloudflare.com/ajax/libs/apexcharts/3.36.0/apexcharts.min.js"
     );
     ApexCharts.setAttribute(
       "type",
       "application/javascript"
     );
     document.head.appendChild(ApexCharts);
   }
   vm.$nextTick(function() {
     setTimeout(async () => {
       vm.$emit('done');
     }, 0);
   });
 }
};
</script>