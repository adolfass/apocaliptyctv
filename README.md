#  Ретро-ТВ Лендинг

Интерактивный одностраничный лендинг с ретро-телевизором в стиле Fallout.

## 🎯 Особенности

- **Интерактивный телевизор** с кнопками выбора платформы
- **Поддержка YouTube и VK Video**
- **Случайные видео** по нажатию на нижние кнопки
- **Адаптивная вёрстка** (Mobile First)
- **Ретро-стилистика** с пастельной цветовой гаммой

## 🚀 Быстрый старт

1. Откройте `index.html` в браузере или запустите локальный сервер:

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080

# Node.js (требуется http-server)
npx http-server -p 8080
```

2. Перейдите по адресу http://localhost:8080

## ⚙️ Настройка

### Видео

Отредактируйте `scripts.js`, раздел `CONFIG`:

```javascript
const CONFIG = {
    // Основное видео
    videoEmbeds: {
        youtube: 'https://www.youtube.com/embed/VIDEO_ID',
        vk: 'https://vk.com/video_ext.php?oid=OID&id=ID'
    },
    
    // Список для случайных видео
    randomVideos: {
        youtube: ['VIDEO_ID_1', 'VIDEO_ID_2', 'VIDEO_ID_3'],
        vk: ['OID_ID_1', 'OID_ID_2']
    }
};
```

### Звуки игрушки

```javascript
toySounds: {
    singleClick: 'source/sound1.mp3',
    doubleClick: 'source/sound2.mp3'
}
```

## 📁 Структура проекта

```
project/landing/
├── index.html          # Основная разметка
├── styles.css          # Стили
├── scripts.js          # Логика
├── .gitignore          # Игнорируемые файлы
├── README.md           # Документация
└── source/             # Графические ресурсы
    ├── backstage.jpeg  # Фон
    ├── tv.png          # Телевизор
    ├── cipan_*.png     # Игрушка (3 состояния)
    ├── redbutton_2.png # Красная кнопка
    ├── bluebutton_2.png# Синяя кнопка
    ├── djoystick.png   # Джойстик
    ├── catridge.png    # Картридж
    └── console.png     # Приставка
```

## 🎮 Управление

| Кнопка | Действие |
| :--- | :--- |
| 🔴 Красная (верхняя) | Основное видео YouTube |
| 🔵 Синяя (верхняя) | Основное видео VK Video |
| 🔴 Красная (нижняя) | Случайное видео YouTube |
| 🔵 Синяя (нижняя) | Случайное видео VK Video |
| 🧸 Игрушка (клик) | Смена состояния (1→2) |
| 🧸 Игрушка (двойной клик) | Смена состояния (→3) |

## 🛠 Технологии

- HTML5
- CSS3 (Flexbox, CSS Variables)
- Vanilla JavaScript (ES6+)

## 📱 Совместимость

- ✅ Chrome/Edge (последние версии)
- ✅ Firefox
- ✅ Safari
- ✅ Мобильные браузеры

## 📝 Лицензия

MIT
