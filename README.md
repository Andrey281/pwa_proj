# Gogo Пицца - PWA приложение

PWA приложение для заказа пиццы, кофе, коктейлей и десертов.

## Технологии

- React 19
- Vite
- Tailwind CSS
- PWA (Service Worker, Web App Manifest)

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Просмотр production сборки
npm run preview
```

## Docker

### Быстрый старт

```bash
# Сборка и запуск через docker-compose
docker-compose up --build

# Приложение будет доступно на http://localhost:8080
```

### Ручная сборка

```bash
# Сборка образа
docker build -t gogo-pizza .

# Запуск контейнера
docker run -d -p 8080:80 --name gogo-pizza-app gogo-pizza

# Остановка контейнера
docker stop gogo-pizza-app

# Удаление контейнера
docker rm gogo-pizza-app
```

### Docker команды

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка без кэша
docker-compose build --no-cache

# Остановка и удаление контейнеров
docker-compose down -v
```

## PWA функционал

- ✅ Офлайн работа
- ✅ Установка как приложение
- ✅ Push-уведомления
- ✅ Кэширование ресурсов
- ✅ Быстрая загрузка

Подробнее см. `SERVICE_WORKER_EXPLAINED.md`
