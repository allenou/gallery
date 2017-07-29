(function() {
    'use strict'
    var Gallery = function(selector, opts) {
        if (!(this instanceof Gallery)) return new Gallery(selector, opts)

        var container = document.getElementById(selector),
            wrapper = container.firstElementChild,
            slides = document.getElementsByClassName('gallery-slide'),
            pagination = document.querySelector(opts['pagination']),
            sw = window.screen.width

        var firstSlide = slides[0].outerHTML,
            lastSlide = slides[slides.length - 1].outerHTML

        wrapper.style.width = slides.length * sw + 'px'

        //init inset
        var currentIndex = 1
        var lastTpl = document.createElement('div'),
            firstTpl = document.createElement('div')
        lastTpl.innerHTML = lastSlide
        firstTpl.innerHTML = firstSlide
        wrapper.insertBefore(lastTpl.firstChild, slides[0])
        wrapper.appendChild(firstTpl.firstChild)
        wrapper.style.width = sw * slides.length + 'px'

        var length = slides.length

        //HANDLE : pagination
        if (opts['pagination']) {
            var i = 0
            for (; i < length - 2; i++) {
                var bullet = document.createElement('span')
                bullet.className = 'gallery-pagination-bullet'
                bullet.setAttribute('data-index', i)
                pagination.appendChild(bullet)
            }
        }
        var gallery = new Hammer(wrapper)

        /*==============
         * slide
         ==============*/
        //HANDLE:click  slide
        var bullets = pagination.childNodes
        slideTo(currentIndex)
        if (opts['paginationClickable']) {
            var paginationtime = new Hammer(pagination)

            paginationtime.on('tap', function(e) {
                var element = e.target,
                    index = element.getAttribute('data-index')

                if (index) {
                    var appointIndex = Number(index) + 1
                    slideTo(appointIndex)
                }
            })
        }
        gallery.on('panmove', function(e) {
            var distance = -(sw * currentIndex) + e.deltaX
            if (distance < sw / 2) {
                wrapper.style.marginLeft = `${distance}px`
            }
        })
        gallery.on('panend', function(e) {
            var element = e.target,
                mouseX = Math.abs(e.deltaX)

            if (mouseX < sw / 3) { //reductive translation
                wrapper.style.marginLeft = `${-sw * currentIndex}px`
                return
            }
            if (e.deltaX < 0) {
                nextSlide()
            } else if (e.deltaX > 0) {
                prevSlide()
            } else {
                slideTo(currentIndex)
            }
        })

        function prevSlide() {
            currentIndex -= 1
            if (currentIndex === 0) {
                currentIndex = slides.length - 2
            }
            slideTo(currentIndex)
        }

        function nextSlide() {
            currentIndex += 1
            if (currentIndex === slides.length - 1) {
                currentIndex = 1
            }
            slideTo(currentIndex)
        }

        function slideTo(appointIndex) {
            var i = 0,
                length = bullets.length

            for (; i < length; i++) {
                if (appointIndex == i + 1) {
                    bullets[i].classList.add('gallery-pagination-clickable')

                } else {
                    bullets[i].classList.remove('gallery-pagination-clickable')
                }
            }
            wrapper.style.marginLeft = `-${sw * appointIndex}px`
        }

        /*==============
         * zoom
         ==============*/

        if (opts['zoom']) {
            gallery.on('tap', function(e) {
                handleZoom(e)
            })
        }

        /**
         * handleZoom
         * @param {Object} e :tap event object
         */
        function handleZoom(e) {
            if (e.target.nodeName === 'IMG' && e.tapCount === 2) {
                var img = e.target
                var mouseX = Math.abs(e.center.x)

                if (img.getAttribute('style')) {
                    img.removeAttribute('style')
                    return
                }
                var sh = window.screen.height,
                    cw = img.clientWidth,
                    ch = img.clientHeight,
                    scale = sh / ch,
                    fw = sw * scale - sw, //finally width
                    ot = sw / 3, //one third of the screen width
                    tx

                /**
                 * Image zoom according to click direction
                 */
                if (0 < mouseX && mouseX < ot) { //left
                    tx = fw / 2
                } else if (sw > cw || ot < mouseX && mouseX < sw / 2) { //center
                    img.style.webkitTransform = `scale(${scale})`
                    return
                } else { //right
                    tx = -(fw / 2)
                }
                img.style.webkitTransform = `translate3d(${tx}px, 0px, 0px) scale(${scale})`
            }
        }
    }

    window.Gallery = Gallery
}())