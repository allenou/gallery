(function() {
    'use strict'
    var Gallery = function(selector, customOpts) {
        if (!(this instanceof Gallery)) return new Gallery(selector, opts)

        // default opptions
        var opts = {
            slide: '.gallery-slide',
            pagination: '.gallery-pagination',
            paginationClickable: false,
            zoom: false,
            resize: true,
            lazyLoading: false,
            lazy: '.lazy'
        }

        //merge opptions
        for (var opt in opts) {
            if (customOpts[opt]) {
                opts[opt] = customOpts[opt]
            }
        }

        /**
         * query DOM
         * @param {String} selector : css selector
         */
        function query(selector) {
            var elements = document.querySelectorAll(selector)
            return elements.length > 1 ? elements : elements[0]
        }

        var container = query(selector),
            wrapper = container.firstElementChild,

            sw = window.screen.width

        //init inset
        var slides = query(opts['slide'])

        var firstSlide = slides[0].outerHTML,
            lastSlide = slides[slides.length - 1].outerHTML

        var tplDiv = document.createElement('div')
        var currentIndex = 1

        tplDiv.innerHTML = lastSlide + firstSlide
        wrapper.insertBefore(tplDiv.firstChild, slides[0])
        wrapper.appendChild(tplDiv.lastChild)

        /*==============
         * pagination
         ==============*/
        //init bullet
        var pagination
        if (opts['pagination']) {
            pagination = query(opts['pagination'])
            var i = 0
            for (; i < slides.length; i++) {
                var bullet = document.createElement('span')
                bullet.className = 'gallery-pagination-bullet'
                bullet.setAttribute('data-index', i)
                pagination.appendChild(bullet)
            }
        }

        slides = query('.gallery-slide') // inset after query again
        wrapper.style.width = sw * slides.length + 'px' //set the wrapper width

        var gallery = new Hammer(wrapper)

        /*==============
         * slide
         ==============*/
        //HANDLE:click  slide


        var bullets
        if (pagination && opts['paginationClickable']) {
            bullets = pagination.childNodes
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

        slideTo(currentIndex) //default slide to the fisrt slide

        /**
         * slideTo
         * @param {Number} appointIndex  : next slide index
         */
        function slideTo(appointIndex) {
            if (bullets) {
                var i = 0,
                    length = bullets.length
                for (; i < length; i++) {
                    if (appointIndex == i + 1) {
                        bullets[i].classList.add('gallery-pagination-clickable')

                    } else {
                        bullets[i].classList.remove('gallery-pagination-clickable')
                    }
                }
            }
            lazyLoading(appointIndex)
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
        /**
         * lazyLoading
         * @param {Number} index: next slide index
         */
        function lazyLoading(index) {
            if (!opts['lazyLoading']) return

            var lazyElements = document.querySelectorAll(opts['lazy']),
                img, dataSrc

            // element not is image
            if (lazyElements[index].nodeName === 'IMG') {
                img = lazyElements[index]
                dataSrc = img.getAttribute('data-src')
                if (dataSrc) {
                    img.setAttribute('src', dataSrc)
                }
            }
        }

        function resize() {
            sw = window.screen.width
            wrapper.style.width = sw * slides.length + 'px' //set the wrapper width
            slideTo(currentIndex)
        }

        if (opts['resize']) {
            window.addEventListener('resize', resize)
        }
    }

    window.Gallery = Gallery
}())