jQuery(document).ready(function ($) {

    // Sound Familiar — sticky pin + horizontal scrub
    (function initSoundFamiliarScroll() {
        var section = document.querySelector('.section--sound-familiar');
        var track = document.querySelector('.sound-familiar__track');
        var cards = track ? track.querySelectorAll('.sound-familiar__card') : [];
        var container = section ? section.querySelector('.container') : null;

        if (!section || !track || cards.length < 2) return;

        var mq = window.matchMedia('(min-width: 992px)');
        var currentX = 0;
        var targetX = 0;
        var rafId = null;
        var segments = cards.length - 1;
        var lerpFactor = 0.12;

        function getGap() {
            var styles = window.getComputedStyle(track);
            return parseFloat(styles.columnGap || styles.gap) || 43;
        }

        function getMaxTranslate() {
            var step = cards[0].offsetWidth + getGap();
            return step * segments;
        }

        function setSectionHeight() {
            if (!mq.matches) {
                section.style.height = '';
                track.style.paddingLeft = '';
                track.style.transform = '';
                currentX = 0;
                targetX = 0;
                return;
            }

            var vh = window.innerHeight;
            section.style.height = (vh * cards.length) + 'px';

            if (container) {
                track.style.paddingLeft = container.getBoundingClientRect().left + 'px';
            }
        }

        function applyTransform(x) {
            track.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
        }

        function updateActiveCard(progress) {
            var activeIndex = Math.min(
                cards.length - 1,
                Math.round(progress * segments)
            );

            cards.forEach(function (card, i) {
                card.classList.toggle('is-active', i === activeIndex);
            });
        }

        function render() {
            currentX += (targetX - currentX) * lerpFactor;

            if (Math.abs(targetX - currentX) < 0.15) {
                currentX = targetX;
                rafId = null;
            } else {
                rafId = window.requestAnimationFrame(render);
            }

            applyTransform(currentX);
        }

        function syncFromScroll() {
            if (!mq.matches) {
                cards.forEach(function (card) {
                    card.classList.add('is-active');
                });
                return;
            }

            var scrollable = section.offsetHeight - window.innerHeight;
            if (scrollable <= 0) return;

            var rect = section.getBoundingClientRect();
            var progress = Math.max(0, Math.min(1, (-rect.top) / scrollable));

            targetX = getMaxTranslate() * progress;
            updateActiveCard(progress);

            if (!rafId) {
                rafId = window.requestAnimationFrame(render);
            }
        }

        function onResize() {
            setSectionHeight();
            syncFromScroll();
        }

        setSectionHeight();
        syncFromScroll();

        window.addEventListener('scroll', syncFromScroll, { passive: true });
        window.addEventListener('resize', onResize);
        if (mq.addEventListener) {
            mq.addEventListener('change', onResize);
        } else if (mq.addListener) {
            mq.addListener(onResize);
        }
    })();

    // Scrollact — progressive active on scroll
    (function initScrollact() {
        var items = document.querySelectorAll('.scrollact__item');
        if (!items.length) return;

        var ticking = false;

        function update() {
            ticking = false;
            var triggerY = window.innerHeight * 0.5;

            items.forEach(function (item) {
                var rect = item.getBoundingClientRect();
                // Активуємо, коли верх елемента доходить до половини екрану
                var shouldBeActive = rect.top <= triggerY;
                item.classList.toggle('active', shouldBeActive);
            });
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
    })();

    // Impact accordion — sticky + scroll-triggered open
    (function initImpactAccordeon() {
        var root = document.querySelector('.impact__accordeon');
        var items = root ? root.querySelectorAll('.impact__accordeon-item') : [];
        var images = root ? root.querySelectorAll('[data-impact-img]') : [];

        if (!root || !items.length) return;

        var mq = window.matchMedia('(min-width: 992px)');
        var ticking = false;

        function setActive(index) {
            items.forEach(function (item, i) {
                item.classList.toggle('is-open', i === index);
            });
            // усі до активної включно лишаються відкритими (шари стосом),
            // наступні — сховані зверху й виїжджають при досягненні
            images.forEach(function (img, i) {
                img.classList.toggle('is-active', i <= index);
            });
        }

        function setHeight() {
            if (!mq.matches) {
                root.style.height = '';
                return;
            }

            var vh = window.innerHeight;
            root.style.height = (vh * items.length) + 'px';
        }

        function update() {
            ticking = false;

            if (!mq.matches) {
                var triggerY = window.innerHeight * 0.45;
                var active = 0;

                items.forEach(function (item, i) {
                    if (item.getBoundingClientRect().top <= triggerY) {
                        active = i;
                    }
                });
                setActive(active);
                return;
            }

            var scrollable = root.offsetHeight - window.innerHeight;
            if (scrollable <= 0) return;

            var rect = root.getBoundingClientRect();
            var progress = Math.max(0, Math.min(0.999, (-rect.top) / scrollable));
            var index = Math.min(items.length - 1, Math.floor(progress * items.length));

            setActive(index);
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        function onResize() {
            setHeight();
            update();
        }

        setHeight();
        update();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        if (mq.addEventListener) {
            mq.addEventListener('change', onResize);
        } else if (mq.addListener) {
            mq.addListener(onResize);
        }
    })();

    // Impact orbit image — rotate on scroll (як на severus.co)
    (function initImpactOrbit() {
        var images = document.querySelectorAll('.impact__orbit-img');
        if (!images.length) return;

        var scrollPosition = window.scrollY || 0;

        window.addEventListener('scroll', function () {
            var currentScrollPosition = window.scrollY || 0;
            var direction = 'none';

            if (currentScrollPosition > scrollPosition) {
                direction = 'down';
            } else if (currentScrollPosition < scrollPosition) {
                direction = 'up';
            }

            var rotationAngle = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;

            images.forEach(function (image) {
                var currentRotation = parseInt(image.dataset.rotation || 0, 10);
                var newRotation = (currentRotation + rotationAngle) % 360;
                image.style.transform = 'rotate(' + newRotation + 'deg)';
                image.dataset.rotation = String(newRotation);
            });

            scrollPosition = currentScrollPosition;
        }, { passive: true });
    })();

    // Video popup
    var $popup = $('#hero__video-popup');
    var video = document.getElementById('hero__pop-up-video');

    function openVideoPopup() {
        $popup.addClass('is-open').attr('aria-hidden', 'false');
        $('body').addClass('hidden');
        if (video) {
            video.muted = false;
            video.play();
        }
    }

    function closeVideoPopup() {
        $popup.removeClass('is-open').attr('aria-hidden', 'true');
        $('body').removeClass('hidden');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    }

    $('#hero__video-section, .hero__video-btn').on('click', function () {
        openVideoPopup();
    });

    $('#hero__video-section, .hero__video-btn').on('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openVideoPopup();
        }
    });

    $popup.on('click', '.hero__video-popup-overlay, .hero__video-popup-close', function () {
        closeVideoPopup();
    });

    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $popup.hasClass('is-open')) {
            closeVideoPopup();
        }
    });

    // results - slider
    var swiper = new Swiper('.results-slider', {
        slidesPerView: 1,
        spaceBetween: 20,
        autoHeight: true,
        loop: true,
        speed: 900,

        navigation: {
            nextEl: '.swiper-button-next.results-slider__next',
            prevEl: '.swiper-button-prev.results-slider__prev',
        },

        breakpoints: {
            575: {
                slidesPerView: 1.2,
                autoHeight: false,
            },
            767: {
                slidesPerView: 1.6,
                autoHeight: false,
            },
            991: {
                slidesPerView: 2.2,
                autoHeight: false,
            },
            1200: {
                slidesPerView: 2.2,
                autoHeight: false,
            },
            1500: {
                slidesPerView: 2.8,
                autoHeight: false,
            },
        },
    });

    // testimonials — вертикальний слайдер
    new Swiper('.testimonials-slider', {
        direction: 'vertical',
        slidesPerView: 1.1,
        spaceBetween: 10,
        mousewheel: true,
        loop: true,
        speed: 700,
        centeredSlides: true,
        

        breakpoints: {
            
            575: {
                slidesPerView: 1.6,
                spaceBetween: 20,
            },
            1200: {
                slidesPerView: 1.8,
                spaceBetween: 10,
            },
            1500: {
                slidesPerView: 2,
                spaceBetween: 10,
            },
        },
    });

    // FAQ accordion
    $('.cqsect').on('click', '.cqsect__header', function () {
        var $item = $(this).closest('.cqsect__item');
        var $body = $item.find('.cqsect__body');
        var $others = $item.siblings('.cqsect__item');

        if ($item.hasClass('active')) {
            $item.removeClass('active');
            $body.stop(true, true).slideUp(300);
            return;
        }

        $others.removeClass('active').find('.cqsect__body').stop(true, true).slideUp(300);
        $item.addClass('active');
        $body.stop(true, true).slideDown(300);
    });

    // плавний скрол до якоря
    $('.scrolltoid').on('click', function (e) {
        var href = $(this).attr('href');
        if (!href || href.charAt(0) !== '#') return;

        var $target = $(href);
        if (!$target.length) return;

        e.preventDefault();

        var headerOffset = $('header.header').outerHeight() || 0;
        var scrollTop = $target.offset().top - headerOffset;

        $('html, body').stop(true).animate({ scrollTop: scrollTop }, 700);
    });

    // mobmenu
    function openMobileMenu() {
        $('.mobile-menu-col, .menu-overlay').addClass('open');
        // $('body').addClass('menu-open');
    }

    function closeMobileMenu() {
        $('.mobile-menu-col, .menu-overlay').removeClass('open');
        // $('body').removeClass('menu-open');
    }

    $('.burger-btn').click(openMobileMenu);
    $('.close-menu, .menu-overlay').click(closeMobileMenu);

    // cookie notice
    (function initCookieNotice() {
        var $notice = $('#cookie-notice');
        if (!$notice.length) return;

        var storageKey = 'severus_cookie_consent';

        function hideNotice() {
            $notice.removeClass('is-visible').attr('aria-hidden', 'true');
        }

        function showNotice() {
            $notice.addClass('is-visible').attr('aria-hidden', 'false');
        }

        function saveConsent(value) {
            try {
                localStorage.setItem(storageKey, value);
            } catch (e) {}
            hideNotice();
        }

        if (!localStorage.getItem(storageKey)) {
            showNotice();
        }

        $notice.on('click', '.cookie-notice__btn--accept', function () {
            saveConsent('accepted');
        });

        $notice.on('click', '.cookie-notice__btn--reject', function () {
            saveConsent('rejected');
        });
    })();

});
