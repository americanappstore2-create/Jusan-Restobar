import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, GripVertical } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryFormData {
  nameRu: string;
  nameKz: string;
  nameEn: string;
  sortOrder: number;
}

const EMPTY_FORM: CategoryFormData = { nameRu: "", nameKz: "", nameEn: "", sortOrder: 0 };

function CategoryForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: CategoryFormData;
  onSave: (data: CategoryFormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState(initial);

  return (
    <div className="bg-secondary/50 rounded-xl p-4 border border-border flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-body text-xs text-muted-foreground mb-1 block">
            Название (RU)
          </label>
          <input
            value={form.nameRu}
            onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
            placeholder="Горячие блюда"
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
            placeholder="Ыстық тағамдар"
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
            placeholder="Hot dishes"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="font-body text-xs text-muted-foreground mb-1 block">
          Порядок сортировки
        </label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          className="w-24 px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-body text-sm btn-press hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={!form.nameRu || !form.nameKz || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold text-background font-body text-sm font-medium btn-press hover:opacity-90 transition-opacity disabled:opacity-50"
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

export default function CategoriesPanel() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.admin.getCategories.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = trpc.admin.createCategory.useMutation({
    onSuccess: () => {
      utils.admin.getCategories.invalidate();
      utils.menu.categories.invalidate();
      setShowCreate(false);
      toast.success("Категория создана");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateCategory.useMutation({
    onSuccess: () => {
      utils.admin.getCategories.invalidate();
      utils.menu.categories.invalidate();
      setEditingId(null);
      toast.success("Категория обновлена");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteCategory.useMutation({
    onSuccess: () => {
      utils.admin.getCategories.invalidate();
      utils.menu.categories.invalidate();
      toast.success("Категория удалена");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Категории</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Управление категориями меню
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

      {/* Create form */}
      {showCreate && (
        <div className="mb-4 animate-fade-in-up">
          <CategoryForm
            initial={EMPTY_FORM}
            onSave={(data) => createMutation.mutate(data)}
            onCancel={() => setShowCreate(false)}
            loading={createMutation.isPending}
          />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat.id} className="animate-fade-in-up">
              {editingId === cat.id ? (
                <CategoryForm
                  initial={{
                    nameRu: cat.nameRu,
                    nameKz: cat.nameKz,
                    nameEn: cat.nameEn,
                    sortOrder: cat.sortOrder,
                  }}
                  onSave={(data) => updateMutation.mutate({ id: cat.id, ...data })}
                  onCancel={() => setEditingId(null)}
                  loading={updateMutation.isPending}
                />
              ) : (
                <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border group">
                  <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-foreground">{cat.nameRu}</p>
                    <p className="font-body text-xs text-muted-foreground">{cat.nameKz}</p>
                  </div>
                  <span className="font-body text-xs text-muted-foreground/60 mr-2">
                    #{cat.sortOrder}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingId(cat.id)}
                      className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center btn-press hover:bg-gold hover:text-background transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Удалить категорию "${cat.nameRu}"?`)) {
                          deleteMutation.mutate({ id: cat.id });
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
          <p className="font-body text-muted-foreground">Категорий пока нет</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 font-body text-sm text-gold underline"
          >
            Создать первую
          </button>
        </div>
      )}
    </div>
  );
}
