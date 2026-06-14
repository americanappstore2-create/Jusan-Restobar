# Деплой на Fly.io — пошаговая инструкция

## Что нужно заранее

1. Аккаунт на [fly.io](https://fly.io) (нужна карта, но списаний нет на free tier)
2. Аккаунт на [PlanetScale](https://planetscale.com) — бесплатная MySQL БД
3. Аккаунт на [Cloudflare R2](https://cloudflare.com) или AWS S3 — для фото блюд

---

## Шаг 1 — Установить flyctl

**macOS / Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows:**
```powershell
pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Войти в аккаунт:
```bash
fly auth login
```

---

## Шаг 2 — Создать MySQL БД на PlanetScale

1. Зарегистрируйтесь на [planetscale.com](https://planetscale.com)
2. Создайте новую базу данных (например `jusan-menu`)
3. Выберите регион `aws-eu-central-1` (ближе к Казахстану)
4. Перейдите в **Connect** → выберите **Prisma** или **General**
5. Скопируйте строку подключения вида:
   ```
   mysql://username:password@host/dbname?ssl={"rejectUnauthorized":true}
   ```

---

## Шаг 3 — Настроить хранилище для фото (Cloudflare R2 — бесплатно)

1. В Cloudflare Dashboard → R2 → Create bucket (`jusan-images`)
2. Создайте API Token с правами на бакет
3. Запомните: Account ID, Access Key ID, Secret Access Key
4. Endpoint будет: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

---

## Шаг 4 — Создать приложение на Fly.io

В папке проекта:

```bash
# Создать приложение (не запускать деплой сразу!)
fly launch --no-deploy

# Задать название — например jusan-restobar-menu
```

---

## Шаг 5 — Установить секреты (переменные окружения)

```bash
fly secrets set \
  DATABASE_URL="mysql://user:pass@host/dbname?ssl={\"rejectUnauthorized\":true}" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  ADMIN_USERNAME="admin" \
  ADMIN_PASSWORD="ваш-надёжный-пароль" \
  AWS_ACCESS_KEY_ID="ключ-от-R2-или-S3" \
  AWS_SECRET_ACCESS_KEY="секрет-от-R2-или-S3" \
  AWS_REGION="auto" \
  AWS_S3_BUCKET="jusan-images"
```

> **Для Cloudflare R2** добавьте также:
> ```bash
> fly secrets set AWS_ENDPOINT_URL="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
> ```

---

## Шаг 6 — Накатить миграции БД

```bash
# Локально, указав DATABASE_URL из PlanetScale
DATABASE_URL="mysql://..." pnpm db:push
```

---

## Шаг 7 — Деплой!

```bash
fly deploy
```

После деплоя приложение будет доступно по адресу:
```
https://jusan-restobar-menu.fly.dev
```

---

## Полезные команды

```bash
fly logs          # Смотреть логи в реальном времени
fly status        # Статус приложения
fly ssh console   # SSH в контейнер
fly open          # Открыть сайт в браузере
```

---

## Обновление приложения

После изменений в коде:
```bash
git push  # если настроен GitHub Actions
# или вручную:
fly deploy
```
