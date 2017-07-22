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
        var gallery = new Hammer(container, hammerOpts);
        var _this = this

        gallery.on('tap', function(e) {
            console.log(e)
            var element = e.target
            if (element.nodeName === 'IMG' && e.tapCount === 2) {
                if (element.getAttribute('style')) {
                    element.removeAttribute('style');
                    return
                }
                _this.zoom(e.target, e.center.x)
            }
        });
    },
    zoom: function(element, mouseX) {
        var sw = window.screen.width,
            sh = window.screen.height,
            ew = element.clientWidth,
            eh = element.clientHeight,
            scale = sh / eh,
            fw = sw * scale - sw, //finally width
            ot = window.screen.width / 3, //one third of the screen width
            direction,
            tx

        //click on the left of the picture
        if (0 < mouseX && mouseX < ot) {
            tx = fw / 2;
        }
        // picture width is less than screen width 
        // or click on the center of the picture
        else if (sw > ew || ot < mouseX && mouseX < sw / 2) {
            // element.parentNode.style.width = fw
            element.style.webkitTransform = `scale(${scale})`
            return;
        }
        //click on the left of the picture
        else {
            tx = -(fw / 2);
        }
        element.style.webkitTransform = `translate3d(${tx}px, 0px, 0px) scale(${scale})`;
    }
}
Gallery.fn.init.prototype = Gallery.fn