import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SubcategoryFormData {
  nameRu: string;
  nameKz: string;
  nameEn: string;
  sortOrder: number;
}

const EMPTY_FORM: SubcategoryFormData = {
  nameRu: "",
  nameKz: "",
  nameEn: "",
  sortOrder: 0,
};

export default function SubcategoriesPanel() {
  const utils = trpc.useUtils();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SubcategoryFormData>(EMPTY_FORM);

  const { data: categories, isLoading: categoriesLoading } = trpc.menu.categories.useQuery();
  const { data: subcategories, isLoading: subcatsLoading } = trpc.admin.getSubcategories.useQuery(
    { categoryId: selectedCategoryId! },
    { enabled: !!selectedCategoryId }
  );

  const createMutation = trpc.admin.createSubcategory.useMutation({
    onSuccess: () => {
      utils.admin.getSubcategories.invalidate({ categoryId: selectedCategoryId! });
      setForm(EMPTY_FORM);
      toast.success("Подкатегория создана");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateSubcategory.useMutation({
    onSuccess: () => {
      utils.admin.getSubcategories.invalidate({ categoryId: selectedCategoryId! });
      setEditingId(null);
      setForm(EMPTY_FORM);
      toast.success("Подкатегория обновлена");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteSubcategory.useMutation({
    onSuccess: () => {
      utils.admin.getSubcategories.invalidate({ categoryId: selectedCategoryId! });
      toast.success("Подкатегория удалена");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!selectedCategoryId) {
      toast.error("Выберите категорию");
      return;
    }
    if (!form.nameRu || !form.nameKz || !form.nameEn) {
      toast.error("Заполните все названия");
      return;
    }
    createMutation.mutate({
      categoryId: selectedCategoryId,
      ...form,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !form.nameRu || !form.nameKz || !form.nameEn) {
      toast.error("Заполните все названия");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      ...form,
    });
  };

  const handleEdit = (sub: any) => {
    setEditingId(sub.id);
    setForm({
      nameRu: sub.nameRu,
      nameKz: sub.nameKz,
      nameEn: sub.nameEn,
      sortOrder: sub.sortOrder,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl text-foreground mb-4">Подкатегории</h2>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="font-body text-sm text-muted-foreground mb-2 block">Выберите категорию</label>
          {categoriesLoading ? (
            <Skeleton className="h-10 w-full rounded-lg" />
          ) : (
            <select
              value={selectedCategoryId || ""}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                setEditingId(null);
                setForm(EMPTY_FORM);
              }}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">-- Выберите категорию --</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameRu}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Form */}
        {selectedCategoryId && (
          <Card className="p-6 mb-6">
            <h3 className="font-serif text-lg text-foreground mb-4">
              {editingId ? "Редактировать подкатегорию" : "Новая подкатегория"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Название (RU)</label>
                <input
                  value={form.nameRu}
                  onChange={(e) => setForm((f) => ({ ...f, nameRu: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  placeholder="Пиццы"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Название (KZ)</label>
                <input
                  value={form.nameKz}
                  onChange={(e) => setForm((f) => ({ ...f, nameKz: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  placeholder="Пиццалар"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Название (EN)</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                  placeholder="Pizzas"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Порядок сортировки</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground font-body text-sm focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={editingId ? handleUpdate : handleCreate}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  {editingId ? "Сохранить" : "Создать"}
                </Button>
                {editingId && (
                  <Button
                    onClick={() => {
                      setEditingId(null);
                      setForm(EMPTY_FORM);
                    }}
                    variant="outline"
                  >
                    Отмена
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* List */}
        {selectedCategoryId && (
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-foreground">Подкатегории</h3>
            {subcatsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : subcategories && subcategories.length > 0 ? (
              <div className="space-y-2">
                {subcategories?.map((sub: any) => (
                  <Card key={sub.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-foreground">{sub.nameRu}</p>
                      <p className="font-body text-xs text-muted-foreground">{sub.nameKz} / {sub.nameEn}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate({ id: sub.id })}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Нет подкатегорий</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
