# Mechanik Truck

Облачная FMS-система управления автопарком в эстетике macOS + Android-клиент с синхронизацией БД на Amvera.

## Стек

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- REST API (`/api/*`) + хранилище: **PostgreSQL на Amvera** или файловый fallback `/data`
- Android: Kotlin, Jetpack Compose, Room, Retrofit

## Модули MVP (web)

- Обзор, автопарк, **техобслуживание (даты + пробеги)**, водители, путевые листы 4-с
- Сервис / ТО, шины, склад, отчёты Excel/PDF
- Пользователи: админ назначает менеджеру/механику ответственность за **склад, шины, техобслуживание**

## Android-приложение

Каталог [`android/`](./android/README.md):

- Вход, главная, автопарк, водители, настройки URL API
- Offline-first: Room + кнопка «Синхронизация» с Amvera
- По умолчанию API: `https://mechanik-truck-sevagd1978.amvera.io`

Откройте папку `android` в Android Studio → Run.

## API синхронизации

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/health` | Статус хранилища |
| POST | `/api/auth/login` | `{ login, password }` → `{ token, user }` |
| GET | `/api/sync` | Snapshot: vehicles, drivers, users, updatedAt, store |
| POST | `/api/sync` | Push dirty-записей с телефона → snapshot |
| GET/POST/DELETE | `/api/vehicles` | CRUD машин (Bearer) |
| GET/POST/DELETE | `/api/drivers` | CRUD водителей (Bearer) |

Без `DATABASE_URL` API пишет в файл `/data/mechanik-db.json` (в Docker).  
С `DATABASE_URL` — в **PostgreSQL Amvera**.

## Роли и демо-входы

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Администратор |
| `manager` | `manager123` | Менеджер |
| `mechanic` | `mechanic123` | Механик |

## Запуск web локально

```bash
npm install
npm run dev
```

API: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Деплой на Amvera (web + API)

1. Проект Docker, ветка `cursor/macos-fms-app-ea6d` (или актуальная с API)
2. `Dockerfile` + `amvera.yaml` (порт 3000)
3. После сборки: `https://<проект>.amvera.io`

### PostgreSQL (рекомендуется для продакшена)

1. В Amvera создайте **PostgreSQL** (отдельный проект)
2. Возьмите host чтения/записи: `amvera-<user>-cnpg-<db-project>-rw`
3. В проекте приложения (Переменные / секреты) задайте:

```text
DATABASE_URL=postgresql://USER:PASSWORD@amvera-USER-cnpg-DBPROJECT-rw:5432/DBNAME
```

Опционально: `DATABASE_SSL=0` для внутренней сети без SSL.

4. Перезапустите контейнер приложения — `/api/health` покажет `"store":"postgres"`.

## Скрипты

- `npm run dev` — разработка
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint
