# Amvera + Android sync

## Что уже есть в репозитории

1. **Web/API** (этот репозиторий) — Next.js + `/api/sync`, `/api/auth/login`, …
2. **Android** — `android/` (Compose + Room), тянет данные с Amvera
3. **Хранилище**
   - без настроек: файл `/data/mechanik-db.json` в контейнере
   - с `DATABASE_URL`: PostgreSQL Amvera

## Быстрый старт Android

1. Дождитесь деплоя API на Amvera (ветка с `/api`)
2. Проверьте: `https://mechanik-truck-sevagd1978.amvera.io/api/health`
3. Android Studio → Open `android/` → Run на эмуляторе/телефоне
4. Логин `admin` / `admin123` → «Синхронизация»

## Подключение PostgreSQL на Amvera

1. Создайте БД PostgreSQL в кабинете Amvera
2. В проекте `mechanik-truck` добавьте секрет/переменную `DATABASE_URL`
3. Перезапустите приложение
4. Health: `"store":"postgres"`, `"postgresConfigured":true`

Формат URL:

```text
postgresql://<user>:<password>@amvera-<amvera-user>-cnpg-<db-project>-rw:5432/<dbname>
```

После этого web API и Android пишут/читают одну облачную БД.
