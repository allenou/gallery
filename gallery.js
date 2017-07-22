function Gallery(elment, customOpts) {
    // this.customOpts = customOpts
    return new Gallery.fn.init(elment, customOpts)
}
Gallery.fn = {

    init: function(elment, opts) {
        var container = document.getElementById(elment),
            wrapper = container.firstElementChild,
            slides = document.getElementsByClassName('gallery-slide'),
            sw = window.screen.width
        wrapper.style.width = slides.length * sw + 'px'


        //HANDLE : pagination

        var pagination = document.querySelector(opts['pagination'])
        for (var i = 0; i < slides.length; i++) {
            bullet = document.createElement('span')
            bullet.className = 'gallery-pagination-bullet'
            pagination.appendChild(bullet)
        }
    }
}