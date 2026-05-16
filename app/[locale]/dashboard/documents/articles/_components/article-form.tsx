"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getArticleSchema, ArticleFormValues } from "@/lib/validations/article";
import { adminCategoriesApi, adminDocumentsApi } from "@/lib/api-client";
import {
  ArrowLeft,
  Upload,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Eye,
  X,
  Maximize2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  parent_id: string | null;
  subcategories?: Category[];
}

interface ArticleFormProps {
  initialData?: Partial<ArticleFormValues>;
  isViewMode?: boolean;
  articleId?: string;
}

export function ArticleForm({
  initialData,
  isViewMode = false,
  articleId,
}: ArticleFormProps) {
  const t = useTranslations("Dashboard.Articles");
  const tValid = useTranslations("Dashboard.Articles.Add.validation");
  const router = useRouter();
  const locale = useLocale();

  const [readOnly, setReadOnly] = useState(isViewMode);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [articleData, setArticleData] = useState<any>(null);

  const isExistingArticle = Boolean(articleId);
  const isEditMode = isExistingArticle && !readOnly;

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(getArticleSchema(tValid)),
    defaultValues: initialData || {
      title_fr: "",
      title_en: "",
      category: "",
      subCategory: "",
      content_fr: "",
      content_en: "",
      pdfFile: undefined,
    },
  });

  const { isSubmitting } = form.formState;
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "category",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminCategoriesApi.getAll();
        const list = Array.isArray(response) ? response : response?.data || [];
        const mainCategories = list.filter((cat: Category) => !cat.parent_id);
        const subCategories = list.filter((cat: Category) => cat.parent_id);
        const categoriesWithSubs = mainCategories.map((cat: Category) => ({
          ...cat,
          subcategories: subCategories.filter(
            (sub: Category) => sub.parent_id === cat.id,
          ),
        }));
        setCategories(categoriesWithSubs);
      } catch {
        toast.error(t("Add.categories_load_error"));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [t]);

  useEffect(() => {
    if (!articleId || initialData) return;
    if (categories.length === 0) return;

    const fetchArticle = async () => {
      setLoadingArticle(true);
      try {
        const doc = await adminDocumentsApi.getById(articleId);
        setArticleData(doc);

        const subCategoryId = doc.category?.id;
        let parentCategoryId = "";

        for (const cat of categories) {
          if (
            cat.subcategories?.some((sub: Category) => sub.id === subCategoryId)
          ) {
            parentCategoryId = cat.id;
            break;
          }
        }

        form.reset({
          title_fr: doc.title_fr || "",
          title_en: doc.title_en || "",
          category: parentCategoryId,
          subCategory: subCategoryId || "",
          content_fr: doc.description_fr || "",
          content_en: doc.description_en || "",
          pdfFile: undefined,
        });

        if (doc.file_path) {
          const { data: urlData } = await supabase.storage
            .from("documents")
            .createSignedUrl(doc.file_path, 3600);
          if (urlData?.signedUrl) {
            setPdfUrl(urlData.signedUrl);
          }
        }
      } catch {
        toast.error(t("Add.load_error_message"));
      } finally {
        setLoadingArticle(false);
      }
    };

    fetchArticle();
  }, [articleId, initialData, categories, form, t]);

  const availableSubCategories = useMemo(() => {
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId,
    );
    return selectedCategory?.subcategories || [];
  }, [categories, selectedCategoryId]);

  const handleDelete = async () => {
    if (!articleId) return;
    setIsDeleting(true);
    try {
      await adminDocumentsApi.delete(articleId);
      toast.success(t("Add.delete_success_message"));
      router.push("/dashboard/documents/articles");
    } catch (error: any) {
      toast.error(error.message || t("Add.delete_error_message"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: ArticleFormValues) => {
    try {
      let file_path: string | null = null;
      let file_size: number | null = null;

      if (data.pdfFile instanceof File) {
        const safeName = data.pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const fileName = `${Date.now()}-${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, data.pdfFile, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError)
          throw new Error(`Erreur d'upload: ${uploadError.message}`);

        file_path = uploadData?.path || fileName;
        file_size = data.pdfFile.size;
      }

      const payload = {
        category_id: data.subCategory,
        title_fr: data.title_fr,
        title_en: data.title_en,
        description_fr: data.content_fr,
        description_en: data.content_en,
        is_published: true,
        file_path,
        file_size,
        mime_type: "application/pdf",
      };

      if (isExistingArticle && articleId) {
        await adminDocumentsApi.update(articleId, payload);
        toast.success(t("Add.edit_success_message"));
        setReadOnly(true);
      } else {
        await adminDocumentsApi.create(payload);
        toast.success(t("Add.success_message"));
        router.push("/dashboard/documents/articles");
      }
    } catch (error: any) {
      toast.error(error.message || t("Add.error_message"));
    }
  };

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#33a1db]" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 space-y-6 max-w-350 mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link
        href="/dashboard/documents/articles"
        className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("Add.back")}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {readOnly
                ? t("Add.view_title")
                : isEditMode
                  ? t("Add.edit_title")
                  : t("Add.title")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {readOnly
                ? t("Add.view_subtitle")
                : isEditMode
                  ? t("Add.edit_subtitle")
                  : t("Add.subtitle")}
            </p>
          </div>

          {readOnly && isExistingArticle && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-slate-200"
                onClick={() => setReadOnly(false)}
              >
                <Edit className="w-4 h-4" />
                {t("Add.edit_btn")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                {t("Add.delete_btn")}
              </Button>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Titres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.title_fr")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Add.form.title_fr_placeholder")}
                        className="h-12 bg-slate-50/50 border-slate-200"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.title_en")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("Add.form.title_en_placeholder")}
                        className="h-12 bg-slate-50/50 border-slate-200"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Catégories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.category")}</FormLabel>
                    <Select
                      disabled={readOnly || loadingCategories}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subCategory", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200">
                          <SelectValue
                            placeholder={t("Add.form.category_placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>
                            {t("Add.form.category_loading")}
                          </SelectItem>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {locale === "fr" ? cat.name_fr : cat.name_en}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.sub_category")}</FormLabel>
                    <Select
                      disabled={readOnly || !selectedCategoryId}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200">
                          <SelectValue
                            placeholder={t("Add.form.sub_category_placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubCategories.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {t("Add.form.sub_category_placeholder")}
                          </SelectItem>
                        ) : (
                          availableSubCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {locale === "fr" ? sub.name_fr : sub.name_en}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contenu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="content_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.content_fr")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("Add.form.content_fr_placeholder")}
                        className="min-h-30 bg-slate-50/50 border-slate-200"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Add.form.content_en")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("Add.form.content_en_placeholder")}
                        className="min-h-30 bg-slate-50/50 border-slate-200"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* LECTEUR PDF - visible seulement en mode lecture */}
            {readOnly && pdfUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    📄 Aperçu du document PDF
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => window.open(pdfUrl, "_blank")}
                    >
                      <Eye className="w-4 h-4" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setPdfFullscreen(true)}
                    >
                      <Maximize2 className="w-4 h-4" />
                      Plein écran
                    </Button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[500px]"
                    title="Aperçu PDF"
                  />
                </div>
              </div>
            )}

            {/* Lecteur PDF plein écran */}
            {pdfFullscreen && (
              <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
                <div className="flex items-center justify-between p-4 bg-slate-900">
                  <h3 className="text-white font-medium">
                    {articleData?.title_fr || "Article"}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-white hover:bg-slate-800"
                    onClick={() => setPdfFullscreen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <iframe
                  src={pdfUrl}
                  className="flex-1 w-full"
                  title="PDF Plein écran"
                />
              </div>
            )}

            {/* Upload PDF */}
            {!readOnly && (
              <FormField
                control={form.control}
                name="pdfFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>📄 Document PDF</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        className="h-12 bg-slate-50/50 border-slate-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Boutons */}
            {!readOnly && (
              <div className="flex justify-end pt-6 mt-8 border-t border-slate-100 gap-3">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 border-slate-200"
                    onClick={() => setReadOnly(true)}
                  >
                    {t("Add.cancel_btn")}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 bg-[#33a1db] hover:bg-[#288abb] text-white gap-2 rounded-lg font-medium shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isEditMode ? t("Add.update_now") : t("Add.publish_now")}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Dialog suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-xl">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              {t("Add.delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              {t("Add.delete_confirm_message")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("Add.cancel_btn")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-12"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {t("Add.confirm_delete_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
