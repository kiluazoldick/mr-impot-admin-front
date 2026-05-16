"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  AlertCircle,
  FolderTree,
  Pencil,
  PlusCircle,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PageHeader } from "../../../_components/page-header";
import { PrimaryButton } from "../../../_components/primary-button";
import { cn } from "@/lib/utils";
import { adminCategoriesApi } from "@/lib/api-client";
import {
  getCategorySchema,
  type CategoryFormValues,
} from "@/lib/validations/category";

// Types simples pour notre nouvelle API
interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  slug: string;
  parent_id: string | null;
  description_fr?: string;
  description_en?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  parent?: Category | null;
  subcategories?: Category[];
}

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function CategoriesPageView() {
  const t = useTranslations("Dashboard.Documents.Categories");
  const tValidation = useTranslations(
    "Dashboard.Documents.Categories.validation",
  );
  const tPage = useTranslations("Dashboard.Documents.pagination");
  const locale = useLocale();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pageSize = 5;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(getCategorySchema(tValidation)),
    defaultValues: {
      name: { fr: "", en: "" },
      subCategories: [{ name: { fr: "", en: "" }, id: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subCategories",
    keyName: "fieldId",
  });

  const editingCategory = mainCategories.find(
    (item) => item.id === selectedCategoryId,
  );

  // Charger toutes les catégories
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminCategoriesApi.getAll();

      // Normaliser les données
      const normalized: Category[] = Array.isArray(data) ? data : [];

      // Séparer catégories principales et sous-catégories
      const main = normalized.filter((cat) => !cat.parent_id);
      const subs = normalized.filter((cat) => cat.parent_id);

      // Associer les sous-catégories à leurs parents
      const mainWithSubs = main.map((cat) => ({
        ...cat,
        subcategories: subs.filter((sub) => sub.parent_id === cat.id),
      }));

      setAllCategories(normalized);
      setMainCategories(mainWithSubs);
    } catch {
      toast.error(t("toast.error_generic"));
      setAllCategories([]);
      setMainCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtrer par recherche
  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return mainCategories;

    return mainCategories.filter((cat) => {
      const catMatch =
        cat.name_fr.toLowerCase().includes(query) ||
        cat.name_en.toLowerCase().includes(query);
      const subMatch = cat.subcategories?.some(
        (sub) =>
          sub.name_fr.toLowerCase().includes(query) ||
          sub.name_en.toLowerCase().includes(query),
      );
      return catMatch || subMatch;
    });
  }, [mainCategories, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const resetForm = () => {
    setSelectedCategoryId(null);
    form.reset({
      name: { fr: "", en: "" },
      subCategories: [{ name: { fr: "", en: "" }, id: undefined }],
    });
  };

  const handleEdit = (category: Category) => {
    setSelectedCategoryId(category.id);
    setIsLoadingEdit(true);

    // Simuler un petit délai pour l'UX
    setTimeout(() => {
      form.reset({
        name: { fr: category.name_fr, en: category.name_en },
        subCategories:
          category.subcategories && category.subcategories.length > 0
            ? category.subcategories.map((sub) => ({
                id: sub.id,
                name: { fr: sub.name_fr, en: sub.name_en },
              }))
            : [{ name: { fr: "", en: "" }, id: undefined }],
      });
      setIsLoadingEdit(false);
    }, 300);
  };

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await adminCategoriesApi.delete(categoryToDelete.id);
      toast.success(t("toast.delete_success"));

      if (selectedCategoryId === categoryToDelete.id) {
        resetForm();
      }

      await fetchCategories();
      setCurrentPage(1);
    } catch {
      toast.error(t("toast.error_generic"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    setIsSubmitting(true);

    try {
      const categoryName = {
        name_fr: values.name.fr.trim(),
        name_en: values.name.en.trim(),
        slug: toSlug(values.name.fr.trim() || values.name.en.trim()),
      };

      if (editingCategory) {
        // Mise à jour de la catégorie principale
        await adminCategoriesApi.update(editingCategory.id, categoryName);

        // Gérer les sous-catégories
        const existingSubs = editingCategory.subcategories || [];
        const existingSubIds = new Set(existingSubs.map((s) => s.id));

        const formSubs = values.subCategories.filter(
          (sub) => sub.name.fr.trim() || sub.name.en.trim(),
        );

        // Supprimer les sous-catégories qui ne sont plus dans le formulaire
        const formSubIds = new Set(
          formSubs.filter((s) => s.id).map((s) => s.id!),
        );
        const toDelete = existingSubs.filter((s) => !formSubIds.has(s.id));
        for (const sub of toDelete) {
          await adminCategoriesApi.delete(sub.id);
        }

        // Créer ou mettre à jour les sous-catégories
        for (const sub of formSubs) {
          if (sub.id) {
            await adminCategoriesApi.update(sub.id, {
              name_fr: sub.name.fr.trim(),
              name_en: sub.name.en.trim(),
              slug: toSlug(sub.name.fr.trim() || sub.name.en.trim()),
              parent_id: editingCategory.id,
            });
          } else {
            await adminCategoriesApi.create({
              name_fr: sub.name.fr.trim(),
              name_en: sub.name.en.trim(),
              slug: toSlug(sub.name.fr.trim() || sub.name.en.trim()),
              parent_id: editingCategory.id,
            });
          }
        }

        toast.success(t("toast.update_success"));
      } else {
        // Création d'une nouvelle catégorie
        const created = await adminCategoriesApi.create({
          name_fr: categoryName.name_fr,
          name_en: categoryName.name_en,
          slug: categoryName.slug,
        });

        // Créer les sous-catégories
        const validSubs = values.subCategories.filter(
          (sub) => sub.name.fr.trim() || sub.name.en.trim(),
        );
        for (const sub of validSubs) {
          await adminCategoriesApi.create({
            name_fr: sub.name.fr.trim(),
            name_en: sub.name.en.trim(),
            slug: toSlug(sub.name.fr.trim() || sub.name.en.trim()),
            parent_id: created.id,
          });
        }

        toast.success(t("toast.create_success"));
      }

      await fetchCategories();
      resetForm();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || t("toast.error_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 260, damping: 22 },
    },
  };

  const deleteCategoryName = categoryToDelete
    ? locale === "fr"
      ? categoryToDelete.name_fr
      : categoryToDelete.name_en
    : "";

  return (
    <motion.div
      className="flex-1 space-y-4 max-w-350 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <PageHeader title={t("title")} description={t("description")} />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-4"
      >
        {/* Liste des catégories */}
        <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t("list_title")}
              </h2>
              <p className="text-sm text-slate-500">
                {t("list_description", { count: filteredCategories.length })}
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t("search_placeholder")}
                className="pl-10 h-10 border-slate-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 p-4 animate-pulse"
                >
                  <div className="h-4 w-1/2 bg-slate-200 rounded mb-3" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded mb-2" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-slate-200 rounded-full" />
                    <div className="h-6 w-24 bg-slate-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-2">
              <p className="font-semibold text-slate-700">{t("empty_title")}</p>
              <p className="text-sm text-slate-500">{t("empty_description")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedCategories.map((category) => {
                const isActive = selectedCategoryId === category.id;
                const displayName =
                  locale === "fr" ? category.name_fr : category.name_en;

                return (
                  <article
                    key={category.id}
                    className={cn(
                      "rounded-xl border p-4 transition-all bg-white",
                      isActive
                        ? "border-[#33a1db]/40 ring-2 ring-[#33a1db]/15"
                        : "border-slate-100 hover:border-slate-200",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-900">
                          <FolderTree className="w-4 h-4 text-[#33a1db]" />
                          <h3 className="font-semibold">{displayName}</h3>
                        </div>
                        <p className="text-xs text-slate-500">
                          {t("form.updated_at", {
                            date: category.updated_at
                              ? new Date(
                                  category.updated_at,
                                ).toLocaleDateString(locale)
                              : "-",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2 border-slate-200 hover:cursor-pointer"
                          disabled={isLoadingEdit || isDeleting}
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="w-4 h-4" />
                          {t("edit")}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="gap-2 hover:cursor-pointer"
                          disabled={isDeleting}
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="w-4 h-4" />
                          {t("delete")}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.subcategories &&
                      category.subcategories.length > 0 ? (
                        category.subcategories.map((sub) => (
                          <span
                            key={sub.id}
                            className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                          >
                            {locale === "fr" ? sub.name_fr : sub.name_en}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          {t("no_subcategories")}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!isLoading && filteredCategories.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm text-slate-500 font-medium">
                {tPage("showing_entries", {
                  start: (safeCurrentPage - 1) * pageSize + 1,
                  end: Math.min(
                    safeCurrentPage * pageSize,
                    filteredCategories.length,
                  ),
                  total: filteredCategories.length,
                })}
              </p>

              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      text={tPage("previous")}
                      className="h-8 shadow-sm text-slate-600 font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        if (safeCurrentPage > 1) setCurrentPage((p) => p - 1);
                      }}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === safeCurrentPage}
                          className={cn(
                            "h-8 w-8 shadow-sm",
                            page === safeCurrentPage
                              ? "bg-[#33a1db] text-white border-[#33a1db]"
                              : "border border-slate-200 text-slate-600 hover:text-slate-900",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      text={tPage("next")}
                      className="h-8 shadow-sm text-slate-600 font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        if (safeCurrentPage < totalPages)
                          setCurrentPage((p) => p + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>

        {/* Formulaire */}
        <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 h-fit xl:sticky xl:top-4">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingCategory ? t("form.edit_title") : t("form.create_title")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {editingCategory
                ? t("form.edit_subtitle")
                : t("form.create_subtitle")}
            </p>
          </div>

          {isLoadingEdit ? (
            <div className="animate-pulse space-y-5">
              <div className="h-11 w-full bg-slate-200 rounded" />
              <div className="h-11 w-full bg-slate-200 rounded" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-full bg-slate-200 rounded" />
              ))}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name.fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.category_name_fr")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.category_name_fr_placeholder")}
                            className="h-11 bg-slate-50/60 border-slate-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.category_name_en")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("form.category_name_en_placeholder")}
                            className="h-11 bg-slate-50/60 border-slate-200"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sous-catégories */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-slate-900">
                      {t("form.sub_categories")}
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#33a1db] hover:text-[#33a1db] hover:bg-blue-50 gap-1.5"
                      onClick={() =>
                        append({ name: { fr: "", en: "" }, id: undefined })
                      }
                    >
                      <PlusCircle className="w-4 h-4" />
                      {t("form.add_sub_category")}
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {fields.map((field, index) => (
                      <div
                        key={field.fieldId}
                        className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] items-start"
                      >
                        <input
                          type="hidden"
                          {...form.register(`subCategories.${index}.id`)}
                        />

                        <FormField
                          control={form.control}
                          name={`subCategories.${index}.name.fr`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">FR</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "form.sub_category_name_fr_placeholder",
                                    { index: index + 1 },
                                  )}
                                  className="h-10 bg-slate-50/60 border-slate-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`subCategories.${index}.name.en`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">EN</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={t(
                                    "form.sub_category_name_en_placeholder",
                                    { index: index + 1 },
                                  )}
                                  className="h-10 bg-slate-50/60 border-slate-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="shrink-0 self-center border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-600 hover:bg-red-50"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                  <PrimaryButton
                    icon={Save}
                    type="submit"
                    className="sm:min-w-42.5 h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("form.saving")
                      : editingCategory
                        ? t("form.save")
                        : t("form.create")}
                  </PrimaryButton>

                  {editingCategory && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 border-slate-200"
                      onClick={resetForm}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t("form.cancel_edit")}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          )}
        </section>
      </motion.div>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-xl">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              {t("delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              {t("delete_confirm_message", { name: deleteCategoryName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={isDeleting}
            >
              {t("delete_cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-12"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t("form.saving") : t("delete_confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
