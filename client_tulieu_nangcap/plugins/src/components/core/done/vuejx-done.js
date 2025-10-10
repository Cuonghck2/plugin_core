export default {
    mounted: function() {
        let vm = this;
        vm.$nextTick(function() {
            vm.$emit('pingDone', 'OK');
        });
        
    },
    template: `<span></span>`
}