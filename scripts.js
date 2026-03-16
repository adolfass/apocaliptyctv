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
            rutube: 'https://rutube.ru/play/embed/b55abbdf26b45e3cb0a7ebf8e8236bc0?autoplay=1',
            vk: 'https://vk.com/video_ext.php?oid=-236702596&id=456239017&autoplay=1'
        },

        // Списки видео ID для случайного выбора по категориям
        randomVideos: {
            // 🔴 Природа, релаксация, музыка
            nature: [
                'Lx8t0N6sCao',  // Красивые места планеты
                'eKFTSSKCzWA',  // Природа и музыка
                'UqR9qJqS0hE',  // Релаксация 4K
                'tO01O-MjgYU',  // Лес и дождь
                '1ZYbU82GVz4',  // Океан релакс
                'n_Dv4JccfEA',   // Горы и музыка
                'GpKnL08a8a4'   // Закат релаксация
            ],
            // 🔵 Ядерная тематика, ИИ, выживание
            nuclear_ai_survival: [
                'dQw4w9WgXcQ',  // Пропаганда/ИИ (заменить на актуальные)
                '9bZkp7q19f0',  // Искусственный интеллект
                'kJQP7kiw5Fk',  // Выживание в природе
                'hY7M5s_W0Zc',  // Ядерная тема
                'ZZ5LpwO-An4',  // ИИ документалка
                'L_jWHffIx5E',  // Выживание леса
                'fJ9rUzIMcZQ'   // Постапокалипсис
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
        setupModalListeners();
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
                                <span class="hint-item"><span class="hint-red">🔴</span> Верхняя кнопка — <strong>RuTube</strong></span>
                                <span class="hint-item"><span class="hint-blue">🔵</span> Верхняя кнопка — <strong>VK Video</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Интерактивные кнопки (позиционируются через JS) -->
                <!-- Верхние кнопки — выбор платформы -->
                <button class="tv-btn tv-btn-rutube" data-action="rutube" title="RuTube" id="btnRutube">
                    <img src="source/redbutton_2.png" alt="RuTube">
                </button>
                <button class="tv-btn tv-btn-vk" data-action="vk" title="VK Video" id="btnVk">
                    <img src="source/bluebutton_2.png" alt="VK Video">
                </button>
                <!-- Нижние кнопки — случайное видео по темам -->
                <button class="tv-btn tv-btn-nature" data-action="nature-random" title="Природа и релаксация" id="btnNature">
                    <img src="source/redbutton_2.png" alt="Природа">
                </button>
                <button class="tv-btn tv-btn-nuclear" data-action="nuclear-random" title="Ядерная тема, ИИ, выживание" id="btnNuclear">
                    <img src="source/bluebutton_2.png" alt="Ядерная тема">
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

        // 🔴 КНОПКА 1: RuTube (верхняя красная) — ГОТОВА
        // 🔵 КНОПКА 2: VK (верхняя синяя) — ГОТОВА
        // 🔴 КНОПКА 3: Природа (нижняя красная) — ГОТОВА — случайное видео
        // 🔵 КНОПКА 4: Ядерная/ИИ (нижняя синяя) — ГОТОВА — случайное видео
        // 5-я кнопка удалена
        const buttonCoords = {
            btnRutube: { x: 680, y: 320, offsetX: -52, offsetY: 0 },
            btnVk: { x: 707, y: 321, offsetX: -57, offsetY: -1 },
            btnNature: { x: 484, y: 519, offsetX: -17, offsetY: 0 },
            btnNuclear: { x: 484, y: 549, offsetX: -17, offsetY: 0 }
        };

        const tvWidth = 767;
        const tvHeight = 632;
        // Размер кнопок: 27px для десктопа, 26px для мобильных
        const buttonSize = window.innerWidth > 768 ? 27 : 26;

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
            case 'rutube':
                switchVideo('rutube');
                break;
            case 'vk':
                switchVideo('vk');
                break;
            case 'nature-random':
                switchVideo('nature');
                break;
            case 'nuclear-random':
                switchVideo('nuclear_ai_survival');
                break;
        }
    }

    /**
     * Переключение видео
     * @param {string} platform - 'rutube', 'vk', 'nature', 'nuclear_ai_survival'
     */
    function switchVideo(platform) {
        if (!elements.tvScreen) return;

        let embedUrl;

        // Проверяем, есть ли список случайных видео для этой категории
        const randomList = CONFIG.randomVideos[platform];
        
        if (randomList && randomList.length > 0) {
            // Случайное видео из списка
            const randomId = randomList[Math.floor(Math.random() * randomList.length)];
            embedUrl = buildEmbedUrl(platform, randomId);
            state.isRandom = true;
        } else {
            // Обычное видео (основное)
            embedUrl = CONFIG.videoEmbeds[platform];
            state.isRandom = false;
        }

        if (!embedUrl) {
            console.error('❌ Платформа не найдена:', platform);
            return;
        }

        state.currentPlatform = platform;
        state.isVideoLoaded = true;

        // Создаём iframe с ленивой загрузкой
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.title = 'Video';

        // Очищаем экран и добавляем iframe
        elements.tvScreen.innerHTML = '';
        elements.tvScreen.appendChild(iframe);
        elements.tvScreen.classList.add('active');

        console.log('🎬 Видео переключено на:', platform, state.isRandom ? '(случайное)' : '(основное)');
    }

    /**
     * Построение URL для встраивания видео
     */
    function buildEmbedUrl(platform, videoId) {
        if (platform === 'youtube' || platform === 'nature' || platform === 'nuclear_ai_survival') {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
        } else if (platform === 'vk') {
            return `https://vk.com/video_ext.php?oid=${videoId}&autoplay=1`;
        } else if (platform === 'rutube') {
            return `https://rutube.ru/play/embed/${videoId}?autoplay=1`;
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
        
        if (state.toyClickTimer) {
            clearTimeout(state.toyClickTimer);
        }
        
        const toyElement = elements.toyImage;
        
        state.toyClickTimer = setTimeout(() => {
            if (currentClick === 1) {
                console.log("🐔 Одинарный клик");
                const audio = new Audio("source/ku.mp3");
                audio.play();
                toyElement.classList.remove("toy-spiral", "toy-return");
                void toyElement.offsetWidth;
                toyElement.classList.add("toy-spiral");
            }
            state.toyClickCount = 0;
        }, 300);
        
        if (currentClick === 2) {
            clearTimeout(state.toyClickTimer);
            console.log("🐔🐔 Двойной клик");
            const audio = new Audio("source/kukareku.mp3");
            audio.play();
            toyElement.classList.remove("toy-spiral", "toy-return");
            void toyElement.offsetWidth;
            toyElement.classList.add("toy-return");
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
    // МОДАЛЬНОЕ ОКНО "УСЛОВИЯ"
    // ============================================

    /**
     * Открытие модального окна
     */
    function openModal() {
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
            console.log('📋 Модальное окно открыто');
        }
    }

    /**
     * Закрытие модального окна
     */
    function closeModal() {
        const modal = document.getElementById('termsModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Возвращаем прокрутку
            console.log('📋 Модальное окно закрыто');
        }
    }

    /**
     * Настройка обработчиков модального окна
     */
    function setupModalListeners() {
        // Кнопка "Условия" в футере
        const termsBtn = document.querySelector('.btn-terms');
        if (termsBtn) {
            termsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        // Кнопка закрытия
        const closeBtn = document.getElementById('modalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Закрытие по клику вне окна
        const modalOverlay = document.getElementById('termsModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });
        }

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
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
