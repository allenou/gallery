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
            loop: false,
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

        var container = query(selector)
        var slides = query(opts['slide'])
        var wrapper = container.firstElementChild
        var sw = window.screen.width
        var currentIndex = 0

        if (opts.loop) {
            //inset firt slide and last slide
            var tplDiv = document.createElement('div')
            var firstSlide = slides[0].outerHTML
            var lastSlide = slides[slides.length - 1].outerHTML

            tplDiv.innerHTML = lastSlide + firstSlide
            wrapper.insertBefore(tplDiv.firstChild, slides[0])
            wrapper.appendChild(tplDiv.lastChild)

            currentIndex = 1
        }

        /*==============
         * pagination
         ==============*/
        //init bullet
        var pagination
        if (opts.pagination) {
            pagination = query(opts.pagination)

            for (var i = 0; i < slides.length; i++) {
                var bullet = document.createElement('span')
                bullet.className = 'gallery-pagination-bullet'
                bullet.setAttribute('data-index', i)
                pagination.appendChild(bullet)
            }
        }

        slides = query('.gallery-slide') // inset after query again
        wrapper.style.width = sw * slides.length + 'px' //set the wrapper width

        /*==============
         * slide
         ==============*/
        //HANDLE:click  slide

        var bullets
        if (pagination && opts.paginationClickable) {
            bullets = pagination.childNodes
            var paginationtime = new Hammer(pagination)

            //listen pagination tap event
            paginationtime.on('tap', function(e) {
                var element = e.target,
                    index = element.getAttribute('data-index')

                if (index) {
                    if (opts.loop) {
                        currentIndex = Number(index) + 1
                    } else {
                        currentIndex = Number(index)
                    }
                    slideTo()
                }
            })
        }

        var gallery = new Hammer(wrapper)

        gallery.on('panmove', function(e) {
            var distance = -(sw * currentIndex) + e.deltaX
            wrapper.style.webkitTransform = `translate3d(${distance}px,0px,0px)`
        })

        gallery.on('panend', function(e) {
            var mouseX = Math.abs(e.deltaX)

            wrapper.style.transition = "-webkit-transform 300ms";
            wrapper.style.webkitTransform = `translate3d(-${sw * currentIndex}px,0px,0px)`

            setTimeout(() => { //reset time
                wrapper.style.transition = "-webkit-transform 0ms"
            }, 300)

            //reductive translation
            if (mouseX < sw / 2) return

            if (e.deltaX > 0) {
                if (!opts.loop && currentIndex === 0) return
                prevSlide()
            } else {
                if (!opts.loop && currentIndex === slides.length - 1) return
                nextSlide()
            }
        })

        function prevSlide() {
            currentIndex -= 1

            slideTo()
            if (opts.loop && currentIndex === 0) {
                currentIndex = slides.length - 2
            }
        }

        function nextSlide() {
            currentIndex += 1

            slideTo()
            if (opts.loop && currentIndex === slides.length - 1) {
                currentIndex = 1
            }
        }

        slideTo() //default slide to the fisrt slide

        /**
         * slideTo
         */
        function slideTo() {
            if (bullets) {
                var activeIndex

                if (!opts.loop) {
                    activeIndex = currentIndex
                } else {
                    activeIndex = currentIndex - 1
                    if (activeIndex >= bullets.length) {
                        activeIndex = 0
                    }
                    if (activeIndex < 0) {
                        activeIndex = bullets.length - 1
                    }
                }

                for (var i = 0; i < bullets.length; i++) {
                    if (activeIndex == i) {
                        bullets[i].classList.add('gallery-pagination-clickable')
                    } else {
                        bullets[i].classList.remove('gallery-pagination-clickable')
                    }
                }
            }
            lazyLoading()

            wrapper.style.webkitTransform = `translate3d(-${sw * currentIndex}px,0px,0px)`
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
        /*==============
         * lazyLoading
        ==============*/

        function lazyLoading() {
            if (!opts.lazyLoading) return

            var elements = query(opts.lazy),
                img, dataSrc

            if (elements.length > 0 && elements[currentIndex].nodeName === 'IMG') {
                img = elements[currentIndex]
                dataSrc = img.getAttribute('data-src')
                if (dataSrc) {
                    img.setAttribute('src', dataSrc)
                }
            }
        }

        /*==============
         * resize
         ==============*/
        if (opts.resize) {
            window.addEventListener('resize', resize)
        }

        function resize() {
            sw = window.screen.width
            wrapper.style.width = sw * slides.length + 'px' //set the wrapper width
            slideTo()
        }
    }

    window.Gallery = Gallery
}())