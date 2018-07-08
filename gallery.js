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
            base64: false,
            lazy: '.lazy'
        }

        //merge opptions
        for (var opt in opts) {
            if (customOpts[opt]) {
                opts[opt] = customOpts[opt]
            }
        }

        /**
         * @description query DOM
         * @param {String} selector : css selector
         * @return {Object} NodeItem
         */
        function query(s) {
            return document.querySelector(s)
        }
        /**
         * @description query DOM
         * @param {String} selector : css selector
         * @return {Object} NodeList
         */
        function queryAll(s) {
            return document.querySelectorAll(s)
        }
        var container = query(selector)
        var slides = queryAll(opts.slide)
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

            currentIndex = 1 // set the default slide index
        }
        /**
         * @description traversing slides
         * @param {Function} cb callback 
         */
        function traversingSlides(cb) {
            for (var i = 0; i < slides.length; i++) {
                cb(i)
            }
        }

        function init() {
            traversingSlides(function(index) {

            })
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

        slides = queryAll(opts.slide) // inset after query again
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

            lazyLoadingNextSlide()
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

        function lazyLoadingNextSlide() {
            if (!opts.lazyLoading) return

            var elements = queryAll(opts.lazy),
                img, dataSrc
            if (elements.length > 0 && elements[currentIndex].nodeName === 'IMG') {
                img = elements[currentIndex]

                dataSrc = img.getAttribute('data-src')
                if (dataSrc) {
                    if (!opts.base64) {
                        img.setAttribute('src', dataSrc)
                    } else {
                        convertImgToBase64(dataSrc, function(base64) {
                            img.setAttribute('src', base64)
                        })
                    }
                }
            }
        }
        /*==============
         * base64
        ==============*/
        /**
         * @description Convert image to base64 string
         * @param {String} src image path 
         * @param {Function} cb callback
         */
        function convertImgToBase64(src, cb) {
            var image = new Image()
            image.src = src
            image.onload = function() {
                var canvas = document.createElement('canvas')
                canvas.width = image.width
                canvas.height = image.height
                canvas.getContext('2d').drawImage(image, 0, 0)
                cb(canvas.toDataURL())
            }
            image.onerror = function() {
                throw ('Image loaded error, Please check the image path')
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