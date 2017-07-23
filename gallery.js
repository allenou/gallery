/*!
 * Gallery
 * (c) Allen Ou
 */

function Gallery(element, customOpts) {
    return new Gallery.fn.init(element, customOpts)
}

Gallery.fn = {

    init: function(element, opts) {

        var container = document.getElementById(element),
            wrapper = this.wrapper = container.firstElementChild,
            slides = document.getElementsByClassName('gallery-slide'),
            pagination = this.pagination = document.querySelector(opts['pagination']),
            sw = this.sw = window.screen.width,
            slidesLength = this.slidesLength = slides.length

        wrapper.style.width = slidesLength * sw + 'px'

        this.currentIndex = 0
        this.customOpts = opts
        this.slides = slides

        this.spot()
        this.events()
        this.slide()
        this.zoom()
    },
    spot: function() {
        //HANDLE : pagination
        if (!this.customOpts['pagination']) return

        var slides = this.slides,
            pagination = this.pagination,
            i = 0,
            length = slides.length

        for (; i < length; i++) {
            bullet = document.createElement('span')
            bullet.className = 'gallery-pagination-bullet'
            bullet.setAttribute('data-index', i)
            pagination.appendChild(bullet)
            pagination.childNodes[0].className += ' gallery-pagination-clickable'
        }

    },
    events: function() {
        //HANDLE : events
        var _this = this,
            wrapper = this.wrapper,
            sw = this.sw

        var gallery = new Hammer(wrapper)

        //HANDLE:picture pan
        gallery.on('panmove', function(e) {
            var distance

            distance = -(sw * _this.currentIndex) + e.deltaX
            wrapper.style.marginLeft = `${distance}px`
        })

        gallery.on('panend', function(e) {

            var element = e.target,
                mouseX = Math.abs(e.deltaX)

            if (mouseX < sw / 3) { //reductive translation
                wrapper.style.marginLeft = `${-sw * _this.currentIndex}px`
                return
            }
            _this.slide(e.deltaX)
        })
    },

    slide: function(deltaX) {
        var _this = this,
            sw = this.sw,
            wrapper = this.wrapper,
            pagination = this.pagination,
            currentIndex = this.currentIndex,
            slidesLength = this.slidesLength

        //HANDLE:pagination tap
        if (this.customOpts['paginationClickable']) {
            var paginationtime = new Hammer(_this.pagination)

            paginationtime.on('tap', function(e) {
                var element = e.target,
                    index = element.getAttribute('data-index')

                if (index) {
                    _this.currentIndex = index
                    _this.slide()
                }
            })
        }

        if (deltaX < 0) {
            nextSlide()
        } else if (deltaX > 0) {
            prevSlide()
        } else {
            slideTo(currentIndex)
        }

        function prevSlide() {
            if (currentIndex > 0) {
                _this.currentIndex = currentIndex -= 1
                slideTo(currentIndex)
            } else {
                wrapper.style.marginLeft = `${-sw * _this.currentIndex}px`
            }
        }

        function nextSlide() {
            if (currentIndex < slidesLength - 1) {
                _this.currentIndex = currentIndex += 1
                slideTo(currentIndex)
            } else { // last picture
                wrapper.style.marginLeft = `${-sw *  currentIndex}px`
            }
        }

        function slideTo() {
            var bullets = pagination.childNodes,
                i = 0,
                length = bullets.length

            for (; i < length; i++) {
                if (currentIndex == i) {
                    bullets[i].className += ' gallery-pagination-clickable'
                } else {
                    bullets[i].className = 'gallery-pagination-bullet'
                }
            }
            wrapper.style.marginLeft = `-${sw * currentIndex}px`
        }
    },
    zoom: function() {
        //HANDLE: picture zoom
        if (!this.customOpts['zoom']) return

        var _this = this,
            gallery = new Hammer(_this.wrapper)

        gallery.on('tap', function(e) {
            var element = e.target

            if (element.nodeName === 'IMG' && e.tapCount === 2) {
                var mouseX = Math.abs(e.center.x)

                if (element.getAttribute('style')) {
                    element.removeAttribute('style')
                    return
                }
                var sw = _this.sw,
                    sh = window.screen.height,
                    ew = element.clientWidth,
                    eh = element.clientHeight,
                    scale = sh / eh,
                    fw = sw * scale - sw, //finally width
                    ot = sw / 3, //one third of the screen width
                    tx

                /**
                 * Image zoom according to click direction
                 */
                if (0 < mouseX && mouseX < ot) { //left
                    tx = fw / 2
                } else if (sw > ew || ot < mouseX && mouseX < sw / 2) { //center
                    // element.parentNode.style.width = fw
                    element.style.webkitTransform = `scale(${scale})`
                    return
                } else { //right
                    tx = -(fw / 2)
                }
                element.style.webkitTransform = `translate3d(${tx}px, 0px, 0px) scale(${scale})`
            }
        })
    }
}
Gallery.fn.init.prototype = Gallery.fn