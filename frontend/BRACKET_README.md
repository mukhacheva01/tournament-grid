# Современная турнирная сетка Double Elimination

## Обзор

Это полностью переписанная система турнирной сетки Double Elimination с современным дизайном, адаптивностью и богатой интерактивностью. Система состоит из трех основных компонентов:

- **BracketEngine** - Логический движок турнира
- **BracketRenderer** - Система отображения и взаимодействия
- **BracketIntegration** - Интеграция с существующим кодом

## Основные возможности

### 🎨 Современный дизайн
- Градиентные фоны и современная типографика
- Анимации и переходы
- Адаптивный дизайн для всех устройств
- Темная и светлая темы
- Высокая контрастность для доступности

### 🏆 Полная функциональность Double Elimination
- Winners Bracket (сетка победителей)
- Losers Bracket (сетка проигравших)
- Grand Final (финальный матч)
- Автоматическое управление BYE матчами
- Валидация и проверка целостности турнира

### 📱 Адаптивность
- Полная поддержка мобильных устройств
- Компактный режим для маленьких экранов
- Горизонтальная прокрутка для больших турниров
- Оптимизированные элементы управления

### 🎯 Интерактивность
- Подсветка связанных матчей при наведении
- Анимации завершения матчей
- Празднование победы чемпиона
- Уведомления о действиях
- Экспорт данных турнира

## Структура файлов

```
frontend/
├── bracket-engine.js      # Логический движок турнира
├── bracket-renderer.js    # Система отображения
├── bracket-styles.css     # Стили для турнирной сетки
├── bracket-integration.js # Интеграция с существующим кодом
├── demo.html             # Демонстрационная страница
└── BRACKET_README.md     # Эта документация
```

## Быстрый старт

### 1. Подключение файлов

```html
<!-- CSS -->
<link rel="stylesheet" href="bracket-styles.css">

<!-- JavaScript -->
<script src="bracket-engine.js"></script>
<script src="bracket-renderer.js"></script>
<script src="bracket-integration.js"></script>
```

### 2. Создание турнира

```javascript
// Создание команд
const teams = [
    { id: 'team1', name: 'Команда 1', seed: 1 },
    { id: 'team2', name: 'Команда 2', seed: 2 },
    { id: 'team3', name: 'Команда 3', seed: 3 },
    { id: 'team4', name: 'Команда 4', seed: 4 }
];

// Инициализация движка и рендерера
const engine = new BracketEngine();
const container = document.getElementById('bracket-container');
const renderer = new BracketRenderer(container);

// Создание и отображение турнира
const bracket = engine.createBracket(teams);
renderer.render(engine);
```

### 3. Управление матчами

```javascript
// Установка победителя матча
engine.setMatchWinner('match_id', 'team_id');

// Проверка завершения турнира
if (engine.isComplete()) {
    const champion = engine.getChampion();
    console.log('Чемпион:', champion.name);
}
```

## API Reference

### BracketEngine

#### Методы создания турнира

```javascript
// Создание турнира
createBracket(teams: Team[]): Bracket

// Валидация команд
validateTeams(teams: Team[]): boolean

// Расчет структуры турнира
calculateStructure(teamCount: number): Structure
```

#### Методы управления матчами

```javascript
// Установка победителя
setMatchWinner(matchId: string, teamId: string): Result

// Получение матча по ID
getMatchById(matchId: string): Match

// Получение всех матчей
getAllMatches(): Match[]

// Получение завершенных матчей
getCompletedMatches(): Match[]
```

#### Методы состояния турнира

```javascript
// Проверка завершения
isComplete(): boolean

// Получение чемпиона
getChampion(): Team

// Получение второго места
getRunnerUp(): Team

// Получение данных турнира
getBracketData(): BracketData
```

### BracketRenderer

#### Конструктор

```javascript
new BracketRenderer(container: HTMLElement, options?: RendererOptions)
```

#### Опции рендерера

```javascript
interface RendererOptions {
    theme: 'modern' | 'dark';           // Тема оформления
    animations: boolean;                 // Включить анимации
    responsive: boolean;                 // Адаптивный дизайн
    showConnections: boolean;            // Показывать связи между матчами
    compactMode: boolean;               // Компактный режим
}
```

#### Методы отображения

```javascript
// Отображение турнира
render(engine: BracketEngine): void

// Обновление матча
updateMatchDisplay(match: Match): void

// Обновление связанных матчей
updateConnectedMatches(match: Match): void

// Показ уведомления
showNotification(message: string, type: string): void
```

## Типы данных

### Team (Команда)

```javascript
interface Team {
    id: string;          // Уникальный идентификатор
    name: string;        // Название команды
    seed?: number;       // Посев (рейтинг)
    score?: number;      // Очки в текущем матче
}
```

### Match (Матч)

```javascript
interface Match {
    id: string;              // Уникальный идентификатор
    team1?: Team;            // Первая команда
    team2?: Team;            // Вторая команда
    winner?: Team;           // Победитель
    status: MatchStatus;     // Статус матча
    isBye: boolean;          // Проход без игры
    completed: boolean;      // Завершен ли матч
    nextMatchId?: string;    // ID следующего матча для победителя
    loserNextMatchId?: string; // ID следующего матча для проигравшего
}
```

### MatchStatus (Статус матча)

```javascript
type MatchStatus = 'pending' | 'ready' | 'in-progress' | 'completed';
```

## Стилизация

### CSS переменные

Система использует CSS переменные для легкой кастомизации:

```css
:root {
    --primary-color: #667eea;      /* Основной цвет */
    --secondary-color: #764ba2;    /* Вторичный цвет */
    --accent-color: #f093fb;       /* Акцентный цвет */
    --success-color: #4ecdc4;      /* Цвет успеха */
    --warning-color: #feca57;      /* Цвет предупреждения */
    --error-color: #ff6b6b;        /* Цвет ошибки */
    --border-radius: 12px;         /* Радиус скругления */
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Переходы */
}
```

### Основные классы

- `.bracket-renderer` - Основной контейнер
- `.bracket-match` - Матч
- `.match-team` - Команда в матче
- `.winner` - Класс для победившей команды
- `.completed` - Класс для завершенного матча
- `.ready` - Класс для готового к игре матча
- `.pending` - Класс для ожидающего матча

## Анимации

Система включает множество анимаций:

- `matchFadeIn` - Появление матчей
- `winnerGlow` - Подсветка победителя
- `crownShine` - Анимация короны
- `progressShine` - Анимация прогресса
- `confettiFall` - Падающее конфетти

### Отключение анимаций

```javascript
// При создании рендерера
const renderer = new BracketRenderer(container, {
    animations: false
});

// Или динамически
renderer.container.classList.add('no-animations');
```

## Адаптивность

Система автоматически адаптируется к размеру экрана:

- **Desktop (>1200px)** - Полный режим с горизонтальной прокруткой
- **Tablet (768px-1200px)** - Средний режим с оптимизированными размерами
- **Mobile (<768px)** - Компактный режим с вертикальной компоновкой

### Медиа-запросы

```css
@media (max-width: 1200px) { /* Планшеты */ }
@media (max-width: 768px) { /* Мобильные */ }
@media (max-width: 480px) { /* Маленькие мобильные */ }
```

## Интеграция с существующим кодом

Файл `bracket-integration.js` обеспечивает совместимость:

```javascript
// Автоматическое переопределение старых функций
window.createDoubleEliminationBracket = createModernDoubleEliminationBracket;
window.renderDoubleEliminationBracket = renderModernDoubleEliminationBracket;
window.setDoubleEliminationMatchWinner = setModernMatchWinner;
```

### Проверка активности

```javascript
if (isModernBracketActive) {
    // Используем новую систему
} else {
    // Fallback на старую систему
}
```

## Демонстрация

Откройте `demo.html` для интерактивной демонстрации всех возможностей:

- Создание турниров разного размера
- Симуляция случайных результатов
- Переключение тем и настроек
- Экспорт данных

### Горячие клавиши в демо

- `Ctrl+1` - Турнир на 4 команды
- `Ctrl+2` - Турнир на 8 команд
- `Ctrl+3` - Турнир на 16 команд
- `Ctrl+R` - Случайный результат
- `Ctrl+Backspace` - Сброс турнира

## Производительность

### Оптимизации

- Виртуализация больших турниров
- Ленивая загрузка анимаций
- Оптимизированные DOM операции
- Кэширование элементов

### Рекомендации

- Используйте `ResizeObserver` для адаптивности
- Отключайте анимации на слабых устройствах
- Ограничивайте количество одновременных анимаций

## Доступность

### Поддерживаемые функции

- Высокая контрастность
- Уменьшенная анимация (`prefers-reduced-motion`)
- Клавиатурная навигация
- ARIA атрибуты
- Семантическая разметка

### Настройка для доступности

```css
@media (prefers-contrast: high) {
    /* Высокая контрастность */
}

@media (prefers-reduced-motion: reduce) {
    /* Уменьшенная анимация */
}
```

## Браузерная совместимость

### Поддерживаемые браузеры

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Необходимые функции

- CSS Grid и Flexbox
- CSS Custom Properties
- ResizeObserver
- IntersectionObserver
- ES6+ (классы, стрелочные функции)

## Устранение неполадок

### Частые проблемы

1. **Сетка не отображается**
   - Проверьте подключение всех файлов
   - Убедитесь в правильном порядке загрузки скриптов

2. **Анимации не работают**
   - Проверьте поддержку CSS анимаций
   - Убедитесь, что не включен режим `no-animations`

3. **Проблемы на мобильных**
   - Проверьте viewport meta тег
   - Убедитесь в корректной работе touch событий

### Отладка

```javascript
// Включение подробного логирования
window.BRACKET_DEBUG = true;

// Проверка состояния
console.log('Engine:', modernBracketEngine);
console.log('Renderer:', modernBracketRenderer);
console.log('Active:', isModernBracketActive);
```

## Расширение функциональности

### Добавление новых тем

```css
.bracket-renderer.custom-theme {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* ... другие переменные */
}
```

### Кастомные анимации

```css
@keyframes customAnimation {
    from { /* начальное состояние */ }
    to { /* конечное состояние */ }
}

.custom-element {
    animation: customAnimation 0.5s ease-out;
}
```

### Расширение движка

```javascript
class CustomBracketEngine extends BracketEngine {
    customMethod() {
        // Ваша логика
    }
}
```

## Лицензия

Этот код является частью проекта турнирной системы и может использоваться в соответствии с лицензией проекта.

## Поддержка

Для получения поддержки или сообщения об ошибках, пожалуйста, создайте issue в репозитории проекта.

---

*Документация обновлена: 2025*