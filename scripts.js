/**
 * ============================================
 * Ретро-ТВ Лендинг — Интерактивность
 * ============================================
 * Функции:
 * - Переключение видео между YouTube и VK Video
 * - Интерактивная игрушка (3 состояния)
 * - Адаптивное позиционирование областей
 */

(function() {
    'use strict';

    // ============================================
    // КОНФИГУРАЦИЯ
    // ============================================
    
    const CONFIG = {
        // Плейсхолдеры для видео
        // Для случайных видео можно использовать плейлисты или конкретные видео ID
        videoEmbeds: {
            youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0',
            vk: 'https://vk.com/video_ext.php?oid=-123456789&id=987654321&autoplay=1'
        },
        
        // Списки видео ID для случайного выбора (заполнить позже)
        randomVideos: {
            youtube: [
                'dQw4w9WgXcQ',  // Rick Astley
                '9bZkp7q19f0',  // Gangnam Style
                'kJQP7kiw5Fk'   // Despacito
            ],
            vk: [
                '-123456789_987654321',
                '-123456789_123456789'
            ]
        },
        
        // Звуки для игрушки (будут добавлены позже)
        toySounds: {
            singleClick: '', // 'source/sound1.mp3'
            doubleClick: ''  // 'source/sound2.mp3'
        },
        
        // Размеры фонового изображения в пикселях (оригинальные)
        backdropOriginal: {
            width: 1159,   // Фактическая ширина backstage.jpeg
            height: 720    // Фактическая высота backstage.jpeg
        },
        
        // Координаты областей в пикселях (из разметки imgmap)
        // Корректировка: картриджи +100px вверх, джойстик +20px вверх
        areas: {
            tv: {
                top: 85,
                left: 315,
                width: 680,
                height: 463
            },
            toy: {
                top: 295,   // Игрушка: вверх на 300
                left: 204,   // Консоль: влево на 50px   // Игрушка: вправо на 100
                width: 112,
                height: 132
            },
            joystick: {
                top: 445,   // Джойстик: на место игрушки   // Было 627, подняли на 20px вверх
                left: 154,   // Джойстик: на место игрушки
                width: 86,
                height: 80
            },
            cartridge: {
                top: 358,   // Картриджи: диагональ 45° +200px   // Было 599, подняли на 100px вверх
                left: 975,   // Картриджи: диагональ 45° +200px
                width: 132,
                height: 104
            },
            console: {
                top: 345,   // Консоль: выше джойстика на 100px   // Консоль: ниже джойстика на 100px   // Консоль: к левому нижнему углу TV +50px   // Было 374, опустили на 50px вниз
                left: 204,   // Консоль: влево на 50px   // Консоль: правее джойстика на 100px   // Консоль: к левому нижнему углу TV +100px
                width: 196,
                height: 72
            }
        },
        
        // Координаты экрана телевизора (относительно tv.png)
        tvScreen: {
            topPercent: 15.8,
            leftPercent: 17.3,
            widthPercent: 79.8,
            heightPercent: 61.1
        }
    };

    // ============================================
    // СОСТОЯНИЕ ПРИЛОЖЕНИЯ
    // ============================================
    
    const state = {
        currentPlatform: null,      // 'youtube' | 'vk' | null
        isVideoLoaded: false,
        toyState: 1,                // 1, 2, или 3
        toyClickTimer: null,
        toyClickCount: 0
    };

    // ============================================
    // DOM ЭЛЕМЕНТЫ
    // ============================================
    
    let elements = {};

    // ============================================
    // ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    function init() {
        cacheElements();
        calculateAreaPercentages();
        renderTV();
        setupEventListeners();
        positionAreas();
        console.log('📺 Ретро-ТВ Лендинг инициализирован');
    }

    /**
     * Кэширование DOM элементов
     */
    function cacheElements() {
        elements = {
            backstageContainer: document.getElementById('backstageContainer'),
            backstageImage: document.getElementById('backstageImage'),
            imgmapContainer: document.getElementById('imgmap202636144235'),
            areaTV: document.querySelector('.area-tv'),
            areaToy: document.querySelector('.area-toy'),
            areaJoystick: document.querySelector('.area-joystick'),
            areaCartridge: document.querySelector('.area-cartridge'),
            areaConsole: document.querySelector('.area-console'),
            toyImage: document.getElementById('toyImage')
        };
    }

    /**
     * Расчёт процентов для адаптивного позиционирования
     */
    function calculateAreaPercentages() {
        // Получаем фактические размеры фонового изображения
        const img = elements.backstageImage;
        const naturalWidth = img.naturalWidth || CONFIG.backdropOriginal.width;
        const naturalHeight = img.naturalHeight || CONFIG.backdropOriginal.height;
        
        // Обновляем оригинальные размеры
        CONFIG.backdropOriginal.width = naturalWidth;
        CONFIG.backdropOriginal.height = naturalHeight;
        
        // Конвертируем координаты областей в проценты
        for (const [areaName, coords] of Object.entries(CONFIG.areas)) {
            coords.topPercent = (coords.top / naturalHeight) * 100;
            coords.leftPercent = (coords.left / naturalWidth) * 100;
            coords.widthPercent = (coords.width / naturalWidth) * 100;
            coords.heightPercent = (coords.height / naturalHeight) * 100;
        }
        
        console.log('📐 Проценты областей рассчитаны:', CONFIG.areas);
    }

    /**
     * Позиционирование областей в процентах
     */
    function positionAreas() {
        const areaConfigs = [
            { element: elements.areaTV, config: CONFIG.areas.tv },
            { element: elements.areaToy, config: CONFIG.areas.toy },
            { element: elements.areaJoystick, config: CONFIG.areas.joystick },
            { element: elements.areaCartridge, config: CONFIG.areas.cartridge },
            { element: elements.areaConsole, config: CONFIG.areas.console }
        ];
        
        areaConfigs.forEach(({ element, config }) => {
            if (element && config) {
                element.style.top = config.topPercent + '%';
                element.style.left = config.leftPercent + '%';
                element.style.width = config.widthPercent + '%';
                element.style.height = config.heightPercent + '%';
                console.log(`📍 ${element.dataset.area}: top=${config.topPercent.toFixed(2)}%, left=${config.leftPercent.toFixed(2)}%`);
            }
        });
    }

    /**
     * Рендеринг телевизора с интерактивными кнопками
     */
    function renderTV() {
        if (!elements.areaTV) return;

        const tvHTML = `
            <div class="tv-wrapper">
                <img src="source/tv.png" alt="Ретро-телевизор" class="tv-image">
                
                <!-- Экран для видео -->
                <div class="tv-screen tv-loading" id="tvScreen">
                    <!-- Эффект шума (золотая рябь) -->
                    <div class="tv-static"></div>
                    <!-- Приветственное сообщение -->
                    <div class="tv-screen-placeholder">
                        <div class="tv-message">
                            <p class="tv-message-title">📺 Выберите удобную Вам платформу</p>
                            <p class="tv-message-subtitle">для просмотра &rarr; кнопки справа</p>
                            <div class="tv-message-hint">
                                <span class="hint-item"><span class="hint-red">🔴</span> Красная кнопка — <strong>YouTube</strong></span>
                                <span class="hint-item"><span class="hint-blue">🔵</span> Синяя кнопка — <strong>VK Video</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Интерактивные кнопки (позиционируются через JS) -->
                <!-- Верхние кнопки — выбор платформы -->
                <button class="tv-btn tv-btn-youtube" data-action="youtube" title="YouTube" id="btnYoutube">
                    <img src="source/redbutton_2.png" alt="YouTube">
                </button>
                <button class="tv-btn tv-btn-vk" data-action="vk" title="VK Video" id="btnVk">
                    <img src="source/bluebutton_2.png" alt="VK Video">
                </button>
                <!-- Нижние кнопки — случайное видео -->
                <button class="tv-btn tv-btn-youtube-alt" data-action="youtube-random" title="Случайное YouTube" id="btnYoutubeAlt">
                    <img src="source/redbutton_2.png" alt="YouTube">
                </button>
                <button class="tv-btn tv-btn-youtube-alt2" data-action="vk-random" title="Случайное VK Video" id="btnYoutubeAlt2">
                    <img src="source/bluebutton_2.png" alt="VK Video">
                </button>
            </div>
        `;

        elements.areaTV.innerHTML = tvHTML;

        // Обновляем кэш элементов после рендеринга
        elements.tvScreen = document.getElementById('tvScreen');
        
        // Позиционируем кнопки после рендеринга
        positionTVButtons();
        
        // Запускаем анимацию загрузки ТВ (3 секунды шума перед показом сообщения)
        setTimeout(() => {
            if (elements.tvScreen) {
                elements.tvScreen.classList.remove('tv-loading');
                elements.tvScreen.classList.add('tv-loaded');
            }
        }, 3000);
    }

    /**
     * Точное позиционирование кнопок телевизора на основе координат
     * tv.png = 767×632 (измерено)
     * ЭТАЛОННЫЕ КООРДИНАТЫ — зафиксированы после точной настройки
     */
    function positionTVButtons() {
        const tvImage = elements.areaTV.querySelector('.tv-image');
        if (!tvImage) return;

        // 🔴 КНОПКА 1: YouTube (верхняя красная) — ГОТОВА
        // 🔵 КНОПКА 2: VK (верхняя синяя) — ГОТОВА
        // 🔴 КНОПКА 3: YouTube (нижняя красная) — ГОТОВА — случайное видео
        // 🔵 КНОПКА 4: VK (нижняя синяя) — ГОТОВА — случайное видео
        // 5-я кнопка удалена
        const buttonCoords = {
            btnYoutube: { x: 679, y: 320, offsetX: -53, offsetY: 0 },
            btnVk: { x: 707, y: 321, offsetX: -56, offsetY: -1 },
            btnYoutubeAlt: { x: 484, y: 519, offsetX: -16, offsetY: 0 },
            btnYoutubeAlt2: { x: 484, y: 549, offsetX: -16, offsetY: 0 }
        };

        const tvWidth = 767;
        const tvHeight = 632;
        const buttonSize = 26;

        for (const [btnId, coords] of Object.entries(buttonCoords)) {
            const btn = document.getElementById(btnId);
            if (!btn) continue;

            const finalX = coords.x + (coords.offsetX || 0);
            const finalY = coords.y + (coords.offsetY || 0);

            const leftPercent = (finalX / tvWidth) * 100;
            const topPercent = (finalY / tvHeight) * 100;

            btn.style.left = leftPercent + '%';
            btn.style.top = topPercent + '%';
            btn.style.width = buttonSize + 'px';
            btn.style.height = buttonSize + 'px';
            btn.style.transform = 'translate(-50%, -50%)';
        }

        console.log('🔘 Кнопки телевизора спозиционированы (эталон)');
    }

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================
    
    function setupEventListeners() {
        // Обработчик для кнопок телевизора (делегирование)
        if (elements.areaTV) {
            elements.areaTV.addEventListener('click', handleTVClick);
        }
        
        // Обработчик для игрушки
        if (elements.areaToy) {
            elements.areaToy.addEventListener('click', handleToyClick);
        }
        
        // Обработчики для статичных областей
        const staticAreas = [
            elements.areaConsole
        ];
        
        staticAreas.forEach(area => {
            if (area) {
                area.addEventListener('click', handleStaticAreaClick);
            }
        });
        
        // Обработчик для картриджа (портфолио)
        if (elements.areaCartridge) {
            elements.areaCartridge.addEventListener('click', handlePortfolioClick);
        }
        
        // Пересчёт при изменении размера окна
        window.addEventListener('resize', debounce(() => {
            positionAreas();
            positionTVButtons(); // Пересчитываем кнопки телевизора
        }, 250));
        
        // Загрузка изображения для расчёта после загрузки
        if (elements.backstageImage.complete) {
            calculateAreaPercentages();
            positionAreas();
        } else {
            elements.backstageImage.addEventListener('load', () => {
                calculateAreaPercentages();
                positionAreas();
            });
        }
    }

    /**
     * Обработка клика по портфолио (картридж)
     */
    function handlePortfolioClick(event) {
        event.preventDefault();
        // Переход на страницу портфолио
        window.location.href = 'portfolio.html';
    }

    /**
     * Обработка кликов по кнопкам телевизора
     */
    function handleTVClick(event) {
        const btn = event.target.closest('.tv-btn');
        if (!btn) return;
        
        const action = btn.dataset.action;
        if (!action) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        switch (action) {
            case 'youtube':
                switchVideo('youtube');
                break;
            case 'vk':
                switchVideo('vk');
                break;
            case 'youtube-random':
                switchVideo('youtube', true); // true = случайное видео
                break;
            case 'vk-random':
                switchVideo('vk', true); // true = случайное видео
                break;
        }
    }

    /**
     * Переключение видео
     * @param {string} platform - 'youtube' или 'vk'
     * @param {boolean} isRandom - true для случайного видео
     */
    function switchVideo(platform, isRandom = false) {
        if (!elements.tvScreen) return;
        
        let embedUrl;
        
        if (isRandom) {
            // Случайное видео из списка
            const randomList = CONFIG.randomVideos[platform];
            if (randomList && randomList.length > 0) {
                const randomId = randomList[Math.floor(Math.random() * randomList.length)];
                embedUrl = buildEmbedUrl(platform, randomId);
            } else {
                embedUrl = CONFIG.videoEmbeds[platform];
            }
        } else {
            // Обычное видео (основное)
            embedUrl = CONFIG.videoEmbeds[platform];
        }
        
        if (!embedUrl) {
            console.error('❌ Платформа не найдена:', platform);
            return;
        }
        
        state.currentPlatform = platform;
        state.isVideoLoaded = true;
        state.isRandom = isRandom;
        
        // Создаём iframe с ленивой загрузкой
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = platform === 'youtube' ? 'YouTube Video' : 'VK Video';
        
        // Очищаем экран и добавляем iframe
        elements.tvScreen.innerHTML = '';
        elements.tvScreen.appendChild(iframe);
        elements.tvScreen.classList.add('active');
        
        console.log('🎬 Видео переключено на:', platform, isRandom ? '(случайное)' : '(основное)');
    }

    /**
     * Построение URL для встраивания видео
     */
    function buildEmbedUrl(platform, videoId) {
        if (platform === 'youtube') {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
        } else if (platform === 'vk') {
            return `https://vk.com/video_ext.php?oid=${videoId}&autoplay=1`;
        }
        return '';
    }

    /**
     * Показать сообщение для заглушки
     */
    function showPlaceholderMessage() {
        if (!elements.tvScreen) return;
        
        elements.tvScreen.innerHTML = `
            <div class="tv-screen-placeholder">
                <p>✨ Скоро...</p>
                <p>Новая функция в разработке</p>
            </div>
        `;
        elements.tvScreen.classList.remove('active');
        
        console.log('ℹ️ Показано сообщение "Скоро..."');
    }

    /**
     * Обработка кликов по игрушке
     */
    function handleToyClick(event) {
        event.preventDefault();
        
        state.toyClickCount++;
        const currentClick = state.toyClickCount;
        
        // Очищаем предыдущий таймер
        if (state.toyClickTimer) {
            clearTimeout(state.toyClickTimer);
        }
        
        // Устанавливаем таймер для определения одинарного/двойного клика
        state.toyClickTimer = setTimeout(() => {
            if (currentClick === 1) {
                // Одинарный клик
                setToyState(2);
                playToySound('singleClick');
                console.log('👆 Одинарный клик по игрушке');
            }
            state.toyClickCount = 0;
        }, 300); // 300мс для определения двойного клика
        
        // Проверка на двойной клик (если второй клик произошёл быстро)
        if (currentClick === 2) {
            clearTimeout(state.toyClickTimer);
            // Двойной клик
            setToyState(3);
            playToySound('doubleClick');
            console.log('👆👆 Двойной клик по игрушке');
            state.toyClickCount = 0;
        }
    }

    /**
     * Установка состояния игрушки
     */
    function setToyState(newState) {
        if (!elements.toyImage) return;
        
        state.toyState = newState;
        
        const imageMap = {
            1: 'source/cipan_1.png',
            2: 'source/cipan_2.png',
            3: 'source/cipan_3.png'
        };
        
        // Плавная смена изображения
        elements.toyImage.style.opacity = '0';
        
        setTimeout(() => {
            elements.toyImage.src = imageMap[newState];
            elements.toyImage.style.opacity = '1';
        }, 150);
    }

    /**
     * Воспроизведение звука игрушки
     */
    function playToySound(soundType) {
        const soundPath = CONFIG.toySounds[soundType];
        if (!soundPath) {
            // Звуки ещё не добавлены — логируем для отладки
            console.log('🔊 Звук будет добавлен позже:', soundType);
            return;
        }
        
        const audio = new Audio(soundPath);
        audio.play().catch(err => {
            console.warn('⚠️ Не удалось воспроизвести звук:', err);
        });
    }

    /**
     * Обработка кликов по статичным областям
     */
    function handleStaticAreaClick(event) {
        event.preventDefault();
        console.log('ℹ️ Клик по статичной области:', event.currentTarget.dataset.area);
    }

    // ============================================
    // УТИЛИТЫ
    // ============================================
    
    /**
     * Debounce функция
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ============================================
    // ЗАПУСК
    // ============================================
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Экспорт функций для отладки в консоли
    window.retroTV = {
        switchVideo,
        setToyState,
        getState: () => ({ ...state }),
        getConfig: () => ({ ...CONFIG })
    };

})();
