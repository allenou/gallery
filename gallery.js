var Gallery = {
    initGalleryWidth: function () {
        var galleryWrapper = document.getElementById('gallery-wrapper')
        var gallerySlides = document.getElementsByClassName('gallery-slide')
        var screenWidth = window.screen.width
        galleryWrapper.style.width = gallerySlides.length * screenWidth + 'px';
    }
}
Gallery.initGalleryWidth()