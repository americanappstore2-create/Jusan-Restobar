import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ShoppingCart, X, Plus, Minus, ChevronRight, UtensilsCrossed } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Day helpers ──────────────────────────────────────────────────────────────
const DAY_NAMES_RU = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
const DAY_NAMES_KZ = ["", "Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма"];
const DAY_NAMES_EN = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function getTodayDow(): number {
  const d = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  if (d === 0 || d === 6) return 1; // weekend → show Monday
  return d;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ cartCount, onCartOpen }: { cartCount: number; onCartOpen: () => void }) {
  const { t } = useLanguage();
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-5 h-5 text-gold" />
          <div>
            <span className="font-display text-xl font-semibold text-gold tracking-wide">Jusan</span>
            <span className="font-body text-xs text-muted-foreground ml-1 tracking-widest uppercase">restobar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            onClick={onCartOpen}
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors btn-press"
          >
            <ShoppingCart className="w-5 h-5 text-gold" />
            <span className="font-body text-sm text-foreground hidden sm:block">
              {t("Корзина", "Себет", "Cart")}
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-background text-xs font-bold flex items-center justify-center font-body">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Dish Card ────────────────────────────────────────────────────────────────
function DishCard({ dish }: { dish: any }) {
  const { t } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const cartItem = items.find((i) => i.id === `dish-${dish.id}`);

  return (
    <div className="group bg-card rounded-xl overflow-hidden border border-border card-hover animate-fade-in-up">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={t(dish.nameRu, dish.nameKz)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
          {t(dish.nameRu, dish.nameKz, dish.nameEn)}
        </h3>
        {(dish.descriptionRu || dish.descriptionKz || dish.descriptionEn) && (
          <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {t(dish.descriptionRu || "", dish.descriptionKz || "", dish.descriptionEn || "")}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-display text-xl font-semibold text-gold">
            {dish.price ? `${Number(dish.price).toLocaleString()} ₸` : ""}
          </span>
          {!cartItem ? (
            <button
              onClick={() =>
                addItem({
                  id: `dish-${dish.id}`,
                  nameRu: dish.nameRu,
                  nameKz: dish.nameKz,
                  price: dish.price,
                  type: "dish",
                })
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              {t("Добавить", "Қосу")}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  cartItem.quantity === 1
                    ? removeItem(cartItem.id)
                    : updateQuantity(cartItem.id, cartItem.quantity - 1)
                }
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center btn-press hover:bg-gold hover:text-background transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-body text-sm font-semibold w-5 text-center text-foreground">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                className="w-7 h-7 rounded-full bg-gold text-background flex items-center justify-center btn-press hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Business Lunch Section ───────────────────────────────────────────────────
function BusinessLunchSection() {
  const { t, lang } = useLanguage();
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [selectedDay, setSelectedDay] = useState<number>(getTodayDow());
  const { data: allLunches, isLoading } = trpc.menu.allBusinessLunches.useQuery();

  const activeLunches = useMemo(
    () => allLunches?.filter((l) => l.day.isActive) ?? [],
    [allLunches]
  );

  const currentLunch = activeLunches.find((l) => l.day.dayOfWeek === selectedDay);

  if (!isLoading && activeLunches.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <div className="gold-divider flex-1" />
          <h2 className="font-display text-3xl font-semibold text-gold whitespace-nowrap">
            {t("Бизнес-ланч", "Бизнес-ланч", "Business Lunch")}
          </h2>
          <div className="gold-divider flex-1" />
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-28 rounded-lg flex-shrink-0" />
              ))
            : activeLunches.map(({ day }) => (
                <button
                  key={day.dayOfWeek}
                  onClick={() => setSelectedDay(day.dayOfWeek)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all btn-press ${
                    selectedDay === day.dayOfWeek
                      ? "bg-gold text-background"
                      : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                  }`}
                >
                  {lang === "en" ? DAY_NAMES_EN[day.dayOfWeek] : lang === "kz" ? DAY_NAMES_KZ[day.dayOfWeek] : DAY_NAMES_RU[day.dayOfWeek]}
                </button>
              ))}
        </div>

        {/* Lunch content */}
        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : currentLunch ? (
          (() => {
            const cartKey = `lunch-${currentLunch.day.id}`;
            const cartItem = items.find((i) => i.id === cartKey);
            const availableItems = currentLunch.items.filter((item) => item.isAvailable);
            // Use day image or auto-collage from item photos
            const dayImage = (currentLunch.day as any).imageUrl;
            const collageImages = availableItems.filter(i => i.imageUrl).slice(0, 3).map(i => i.imageUrl!);

            return (
              <div className="bg-card rounded-2xl overflow-hidden border border-border max-w-2xl mx-auto animate-fade-in-up">
                {/* Hero image or auto-collage */}
                {dayImage ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={dayImage}
                      alt={t(currentLunch.day.titleRu, currentLunch.day.titleKz, currentLunch.day.titleEn)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : collageImages.length === 1 ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={collageImages[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : collageImages.length === 2 ? (
                  <div className="aspect-[16/9] grid grid-cols-2 gap-0.5 overflow-hidden">
                    {collageImages.map((src, i) => (
                      <div key={i} className="overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : collageImages.length >= 3 ? (
                  <div className="aspect-[16/9] grid grid-cols-3 gap-0.5 overflow-hidden">
                    {collageImages.map((src, i) => (
                      <div key={i} className="overflow-hidden">
                        <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-body text-sm text-muted-foreground">
                        {lang === "en" ? DAY_NAMES_EN[currentLunch.day.dayOfWeek] : lang === "kz"
                          ? DAY_NAMES_KZ[currentLunch.day.dayOfWeek]
                          : DAY_NAMES_RU[currentLunch.day.dayOfWeek]}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-foreground">
                        {t(currentLunch.day.titleRu, currentLunch.day.titleKz, currentLunch.day.titleEn)}
                      </h3>
                      {(currentLunch.day.startTime || currentLunch.day.endTime) && (
                        <p className="font-body text-xs text-muted-foreground mt-1">
                          {currentLunch.day.startTime} – {currentLunch.day.endTime}
                        </p>
                      )}
                    </div>
                    {currentLunch.day.price && (
                      <span className="font-display text-2xl font-semibold text-gold whitespace-nowrap ml-4">
                        {Number(currentLunch.day.price).toLocaleString()} ₸
                      </span>
                    )}
                  </div>

                  {/* Dishes list */}
                  {availableItems.length > 0 && (
                    <div className="mb-5 space-y-2">
                      <div className="gold-divider mb-3" />
                      {availableItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-2">
                          <span className="text-gold mt-1">•</span>
                          <div>
                            <span className="font-body text-sm text-foreground">
                              {t(item.nameRu, item.nameKz, item.nameEn)}
                            </span>
                            {(item.descriptionRu || item.descriptionKz || item.descriptionEn) && (
                              <p className="font-body text-xs text-muted-foreground">
                                {t(item.descriptionRu || "", item.descriptionKz || "", item.descriptionEn || "")}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="gold-divider mt-3" />
                    </div>
                  )}

                  {/* Add to cart */}
                  <div className="flex justify-end">
                    {!cartItem ? (
                      <button
                        onClick={() =>
                          addItem({
                            id: cartKey,
                            nameRu: t(currentLunch.day.titleRu, currentLunch.day.titleKz, currentLunch.day.titleEn),
                            nameKz: currentLunch.day.titleKz,
                            price: currentLunch.day.price,
                            type: "lunch",
                          })
                        }
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-background font-body text-sm font-semibold btn-press hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-4 h-4" />
                        {t("Добавить в корзину", "Себетке қосу", "Add to cart")}
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            cartItem.quantity === 1
                              ? removeItem(cartItem.id)
                              : updateQuantity(cartItem.id, cartItem.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center btn-press hover:bg-gold hover:text-background transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-body text-sm font-semibold w-6 text-center text-foreground">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gold text-background flex items-center justify-center btn-press hover:opacity-90 transition-opacity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <p className="text-center text-muted-foreground font-body py-8">
            {t("Бизнес-ланч на этот день не запланирован", "Бұл күнге бизнес-ланч жоспарланбаған")}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const { items, updateQuantity, removeItem, clearCart, totalCount } = useCart();
  const [, navigate] = useLocation();

  const totalPrice = items.reduce((sum, item) => {
    const price = item.price ? Number(item.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {t("Ваш заказ", "Сіздің тапсырысыңыз")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center btn-press hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
              <p className="font-body text-muted-foreground">
                {t("Корзина пуста", "Себет бос")}
              </p>
              <p className="font-body text-sm text-muted-foreground/70">
                {t(
                  "Добавьте блюда из меню, чтобы сделать заказ",
                  "Тапсырыс беру үшін мәзірден тағамдар қосыңыз"
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground truncate">
                      {t(item.nameRu, item.nameKz)}
                    </p>
                    {item.price && (
                      <p className="font-body text-xs text-gold mt-0.5">
                        {(Number(item.price) * item.quantity).toLocaleString()} ₸
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? removeItem(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center btn-press hover:bg-gold hover:text-background transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-body text-sm font-semibold w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gold text-background flex items-center justify-center btn-press hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-border flex flex-col gap-3">
            {totalPrice > 0 && (
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted-foreground">
                  {t("Итого", "Барлығы")}
                </span>
                <span className="font-display text-xl font-semibold text-gold">
                  {totalPrice.toLocaleString()} ₸
                </span>
              </div>
            )}
            <button
              onClick={() => {
                onClose();
                navigate("/waiter");
              }}
              className="w-full py-3 rounded-xl gold-gradient text-background font-body font-semibold text-base btn-press hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {t("Показать официанту", "Даяшыға көрсету")}
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 rounded-xl bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-destructive transition-colors"
            >
              {t("Очистить корзину", "Себетті тазалау")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────
export default function MenuPage() {
  const { t } = useLanguage();
  const { totalCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const { data: categories, isLoading: catLoading } = trpc.menu.categories.useQuery();
  const effectiveCategory = activeCategory ?? categories?.[0]?.id ?? null;

  const { data: dishes, isLoading: dishLoading } = trpc.menu.dishesByCategory.useQuery(
    { categoryId: effectiveCategory! },
    { enabled: effectiveCategory !== null }
  );

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalCount} onCartOpen={() => setCartOpen(true)} />

      {/* Hero */}
      <section className="py-10 text-center">
        <div className="container">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-gold/70 mb-2">
            {t("Ресторан-бар", "Мейрамхана-бар")}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-light gold-text-gradient mb-3">
            Jusan Restobar
          </h1>
          <div className="gold-divider max-w-xs mx-auto" />
        </div>
      </section>

      {/* Business Lunch */}
      <BusinessLunchSection />

      {/* Menu Categories */}
      <section className="py-6">
        <div className="container">
          <div className="flex items-center gap-4 mb-6">
            <div className="gold-divider flex-1" />
            <h2 className="font-display text-3xl font-semibold text-gold whitespace-nowrap">
              {t("Меню", "Мәзір")}
            </h2>
            <div className="gold-divider flex-1" />
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
            {catLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-28 rounded-lg flex-shrink-0" />
                ))
              : categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-body text-sm font-medium transition-all btn-press ${
                      effectiveCategory === cat.id
                        ? "bg-gold text-background"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {t(cat.nameRu, cat.nameKz)}
                  </button>
                ))}
          </div>

          {/* Dishes grid */}
          {dishLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : dishes && dishes.filter((d) => d.isAvailable).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
              {dishes
                .filter((d) => d.isAvailable)
                .map((dish) => (
                  <DishCard key={dish.id} dish={dish} />
                ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-body text-muted-foreground">
                {t("В этой категории пока нет блюд", "Бұл санатта әзірше тағамдар жоқ")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating cart button (mobile) */}
      {totalCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 sm:hidden">
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-full gold-gradient text-background font-body font-semibold shadow-lg btn-press"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{t("Корзина", "Себет")}</span>
            <Badge className="bg-background text-gold font-bold">{totalCount}</Badge>
          </button>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Footer */}
      <footer className="py-8 mt-10 border-t border-border">
        <div className="container text-center">
          <p className="font-display text-lg text-gold">Jusan Restobar</p>
          <p className="font-body text-xs text-muted-foreground mt-1 tracking-widest uppercase">
            {t("Выберите блюда и покажите официанту", "Тағамдарды таңдап, даяшыға көрсетіңіз")}
          </p>
        </div>
      </footer>
    </div>
  );
}
