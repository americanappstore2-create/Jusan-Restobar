import { useState, useRef } from "react";
import { Plus, Trash2, X, Check, Upload, ImageIcon, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const DAY_NAMES = [
  { dow: 1, ru: "Понедельник", kz: "Дүйсенбі" },
  { dow: 2, ru: "Вторник", kz: "Сейсенбі" },
  { dow: 3, ru: "Среда", kz: "Сәрсенбі" },
  { dow: 4, ru: "Четверг", kz: "Бейсенбі" },
  { dow: 5, ru: "Пятница", kz: "Жұма" },
];

interface ItemFormData {
  nameRu: string;
  nameKz: string;
  nameEn: string;
  descriptionRu: string;
  descriptionKz: string;
  descriptionEn: string;
  imageUrl: string;
  imageKey: string;
  sortOrder: number;
}

const EMPTY_ITEM: ItemFormData = {
  nameRu: "",
  nameKz: "",
  nameEn: "",
  descriptionRu: "",
  descriptionKz: "",
  descriptionEn: "",
  imageUrl: "",
  imageKey: "",
  sortOrder: 0,
};

function ItemForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: ItemFormData;
  onSave: (data: ItemFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initial.imageUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.admin.getUploadUrl.useMutation();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const base64 = (ev.target?.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
        });
        setForm((f) => ({ ...f, imageUrl: result.url, imageKey: result.key }));
        setPreview(result.url);
      } catch {
        toast.error("Ошибка загрузки фото");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-background rounded-xl p-4 border border-border/60 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">
            Название (RU)
          </label>
          <input
            value={form.nameRu}
            onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
            placeholder="Бешбармак с казы"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">
            Атауы (KZ)
          </label>
          <input
            value={form.nameKz}
            onChange={(e) => setForm((f) => ({ ...f, nameKz: e.target.value }))}
            placeholder="Қазы қосылған бешбармақ"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">
            Описание (RU)
          </label>
          <input
            value={form.descriptionRu}
            onChange={(e) => setForm((f) => ({ ...f, descriptionRu: e.target.value }))}
            placeholder="Необязательно"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">
            Сипаттама (KZ)
          </label>
          <input
            value={form.descriptionKz}
            onChange={(e) => setForm((f) => ({ ...f, descriptionKz: e.target.value }))}
            placeholder="Міндетті емес"
            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>

      {/* Photo */}
      <div className="mt-3">
        <label className="font-body text-xs text-muted-foreground mb-1 block">Фото</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="relative h-24 rounded-lg border-2 border-dashed border-border hover:border-gold transition-colors cursor-pointer overflow-hidden bg-secondary flex items-center justify-center"
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" className="h-full w-auto object-cover" />
              <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-gold" />
              </div>
            </>
          ) : uploading ? (
            <div className="w-6 h-6 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-5 h-5 opacity-40" />
              <span className="font-body text-xs">Загрузить фото</span>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>

      <div className="flex gap-2 justify-end mt-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.nameRu || !form.nameKz || loading || uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Добавить
        </button>
      </div>
    </div>
  );
}

function DayCard({ dow, dayNameRu, dayNameKz }: { dow: number; dayNameRu: string; dayNameKz: string }) {
  const utils = trpc.useUtils();
  const [expanded, setExpanded] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingDay, setEditingDay] = useState(false);
  const [dayForm, setDayForm] = useState({ titleRu: "", titleKz: "", titleEn: "", price: "", startTime: "12:00", endTime: "15:00", isActive: true });

  const { data: allLunches, isLoading } = trpc.admin.getAllBusinessLunches.useQuery();
  const lunchData = allLunches?.find((l) => l.day.dayOfWeek === dow);

  const upsertDay = trpc.admin.upsertBusinessLunchDay.useMutation({
    onSuccess: () => {
      utils.admin.getAllBusinessLunches.invalidate();
      utils.menu.allBusinessLunches.invalidate();
      setEditingDay(false);
      toast.success("День обновлён");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateDay = trpc.admin.updateBusinessLunchDay.useMutation({
    onSuccess: () => {
      utils.admin.getAllBusinessLunches.invalidate();
      utils.menu.allBusinessLunches.invalidate();
      toast.success("Обновлено");
    },
    onError: (e) => toast.error(e.message),
  });

  const createItem = trpc.admin.createBusinessLunchItem.useMutation({
    onSuccess: () => {
      utils.admin.getAllBusinessLunches.invalidate();
      utils.menu.allBusinessLunches.invalidate();
      setShowItemForm(false);
      toast.success("Позиция добавлена");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteItem = trpc.admin.deleteBusinessLunchItem.useMutation({
    onSuccess: () => {
      utils.admin.getAllBusinessLunches.invalidate();
      utils.menu.allBusinessLunches.invalidate();
      toast.success("Позиция удалена");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleItemAvailability = trpc.admin.toggleBusinessLunchItemAvailability.useMutation({
    onSuccess: () => {
      utils.admin.getAllBusinessLunches.invalidate();
      utils.menu.allBusinessLunches.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleStartEdit = () => {
    setDayForm({
      titleRu: lunchData?.day.titleRu ?? dayNameRu,
      titleKz: lunchData?.day.titleKz ?? dayNameKz,
      titleEn: lunchData?.day.titleEn ?? "Business Lunch",
      price: lunchData?.day.price?.toString() ?? "",
      startTime: lunchData?.day.startTime ?? "12:00",
      endTime: lunchData?.day.endTime ?? "15:00",
      isActive: lunchData?.day.isActive ?? true,
    });
    setEditingDay(true);
    setExpanded(true);
  };

  const handleSaveDay = () => {
    upsertDay.mutate({
      dayOfWeek: dow,
      titleRu: dayForm.titleRu || dayNameRu,
      titleKz: dayForm.titleKz || dayNameKz,
      titleEn: dayForm.titleEn || "Business Lunch",
      isActive: dayForm.isActive,
      price: dayForm.price || null,
      startTime: dayForm.startTime || "12:00",
      endTime: dayForm.endTime || "15:00",
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Day header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-body text-sm font-semibold text-foreground">{dayNameRu}</p>
            <span className="font-body text-xs text-muted-foreground">/ {dayNameKz}</span>
            {lunchData?.day.isActive === false && (
              <span className="px-1.5 py-0.5 rounded text-xs font-body bg-destructive/20 text-destructive">
                неактивен
              </span>
            )}
          </div>
          {lunchData && (
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {lunchData.day.titleRu}
              {lunchData.day.price && ` · ${Number(lunchData.day.price).toLocaleString()} ₸`}
              {lunchData.day.startTime && lunchData.day.endTime && ` · ${lunchData.day.startTime}–${lunchData.day.endTime}`}
              {` · ${lunchData.items.length} позиций`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lunchData && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateDay.mutate({ id: lunchData.day.id, isActive: !lunchData.day.isActive });
              }}
              className={`px-2 py-1 rounded font-body text-xs btn-press transition-colors ${
                lunchData.day.isActive
                  ? "bg-gold/20 text-gold hover:bg-gold/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {lunchData.day.isActive ? "Активен" : "Включить"}
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          {/* Day settings */}
          {editingDay ? (
            <div className="mt-3 flex flex-col gap-3 bg-secondary/50 rounded-xl p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Заголовок (RU)
                  </label>
                  <input
                    value={dayForm.titleRu}
                    onChange={(e) => setDayForm((f) => ({ ...f, titleRu: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Тақырып (KZ)
                  </label>
                  <input
                    value={dayForm.titleKz}
                    onChange={(e) => setDayForm((f) => ({ ...f, titleKz: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Title (EN)
                  </label>
                  <input
                    value={dayForm.titleEn}
                    onChange={(e) => setDayForm((f) => ({ ...f, titleEn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={dayForm.startTime}
                    onChange={(e) => setDayForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={dayForm.endTime}
                    onChange={(e) => setDayForm((f) => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">
                    Цена ланча (₸)
                  </label>
                  <input
                    type="number"
                    value={dayForm.price}
                    onChange={(e) => setDayForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="1990"
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={dayForm.isActive}
                    onChange={(e) => setDayForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-gold"
                  />
                  <span className="font-body text-sm text-foreground">Активен</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setEditingDay(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-body text-sm btn-press"
                >
                  <X className="w-3.5 h-3.5" />
                  Отмена
                </button>
                <button
                  onClick={handleSaveDay}
                  disabled={upsertDay.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="mt-3 font-body text-xs text-gold hover:underline"
            >
              {lunchData ? "Редактировать настройки дня" : "Настроить этот день"}
            </button>
          )}

          {/* Items */}
          {lunchData && lunchData.items.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {lunchData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2 bg-secondary/40 rounded-lg group"
                >
                  {item.imageUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.nameRu}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm text-foreground truncate">{item.nameRu}</p>
                      {!item.isAvailable && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-body bg-destructive/20 text-destructive">
                          нет
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">{item.nameKz}</p>
                  </div>
                  <button
                    onClick={() =>
                      toggleItemAvailability.mutate({
                        itemId: item.id,
                        isAvailable: !item.isAvailable,
                      })
                    }
                    title={item.isAvailable ? "Скрыть" : "Показать"}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-secondary/70 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    {item.isAvailable ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Удалить "${item.nameRu}"?`)) {
                        deleteItem.mutate({ id: item.id });
                      }
                    }}
                    className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-destructive hover:text-destructive-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add item */}
          {lunchData && (
            <>
              {showItemForm ? (
                <ItemForm
                  initial={EMPTY_ITEM}
                  onSave={(data) =>
                    createItem.mutate({ dayId: lunchData.day.id, ...data })
                  }
                  onCancel={() => setShowItemForm(false)}
                  loading={createItem.isPending}
                />
              ) : (
                <button
                  onClick={() => setShowItemForm(true)}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-foreground hover:bg-secondary/70 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить позицию
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function BusinessLunchPanel() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold text-foreground">Бизнес-ланч</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Настройте меню бизнес-ланча для каждого дня недели
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {DAY_NAMES.map(({ dow, ru, kz }) => (
          <DayCard key={dow} dow={dow} dayNameRu={ru} dayNameKz={kz} />
        ))}
      </div>
    </div>
  );
}
