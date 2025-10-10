<template>
  <slot></slot>
</template>
<script>
import * as svgPng from 'save-svg-as-png';
export default {
 name: "mermaid",
 mounted: function() {
   let vm = this;
    window.svgPng = svgPng;
   if (!document.getElementById('mermaid_lib_script')) {
     let mermaid = document.createElement("script");
     mermaid.setAttribute(
       "id",
       "mermaid_lib_script"
     );
     mermaid.setAttribute(
       "src",
       "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
     );
     mermaid.setAttribute(
       "type",
       "application/javascript"
     );
     document.head.appendChild(mermaid);
   }
   vm.$nextTick(function() {
     setTimeout(async () => {
       vm.$emit('done');
     }, 0);
   });
 }
};
</script>