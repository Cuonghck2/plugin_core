<template>
   <slot></slot>
</template>
<script>
import L from "leaflet";
import * as GeoSearch from 'leaflet-geosearch';
export default {
  name: "Map",
  mounted: function() {
    let vm = this;
    window.L = L;
    window.GeoSearch = GeoSearch;
    if (!document.getElementById('codemirror_lib_css')) {
      let codemirror = document.createElement("link");
      codemirror.setAttribute(
        "id",
        "codemirror_lib_css"
      );
      codemirror.setAttribute(
        "href",
        "/map.css"
      );
      codemirror.setAttribute("rel", "stylesheet");
      document.head.appendChild(codemirror);
    }
    vm.$nextTick(function() {
      setTimeout(async () => {
        vm.$emit('done');
      }, 0);
    });
  }
};
</script>