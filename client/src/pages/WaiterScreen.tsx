import { useLocation } from "wouter";
import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function WaiterScreen() {
  const { items, clearCart } = useCart();
  const { t, lang } = useLanguage();
  const [, navigate] = useLocation();

  const totalPrice = items.reduce((sum, item) => {
    const price = item.price ? Number(item.price) : 0;
    return sum + price * item.quantity;
  }, 0);

  const hasPrice = items.some((i) => i.price && Number(i.price) > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-body text-sm btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("Назад", "Артқа")}
        </button>
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-gold" />
          <span className="font-display text-base text-gold">Jusan Restobar</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {items.length === 0 ? (
          <div className="text-center">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
            <p className="font-display text-2xl text-muted-foreground">
              {t("Корзина пуста", "Себет бос")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2 rounded-lg bg-gold text-background font-body font-medium btn-press"
            >
              {t("Перейти к меню", "Мәзірге өту")}
            </button>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            {/* Title */}
            <div className="text-center mb-8">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-gold/60 mb-2">
                {t("Мой заказ", "Менің тапсырысым")}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-light text-foreground">
                {t("Покажите официанту", "Даяшыға көрсетіңіз")}
              </h1>
              <div className="gold-divider max-w-xs mx-auto mt-4" />
            </div>

            {/* Order list */}
            <div className="flex flex-col gap-0">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-baseline justify-between py-4 ${
                    idx < items.length - 1 ? "border-b border-border/40" : ""
                  }`}
                >
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl sm:text-4xl font-light text-gold/70 w-8 text-right flex-shrink-0">
                      {item.quantity}
                    </span>
                    <span className="font-display text-2xl sm:text-3xl font-light text-foreground leading-tight">
                      {lang === "kz" ? item.nameKz : item.nameRu}
                    </span>
                  </div>
                  {item.price && Number(item.price) > 0 && (
                    <span className="font-body text-lg text-muted-foreground ml-4 flex-shrink-0">
                      {(Number(item.price) * item.quantity).toLocaleString()} ₸
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            {hasPrice && totalPrice > 0 && (
              <div className="mt-6 pt-4 border-t border-gold/30 flex items-center justify-between">
                <span className="font-body text-base text-muted-foreground uppercase tracking-wider">
                  {t("Итого", "Барлығы")}
                </span>
                <span className="font-display text-3xl font-semibold text-gold">
                  {totalPrice.toLocaleString()} ₸
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3">
              <button
                onClick={() => {
                  clearCart();
                  navigate("/");
                }}
                className="w-full py-3 rounded-xl bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-foreground transition-colors"
              >
                {t("Очистить и вернуться в меню", "Тазалап, мәзірге оралу")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
