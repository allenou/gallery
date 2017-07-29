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
            slides = this.slides = document.getElementsByClassName('gallery-slide'),
            pagination = this.pagination = document.querySelector(opts['pagination']),
            sw = this.sw = window.screen.width

        wrapper.style.width = slides.length * sw + 'px'

        this.currentIndex = 1
        this.customOpts = opts

        var firstSlide = slides[0].outerHTML,
            lastSlide = slides[slides.length - 1].outerHTML

        //init inset
        var lastTpl = document.createElement('div'),
            firstTpl = document.createElement('div')
        lastTpl.innerHTML = lastSlide
        firstTpl.innerHTML = firstSlide
        wrapper.insertBefore(lastTpl.firstChild, slides[0])
        wrapper.appendChild(firstTpl.firstChild)

        wrapper.style.width = sw * slides.length + 'px'

        wrapper.style.marginLeft = `${-sw}px`


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

        for (; i < length - 2; i++) {
            bullet = document.createElement('span')
            bullet.className = 'gallery-pagination-bullet'
            bullet.setAttribute('data-index', i)
            pagination.appendChild(bullet)
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
            var distance = -(sw * _this.currentIndex) + e.deltaX
            if (distance < sw / 2) {
                wrapper.style.marginLeft = `${distance}px`
            }
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
            pagination = this.pagination,
            bullets = pagination.childNodes,
            currentIndex = this.currentIndex,
            slides = this.slides

        //HANDLE:pagination tap
        if (this.customOpts['paginationClickable']) {
            var paginationtime = new Hammer(pagination)

            paginationtime.on('tap', function(e) {
                var element = e.target,
                    index = element.getAttribute('data-index')

                if (index) {
                    _this.currentIndex = currentIndex = Number(index) + 1
                    slideTo()
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
            _this.currentIndex = currentIndex -= 1

            if (currentIndex === 0) {
                _this.currentIndex = currentIndex = slides.length - 2
            }
            slideTo()
        }

        function nextSlide() {
            _this.currentIndex = currentIndex += 1

            if (currentIndex === slides.length - 1) {
                _this.currentIndex = currentIndex = 1
            }
            slideTo()
        }

        function slideTo() {
            var i = 0,
                length = bullets.length

            for (; i < length; i++) {
                if (currentIndex == i + 1) {
                    bullets[i].classList.add('gallery-pagination-clickable')

                } else {
                    bullets[i].classList.remove('gallery-pagination-clickable')
                }
            }
            _this.wrapper.style.marginLeft = `-${_this.sw * _this.currentIndex}px`
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