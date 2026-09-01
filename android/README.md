# Mechanik Truck FMS — Android

Мобильное приложение для управления автопарком и водителями с offline-first синхронизацией через REST API.

## Стек

- Kotlin, Jetpack Compose, Material 3
- Room (локальная БД)
- Retrofit 2.11 + OkHttp + Gson
- DataStore Preferences (токен, настройки)
- Navigation Compose

## Конфигурация

| Параметр | Значение |
|----------|----------|
| Package / ApplicationId | `ru.mechaniktruck.app` |
| minSdk | 26 |
| targetSdk / compileSdk | 35 |
| Default API URL | `https://mechanik-truck-sevagd1978.amvera.io` |

URL API можно изменить в экране «Настройки».

## Сборка

```bash
cd android
./gradlew assembleDebug
```

APK: `app/build/outputs/apk/debug/app-debug.apk`

## Функции

1. **Вход** — `POST /api/auth/login` (логин/пароль), токен сохраняется в DataStore
2. **Главная** — счётчики автомобилей и водителей, кнопка синхронизации, время последней синхронизации
3. **Автопарк** — госномер, модель, прошлое/плановое ТО с заметками
4. **Водители** — ФИО, телефон, статус, водительское удостоверение
5. **Синхронизация (pull)** — `GET /api/sync`, замена данных в Room
6. **Синхронизация (push)** — `POST /api/sync` с локальными dirty-записями (если есть)

## API

- `POST /api/auth/login` — `{ "login", "password" }` → `{ "token", "user" }`
- `GET /api/sync` — Bearer token → snapshot `{ vehicles, drivers, updatedAt, store }`
- `POST /api/sync` — Bearer token, body с изменениями → snapshot

## Структура проекта

```
app/src/main/java/ru/mechaniktruck/app/
├── MechanikApp.kt          # Application, DI-контейнер
├── MainActivity.kt         # NavHost
├── data/
│   ├── api/                # Retrofit, модели, interceptor
│   ├── datastore/          # PreferencesManager
│   ├── local/              # Room DB, entities, DAOs
│   └── repository/         # AuthRepository, SyncRepository
└── ui/
    ├── theme/              # Цвета (teal/steel industrial)
    ├── navigation/         # NavGraph, Routes
    ├── screens/            # Login, Home, Fleet, Drivers, Settings
    ├── viewmodel/          # ViewModels
    └── util/               # Форматирование
```

## Тема

Светлая тема по умолчанию, промышленная палитра: глубокий бирюзовый / стальной серый.
