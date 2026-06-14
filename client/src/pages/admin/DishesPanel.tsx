import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, X, Check, Upload, ImageIcon, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface DishFormData {
  categoryId: number;
  subcategoryId?: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  descriptionRu: string;
  descriptionKz: string;
  descriptionEn: string;
  price: string;
  imageUrl: string;
  imageKey: string;
  isAvailable: boolean;
  sortOrder: number;
}

const EMPTY_FORM: DishFormData = {
  categoryId: 0,
  subcategoryId: undefined,
  nameRu: "",
  nameKz: "",
  nameEn: "",
  descriptionRu: "",
  descriptionKz: "",
  descriptionEn: "",
  price: "",
  imageUrl: "",
  imageKey: "",
  isAvailable: true,
  sortOrder: 0,
};

function DishForm({
  initial,
  categories,
  onSave,
  onCancel,
  loading,
}: {
  initial: DishFormData;
  categories: { id: number; nameRu: string }[];
  onSave: (data: DishFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initial.imageUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.admin.getUploadUrl.useMutation();
  const { data: subcategories = [] } = trpc.admin.getSubcategories.useQuery(
    { categoryId: form.categoryId },
    { enabled: form.categoryId > 0 }
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(",")[1];
        const result = await uploadMutation.mutateAsync({
          filename: file.name,
          contentType: file.type,
          base64Data: base64,
        });
        setForm((f) => ({ ...f, imageUrl: result.url, imageKey: result.key }));
        setPreview(result.url);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Ошибка загрузки фото");
      setUploading(false);
    }
  };

  const isValid = form.nameRu && form.nameKz && form.price && form.categoryId > 0;

  return (
    <div className="bg-secondary/50 rounded-xl p-5 border border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left column */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">Категория</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value), subcategoryId: undefined }))}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value={0}>Выберите категорию...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameRu}
                </option>
              ))}
            </select>
          </div>
          {form.categoryId > 0 && subcategories.length > 0 && (
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Подкатегория (опционально)</label>
              <select
                value={form.subcategoryId || 0}
                onChange={(e) => setForm((f) => ({ ...f, subcategoryId: Number(e.target.value) || undefined }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              >
                <option value={0}>Без подкатегории</option>
                {subcategories.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.nameRu}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">
                Название (RU)
              </label>
              <input
                value={form.nameRu}
                onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
                placeholder="Бешбармак"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">
                Атауы (KZ)
              </label>
              <input
                value={form.nameKz}
                onChange={(e) => setForm((f) => ({ ...f, nameKz: e.target.value }))}
                placeholder="Бешбармақ"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">
                Name (EN)
              </label>
              <input
                value={form.nameEn}
                onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                placeholder="Beshbarmak"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">
              Описание (RU)
            </label>
            <textarea
              value={form.descriptionRu}
              onChange={(e) => setForm((f) => ({ ...f, descriptionRu: e.target.value }))}
              placeholder="Традиционное казахское блюдо..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">
              Сипаттама (KZ)
            </label>
            <textarea
              value={form.descriptionKz}
              onChange={(e) => setForm((f) => ({ ...f, descriptionKz: e.target.value }))}
              placeholder="Дәстүрлі қазақ тағамы..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">
              Description (EN)
            </label>
            <textarea
              value={form.descriptionEn}
              onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
              placeholder="Traditional Kazakh dish..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">
                Цена (₸)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="2500"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">
                Порядок
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
              className="w-4 h-4 accent-gold"
            />
            <span className="font-body text-sm text-foreground">Доступно в меню</span>
          </label>
        </div>

        {/* Right column — photo */}
        <div className="flex flex-col gap-3">
          <label className="font-body text-xs text-muted-foreground block">Фото блюда</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-gold transition-colors cursor-pointer overflow-hidden bg-background flex items-center justify-center"
          >
            {preview ? (
              <>
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gold" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                {uploading ? (
                  <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 opacity-30" />
                    <p className="font-body text-sm">Нажмите для загрузки</p>
                    <p className="font-body text-xs opacity-60">JPG, PNG, WebP · макс. 5 МБ</p>
                  </>
                )}
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview && (
            <button
              onClick={() => {
                setPreview("");
                setForm((f) => ({ ...f, imageUrl: "", imageKey: "" }));
              }}
              className="font-body text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Удалить фото
            </button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!isValid || loading || uploading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-background border-t-transparent animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
          Сохранить
        </button>
      </div>
    </div>
  );
}

export default function DishesPanel() {
  const utils = trpc.useUtils();
  const { data: categories } = trpc.admin.getCategories.useQuery();
  const { data: dishes, isLoading } = trpc.admin.getAllDishes.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<number | null>(null);

  const createMutation = trpc.admin.createDish.useMutation({
    onSuccess: () => {
      utils.admin.getAllDishes.invalidate();
      utils.menu.dishesByCategory.invalidate();
      setShowCreate(false);
      toast.success("Блюдо добавлено");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateDish.useMutation({
    onSuccess: () => {
      utils.admin.getAllDishes.invalidate();
      utils.menu.dishesByCategory.invalidate();
      setEditingId(null);
      toast.success("Блюдо обновлено");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteDish.useMutation({
    onSuccess: () => {
      utils.admin.getAllDishes.invalidate();
      utils.menu.dishesByCategory.invalidate();
      toast.success("Блюдо удалено");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleAvailability = trpc.admin.updateDish.useMutation({
    onSuccess: () => {
      utils.admin.getAllDishes.invalidate();
      utils.menu.dishesByCategory.invalidate();
    },
  });

  const filteredDishes = filterCat
    ? dishes?.filter((d) => d.categoryId === filterCat)
    : dishes;

  const getCatName = (id: number) =>
    categories?.find((c) => c.id === id)?.nameRu ?? "—";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Блюда</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Управление блюдами меню
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Добавить
        </button>
      </div>

      {/* Filter by category */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setFilterCat(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-sm transition-all btn-press ${
              filterCat === null
                ? "bg-gold text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCat(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-body text-sm transition-all btn-press ${
                filterCat === cat.id
                  ? "bg-gold text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.nameRu}
            </button>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="mb-4 animate-fade-in-up">
          <DishForm
            initial={{ ...EMPTY_FORM, categoryId: filterCat ?? 0 }}
            categories={categories ?? []}
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreate(false)}
            loading={createMutation.isPending}
          />
        </div>
      )}

      {/* Dishes list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filteredDishes && filteredDishes.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filteredDishes.map((dish) => (
            <div key={dish.id} className="animate-fade-in-up">
              {editingId === dish.id ? (
                <DishForm
                  initial={{
                    categoryId: dish.categoryId,
                    subcategoryId: dish.subcategoryId ?? undefined,
                    nameRu: dish.nameRu,
                    nameKz: dish.nameKz,
                    nameEn: dish.nameEn,
                    descriptionRu: dish.descriptionRu ?? "",
                    descriptionKz: dish.descriptionKz ?? "",
                    descriptionEn: dish.descriptionEn ?? "",
                    price: dish.price?.toString() ?? "",
                    imageUrl: dish.imageUrl ?? "",
                    imageKey: dish.imageKey ?? "",
                    isAvailable: dish.isAvailable,
                    sortOrder: dish.sortOrder,
                  }}
                  categories={categories ?? []}
                  onSave={(data) => updateMutation.mutate({ id: dish.id, ...data })}
                  onCancel={() => setEditingId(null)}
                  loading={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border group">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {dish.imageUrl ? (
                      <img
                        src={dish.imageUrl}
                        alt={dish.nameRu}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-medium text-foreground truncate">
                        {dish.nameRu}
                      </p>
                      {!dish.isAvailable && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-body bg-destructive/20 text-destructive">
                          скрыто
                        </span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">
                      {getCatName(dish.categoryId)} · {dish.nameKz}
                    </p>
                  </div>
                  {/* Price */}
                  <span className="font-display text-base font-semibold text-gold flex-shrink-0 mr-2">
                    {dish.price ? `${Number(dish.price).toLocaleString()} ₸` : "—"}
                  </span>
                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        toggleAvailability.mutate({
                          id: dish.id,
                          isAvailable: !dish.isAvailable,
                        })
                      }
                      title={dish.isAvailable ? "Скрыть" : "Показать"}
                      className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-secondary/70 transition-colors"
                    >
                      {dish.isAvailable ? (
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(dish.id)}
                      className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-gold hover:text-background transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Удалить "${dish.nameRu}"?`)) {
                          deleteMutation.mutate({ id: dish.id });
                        }
                      }}
                      className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="font-body text-muted-foreground">Блюд пока нет</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 font-body text-sm text-gold underline"
          >
            Добавить первое блюдо
          </button>
        </div>
      )}
    </div>
  );
}
