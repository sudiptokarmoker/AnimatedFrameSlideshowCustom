/**
 * demo2.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2017, Codrops
 * http://www.codrops.com
 */
{
    var globalStyleValue = 2;
    // From https://davidwalsh.name/javascript-debounce-function.
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
    };
    
    class Slideshow {
        constructor(el) {
            this.DOM = {};
            this.DOM.el = el;
            this.settings = {
                animation: {
                    slides: {
                        duration: 600,
                        easing: 'easeOutQuint'
                    },
                    shape: {
                        duration: 300,
                        easing: {in: globalStyleValue == 1 ? 'easeOutQuint' : 'easeOutQuad', out: 'easeOutQuad'}
                    }
                },
                //frameFill: '#f1f1f1'
                frameFill: '#f1f1f1'
            }
            // default loadded style
            //this.currentStyleLoaded = styleLoaddedInstance !== undefined ? 1 : styleLoaddedInstance;
            this.currentStyleLoaded = globalStyleValue;
            /**
             * end of default loadded style
             */
            this.init();
        }
        init() {
            console.log("init again");
            this.DOM.slides = Array.from(this.DOM.el.querySelectorAll('.slides > .slide'));
            this.slidesTotal = this.DOM.slides.length;
            this.DOM.nav = this.DOM.el.querySelector('.slidenav');
            this.DOM.nextCtrl = this.DOM.nav.querySelector('.slidenav__item--next');
            this.DOM.prevCtrl = this.DOM.nav.querySelector('.slidenav__item--prev');
            this.current = 0;
            this.createFrame(); 
            this.initEvents();
        }
        createFrame() {
            this.rect = this.DOM.el.getBoundingClientRect();
            this.frameSize = this.rect.width/12;
            this.paths = {
                initial: this.calculatePath('initial'),
                final: this.calculatePath('final')
            };
            this.DOM.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.DOM.svg.setAttribute('class', 'shape');
            this.DOM.svg.setAttribute('width','100%');
            this.DOM.svg.setAttribute('height','100%');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.svg.innerHTML = `<path fill="${this.settings.frameFill}" d="${this.paths.initial}"/>`;
            this.DOM.el.insertBefore(this.DOM.svg, this.DOM.nav);
            this.DOM.shape = this.DOM.svg.querySelector('path');
        }
        updateFrame() {
            this.paths.initial = this.calculatePath('initial');
            this.paths.final = this.calculatePath('final');
            this.DOM.svg.setAttribute('viewbox',`0 0 ${this.rect.width} ${this.rect.height}`);
            this.DOM.shape.setAttribute('d', this.isAnimating ? this.paths.final : this.paths.initial);
        }
        calculatePath(path = 'initial') {
            if(this.currentStyleLoaded === 1){
                console.log("loadded calculatate path : 1");
                return path === 'initial' ?
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z` :
                `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize} Z`;
            } else {
                console.log("loadded calculatate path : 2");
                if ( path === 'initial' ) {
                    return `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M 0,0 ${this.rect.width},0 ${this.rect.width},${this.rect.height} 0,${this.rect.height} Z`;
                }
                else {
                    return {
                        next: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize/2} ${this.frameSize},${this.rect.height-this.frameSize} Z`,
                        prev: `M 0,0 0,${this.rect.height} ${this.rect.width},${this.rect.height} ${this.rect.width},0 0,0 Z M ${this.frameSize},${this.frameSize/2} ${this.rect.width-this.frameSize},${this.frameSize} ${this.rect.width-this.frameSize},${this.rect.height-this.frameSize} ${this.frameSize},${this.rect.height-this.frameSize/2} Z`
                    }
                }
            }
        }
        initEvents() {
            this.DOM.nextCtrl.addEventListener('click', () => this.navigate('next'));
            this.DOM.prevCtrl.addEventListener('click', () => this.navigate('prev'));
            
            window.addEventListener('resize', debounce(() => {
                this.rect = this.DOM.el.getBoundingClientRect();
                this.updateFrame();
            }, 20));
            
            document.addEventListener('keydown', (ev) => {
                const keyCode = ev.keyCode || ev.which;
                if ( keyCode === 37 ) {
                    this.navigate('prev');
                }
                else if ( keyCode === 39 ) {
                    this.navigate('next');
                }
            });
        }
        navigate(dir = 'next') {
            if ( this.isAnimating ) return false;
            this.isAnimating = true;

            const animateShapeIn = anime({
                targets: this.DOM.shape,
                duration: this.settings.animation.shape.duration,
                easing: this.settings.animation.shape.easing.in,
                d: this.paths.final
            });

            const animateSlides = () => {
                return new Promise((resolve, reject) => {
                    const currentSlide = this.DOM.slides[this.current];
                    anime({
                        targets: currentSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: dir === 'next' ? -1*this.rect.width : this.rect.width,
                        complete: () => {
                            currentSlide.classList.remove('slide--current');
                            resolve();
                        }
                    });
        
                    this.current = dir === 'next' ? 
                        this.current < this.slidesTotal-1 ? this.current + 1 : 0 :
                        this.current > 0 ? this.current - 1 : this.slidesTotal-1; 
                    
                    const newSlide = this.DOM.slides[this.current];
                    newSlide.classList.add('slide--current');
                    anime({
                        targets: newSlide,
                        duration: this.settings.animation.slides.duration,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? this.rect.width : -1*this.rect.width,0]
                    });
                    /**
                    const newSlideImg = newSlide.querySelector('.slide__img');
                    anime.remove(newSlideImg);
                    anime({
                        targets: newSlideImg,
                        duration: this.settings.animation.slides.duration*4,
                        easing: this.settings.animation.slides.easing,
                        translateX: [dir === 'next' ? 200 : -200, 0]
                    });
                    */
                    // modifiying code here
                    if(this.currentStyleLoaded === 1){
                        const newSlideImg = newSlide.querySelector('.slide__img');
                        anime.remove(newSlideImg);
                        anime({
                            targets: newSlideImg,
                            duration: this.settings.animation.slides.duration*4,
                            easing: this.settings.animation.slides.easing,
                            translateX: [dir === 'next' ? 200 : -200, 0]
                        });

                        anime({
                            targets: [newSlide.querySelector('.slide__title'), newSlide.querySelector('.slide__desc'), newSlide.querySelector('.slide__link')],
                            duration: this.settings.animation.slides.duration*2,
                            easing: this.settings.animation.slides.easing,
                            delay: (t,i) => i*100+100,
                            translateX: [dir === 'next' ? 300 : -300,0],
                            opacity: [0,1]
                        });

                    } else {
                        const newSlideImg = newSlide.querySelector('.slide__img');
                        newSlideImg.style.transformOrigin = dir === 'next' ? '-10% 50%' : '110% 50%';
                        anime.remove(newSlideImg);
                        anime({
                            targets: newSlideImg,
                            duration: this.settings.animation.slides.duration*4,
                            easing: 'easeOutElastic',
                            elasticity: 350,
                            scale: [1.2,1],
                            rotate: [dir === 'next' ? 4 : -4,0]
                        });

                        anime({
                            targets: [newSlide.querySelector('.slide__title'), newSlide.querySelector('.slide__desc'), newSlide.querySelector('.slide__link')],
                            duration: this.settings.animation.slides.duration,
                            easing: this.settings.animation.slides.easing,
                            delay: (t,i,total) => dir === 'next' ? i*100+750 : (total-i-1)*100+750,
                            translateY: [dir === 'next' ? 300 : -300,0],
                            rotate: [15,0],
                            opacity: [0,1]
                        });
                    }
                });
            };

            const animateShapeOut = () => {
                anime({
                    targets: this.DOM.shape,
                    duration: this.settings.animation.shape.duration,
                    delay: 150,
                    easing: this.settings.animation.shape.easing.out,
                    d: this.paths.initial,
                    complete: () => this.isAnimating = false
                });
            }

            animateShapeIn.finished.then(animateSlides).then(animateShapeOut);
        }
        /**
         * merge method handler
         */
        mergeHandler = () => {
            console.log(this.currentStyleLoaded);
        }
    };

    //var objSlideshow = new Slideshow(document.querySelector('.slideshow'));
    var objSlideshow;
    objSlideshow = new Slideshow(document.querySelector('.slideshow'));
    imagesLoaded('.slide__img', { background: true }, () => document.body.classList.remove('loading'));
    //console.log(objSlideshow.mergeHandler());
    // $( "li" ).each(function( index ) {
    //     console.log( index + ": " + $( this ).text() );
    // });
    document.querySelectorAll('.style-item').forEach((element) => {
        element.addEventListener("click", function(){
            //this.currentStyleLoaded = this.dataset.style;
            globalStyleValue = parseInt(this.dataset.style);
            console.log(this.currentStyleLoaded);
            objSlideshow = new Slideshow(document.querySelector('.slideshow'));
            //console.log(objSlideshow); 
            //new Slideshow(document.querySelector('.slideshow'));
            //imagesLoaded('.slide__img', { background: true }, () => document.body.classList.remove('loading'));
        });
    });
    /*
    document.querySelector('.custom-style-load-area ul li').forEach(function(){
        //document.querySelector('.custom-style-load-area ul li a').addEventListener("click", function(){ 
            //alert("Hello World! + ");
            //console.log(this.dataset.style);
            var x = this.nextSibling.innerHTML;
            console.log(x); 
        //});
    })
    */
};