<template>
  <div class="editor___view_scope document-editor overflow-hidden	">
    <div class="document-editor__editable-container">
        <div class="document-editor__editable">
        </div>
    </div>
    <div class="editor___view_scope document-editor__toolbar"></div>
</div>
</template>
<script>
import '../../../public/ckeditor';

export default {
 name: "Editor",
 props: {
  id: {
    type: String,
    default: 'editor-container-edit'
  }
 },
 mounted: function() {
   let vm = this;
   vm.$nextTick(function() {
     setTimeout(async () => {
      CKSource.Editor.create( document.querySelector( '.document-editor__editable' ), {
        toolbar: {
            items: [
                'undo', 'redo',
                '|',
                'exportPdf', 'exportWord', 'importWord',
                '|',
                'wproofreader', 'findAndReplace', 'selectAll',
                '|',
                'heading',
                '|',
                'removeFormat', 'bold', 'italic', 'strikethrough', 'underline', 'code', 'subscript', 'superscript',
                '|',
                'specialCharacters', 'horizontalLine', 'pageBreak',
                '|',
                '-',
                'highlight', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
                '|',
                'link', 'blockQuote', 'insertTable', 'uploadImage', 'ckbox', 'mediaEmbed', 'codeBlock', 'htmlEmbed',
                '|',
                'bulletedList', 'numberedList', 'todoList',
                '|',
                'outdent', 'indent', 'alignment',
                '|',
                'textPartLanguage',
                '|',
                'sourceEditing'
            ],
            shouldNotGroupWhenFull: true
        },
        simpleUpload: {
            // The URL that the images are uploaded to.
            uploadUrl: 'http://example.com',

            // Enable the XMLHttpRequest.withCredentials property.
            withCredentials: true,

            // Headers sent along with the XMLHttpRequest to the upload server.
            headers: {
                'X-CSRF-TOKEN': 'CSRF-Token',
                Authorization: 'Bearer <JSON Web Token>'
            }
        }
      } )
    .then( editor => {
        const toolbarContainer = document.querySelector( '.document-editor__toolbar' );
        toolbarContainer.appendChild( editor.ui.view.toolbar.element );
        window.editor = editor;
        vm.$emit('done');
      } )
      .catch( error => {
        console.error( 'There was a problem initializing the editor.', error );
      } );
     }, 0);
   });
 }
};
</script>