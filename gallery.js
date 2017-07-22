function Gallery(element, customOpts) {

    return new Gallery.fn.init(element, customOpts)
}


Gallery.fn = {

    init: function(element, opts) {
        var container = document.getElementById(element),
            wrapper = container.firstElementChild,
            slides = document.getElementsByClassName('gallery-slide'),
            sw = window.screen.width
        wrapper.style.width = slides.length * sw + 'px'

        this.customOpts = opts
        this.slides = slides

        this.pagination()
        this.events()

    },
    pagination: function() {
        //HANDLE : pagination
        var opts = this.customOpts
        var pagination = document.querySelector(opts['pagination'])
        var slides = this.slides
        for (var i = 0; i < slides.length; i++) {
            bullet = document.createElement('span')
            bullet.className = 'gallery-pagination-bullet'
            pagination.appendChild(bullet)
        }
    },
    events: function() {
        //HANDLE : events
        if (!this.customOpts['zoom']) return

        var hammerOpts = {

        }
        var container = document.getElementById('gallery-container')
        var hammertime = new Hammer(container, hammerOpts);
        var _this = this

        hammertime.on('tap', function(e) {
            console.log(e)
            var element = e.target
            if (element.nodeName === 'IMG' && e.tapCount === 2) {
                if (element.getAttribute('style')) {
                    element.removeAttribute('style');
                    return
                }
                _this.zoom(e.target)
            }
        });
    },
    zoom: function(element) {
        var sh = window.screen.height,
            eh = element.clientHeight,
            scale = sh / eh

        element.style.webkitTransform = `scale(${scale})`
    }
}
Gallery.fn.init.prototype = Gallery.fn