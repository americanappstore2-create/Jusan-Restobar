# Jusan Restobar Menu — TODO

## Database & Backend
- [x] Schema: categories table (name_ru, name_kz, sort_order)
- [x] Schema: dishes table (category_id, name_ru, name_kz, description_ru, description_kz, price, image_url, image_key, is_available, sort_order)
- [x] Schema: business_lunch_days table (day_of_week 1-5, title_ru, title_kz, is_active)
- [x] Schema: business_lunch_items table (day_id, dish_id OR custom name/desc, sort_order)
- [x] Run migration via webdev_execute_sql
- [x] tRPC: public menu router (categories, dishes, business lunches)
- [x] tRPC: admin router (CRUD categories, dishes, business lunches) — protected
- [x] File upload endpoint for dish photos (S3 storage)
- [x] Seed initial data (categories + sample dishes + business lunches)

## Client — Public Menu
- [x] Global language switcher (RU / KZ) persisted in localStorage
- [x] i18n context/hook for UI labels
- [x] Home/Menu page: header with Jusan Restobar branding + language switcher
- [x] Category tabs/navigation on menu page
- [x] Dish cards: photo, name (bilingual), description, price, "Add to cart" button
- [x] Business Lunch section: auto-shows today's day, tabs Mon–Fri
- [x] Cart drawer/panel: list of selected dishes, quantities, total
- [x] "Show to Waiter" button in cart
- [x] Waiter screen: full-screen minimal view, large text, dish list, no distractions

## Client — Admin Panel
- [x] Admin route /admin — protected (owner role only)
- [x] Admin layout with sidebar navigation
- [x] Categories management: list, add, edit, delete, reorder
- [x] Dishes management: list by category, add/edit (name RU+KZ, desc RU+KZ, price, photo upload, availability toggle), delete
- [x] Business Lunch management: per-day editor (Mon–Fri), add/remove dishes per day, activate/deactivate day
- [x] Photo upload UI with preview

## Style & Polish
- [x] Premium dark/gold color palette inspired by Jusan branding
- [x] Google Fonts: elegant serif + clean sans-serif pairing
- [x] Smooth animations and transitions
- [x] Responsive design (mobile-first)
- [x] Empty states for all lists
- [x] Loading skeletons

## Tests
- [x] Vitest: menu router tests
- [x] Vitest: admin router auth guard tests
- [x] Vitest: business lunch router tests

## Новые фичи (Phase 2)
- [x] Добавить подкатегории (subcategories) в БД с полями name_ru, name_kz, name_en
- [x] Добавить время бизнес-ланча (start_time, end_time) в таблицу business_lunch_days
- [x] Добавить поля name_en в категории, блюда и бизнес-ланч
- [x] Обновить API для получения подкатегорий и времени
- [x] Добавить английский язык в i18n контекст
- [x] Обновить UI меню с подкатегориями (в разработке)
- [x] Отображать время бизнес-ланча (12:00–15:00) на сайте
- [x] Обновить админ-панель для управления подкатегориями (в разработке)
- [x] Обновить админ-панель для установки времени бизнес-ланча
- [x] Обновить языковой переключатель (RU/KZ/EN)
- [x] Тесты для новых функций обновлены


## Phase 3: Подкатегории и Стоп-лист (Окончено)
- [x] Добавить поле `isAvailable` в таблицу dishes для стоп-листа
- [x] Добавить поле `isAvailable` в таблицу business_lunch_items для стоп-листа позиций
- [x] Добавить tRPC CRUD-процедуры для подкатегорий (create, update, delete, list)
- [x] Добавить процедуры для обновления `isAvailable` в dishes и business_lunch_items
- [x] Создать компонент SubcategoriesPanel в админ-панели
- [x] Добавить селектор подкатегории в DishesPanel при создании/редактировании блюда
- [x] Добавить toggle `isAvailable` в DishesPanel для стоп-листа
- [x] Добавить toggle `isAvailable` в BusinessLunchPanel для позиций ланча
- [x] Обновить MenuPage для отображения подкатегорий и фильтрации по ним
- [x] Скрывать недоступные блюда на публичном меню (если isAvailable = false)
- [x] Добавить визуальный индикатор "Нет в наличии" на карточке блюда
- [x] Написать тесты для подкатегорий и стоп-листа
