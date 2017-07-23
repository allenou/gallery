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

        this.slideIndex = 0
        this.customOpts = opts
        this.slides = slides

        this.spot()
        this.events()
    },
    spot: function() {
        //HANDLE : pagination
        var pagination = this.pagination
        var slides = this.slides
        for (var i = 0; i < slides.length; i++) {
            bullet = document.createElement('span')
            bullet.className = 'gallery-pagination-bullet'
            bullet.setAttribute('data-index', i)
            pagination.appendChild(bullet)
            pagination.childNodes[0].className += ' gallery-pagination-clickable'
        }

    },
    events: function() {
        //HANDLE : events
        var _this = this
        if (!this.customOpts['zoom']) return

        var hammerOpts = {

        }

        var gallery = new Hammer(_this.wrapper, hammerOpts);

        //HANDLE: picture zoom
        gallery.on('tap', function(e) {
            var element = e.target
            if (element.nodeName === 'IMG' && e.tapCount === 2) {
                if (element.getAttribute('style')) {
                    element.removeAttribute('style');
                    return
                }
                _this.zoom(e.target, e.center.x)
            }
        });

        //HANDLE:picture pan
        gallery.on('panmove', function(e) {
            var distance
            console.log(_this.slideIndex)
            distance = -(_this.sw * _this.slideIndex) + e.deltaX
            _this.wrapper.style.marginLeft = `${distance}px`;
        })

        gallery.on('panend', function(e) {
            var element = e.target,
                type = e.additionalEvent,
                mouseX = Math.abs(e.deltaX),
                sw = _this.sw

            if (mouseX < sw / 3) { //滑动距离小于屏幕宽度1/3，还原平移
                _this.wrapper.style.marginLeft = `${-sw * _this.slideIndex}px`;
                return;
            }
            _this.slide(type)
        });

        //HANDLE:pagination tap
        var pagination = new Hammer(_this.pagination, {});
        pagination.on('tap', function(e) {
            var element = e.target
            var index = element.getAttribute('data-index')
            if (index) {
                _this.slideIndex = index
                _this.slide()
            }
        });
    },

    slide: function(type) {
        var sw = this.sw,
            wrapper = this.wrapper,
            pagination = this.pagination,
            slideIndex = this.slideIndex,
            slidesLength = this.slidesLength

        if (type === 'panleft') {
            nextSlide()
        } else if (type === 'panright') {
            prevSlide()
        } else {
            slideTo(slideIndex)
        }

        function prevSlide() {

        }

        function nextSlide() {
            if (slideIndex < slidesLength - 1) {
                slideIndex += 1;
                slideTo(slideIndex);
            } else { //最后一张
                wrapper.style.marginLeft = `${-sw *  slideIndex}px`
            }
        }

        function slideTo() {
            var bullets = pagination.childNodes,
                bullet, i = 0,
                length = bullets.length
            for (; i < length; i++) {
                if (slideIndex == i) {
                    bullets[i].className += ' gallery-pagination-clickable'
                } else {
                    bullets[i].className = 'gallery-pagination-bullet'
                }
            }
            wrapper.style.marginLeft = `-${sw * slideIndex}px`
        }
    },
    zoom: function(element, mouseX) {
        var sw = this.sw,
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
            tx = fw / 2;
        } else if (sw > ew || ot < mouseX && mouseX < sw / 2) { //center
            // element.parentNode.style.width = fw
            element.style.webkitTransform = `scale(${scale})`
            return;
        } else { //right
            tx = -(fw / 2);
        }
        element.style.webkitTransform = `translate3d(${tx}px, 0px, 0px) scale(${scale})`;
    }
}
Gallery.fn.init.prototype = Gallery.fn