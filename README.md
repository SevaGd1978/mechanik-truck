# Mechanik Truck

Облачная FMS-система управления автопарком в эстетике macOS.

## Стек

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Lucide icons
- Клиентские демо-данные (без бэкенда)

## Модули MVP

- Обзор (KPI, лента событий)
- Автопарк (машины и прицепы: добавление, удаление)
- Сервис / ТО (заказ-наряды: нормо-часы, ставка, списание запчастей)
- Склад (номенклатура запчастей с ценой)
- Отчёты (Excel / PDF)
- Пользователи (логин/пароль, роли)
- Настройки (тема, тарифы)
- ⌘K command palette
- Light / Dark mode

## Роли и демо-входы

| Логин | Пароль | Роль |
|-------|--------|------|
| `admin` | `admin123` | Администратор |
| `manager` | `manager123` | Менеджер |
| `mechanic` | `mechanic123` | Механик |

Админ и менеджер могут добавлять пользователей. Менеджер не может создавать/менять администраторов. Механик видит сервис, склад и автопарк.

## Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Страница входа: [/login](http://localhost:3000/login).

## Деплой на Amvera

В репозитории уже есть `Dockerfile` и `amvera.yaml` (порт 3000).

1. Зарегистрируйтесь на [amvera.ru](https://amvera.ru)
2. Создайте проект → подключите этот GitHub-репозиторий / ветку `cursor/macos-fms-app-ea6d`
3. Тип окружения: **Docker** (подхватит `Dockerfile` + `amvera.yaml`)
4. Запустите сборку — после успеха откроется URL вида `*.amvera.io`

Локальная проверка образа:

```bash
docker build -t mechanik-truck .
docker run --rm -p 3000:3000 mechanik-truck
```

## Скрипты

- `npm run dev` — разработка
- `npm run build` — production-сборка
- `npm run start` — запуск production
- `npm run lint` — ESLint
