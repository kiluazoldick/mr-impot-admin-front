"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  getDocumentSchema,
  DocumentFormValues,
} from "@/lib/validations/document";
import { adminCategoriesApi, adminDocumentsApi } from "@/lib/api-client";
import {
  ArrowLeft,
  Upload,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
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
import * as pdfjsLib from "pdfjs-dist";

// Configurer le worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  parent_id: string | null;
  subcategories?: Category[];
}

interface DocumentFormProps {
  initialData?: Partial<DocumentFormValues>;
  documentId?: string;
  isViewMode?: boolean;
}

// Fonction pour extraire le texte d'un PDF côté navigateur
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
    });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  } catch (error: any) {
    console.warn("⚠️ Impossible d'extraire le texte:", error.message);
    return "";
  }
}

export function DocumentForm({
  initialData,
  documentId,
  isViewMode = false,
}: Readonly<DocumentFormProps>) {
  const t = useTranslations("Dashboard.Documents.Add");
  const tValid = useTranslations("Dashboard.Documents.Add.validation");
  const locale = useLocale();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [readOnly, setReadOnly] = useState(isViewMode);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [docData, setDocData] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const isExistingDocument = Boolean(documentId);
  const isEditMode = isExistingDocument && !readOnly;

  const defaultValues = {
    title: { fr: "", en: "" },
    category: "",
    subCategory: "",
    description: { fr: "", en: "" },
    fileFr: undefined,
    fileEn: undefined,
  };

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(
      getDocumentSchema(tValid, { requireFiles: !isExistingDocument }),
    ),
    defaultValues: { ...defaultValues, ...initialData },
  });

  const { isSubmitting } = form.formState;
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "category",
  });

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminCategoriesApi.getAll();
        const list: any[] = Array.isArray(response)
          ? response
          : (response as any)?.data || [];
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
        toast.error(t("categories_load_error"));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [t]);

  // Charger le document existant
  useEffect(() => {
    if (!documentId || initialData) return;
    if (categories.length === 0) return;

    const fetchDocument = async () => {
      setLoadingDocument(true);
      try {
        const doc = await adminDocumentsApi.getById(documentId);
        setDocData(doc);

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
          title: { fr: doc.title_fr || "", en: doc.title_en || "" },
          description: {
            fr: doc.description_fr || "",
            en: doc.description_en || "",
          },
          category: parentCategoryId,
          subCategory: subCategoryId || "",
          fileFr: undefined,
          fileEn: undefined,
        });

        // Charger l'URL du PDF depuis Supabase
        if (doc.file_path) {
          const { data: urlData } = await supabase.storage
            .from("documents")
            .createSignedUrl(doc.file_path, 3600);
          if (urlData?.signedUrl) {
            setPdfUrl(urlData.signedUrl);
          }
        }
      } catch {
        toast.error(t("load_error_message"));
      } finally {
        setLoadingDocument(false);
      }
    };

    fetchDocument();
  }, [documentId, initialData, categories, form, t]);

  const availableSubCategories =
    categories.find((cat) => cat.id === selectedCategoryId)?.subcategories ||
    [];

  const onSubmit = async (data: DocumentFormValues) => {
    try {
      // Extraire le texte du PDF s'il y a un fichier
      let ocr_text = "";
      if (data.fileFr instanceof File) {
        setIsExtracting(true);
        toast.info("Extraction du texte du PDF...");
        ocr_text = await extractTextFromPdf(data.fileFr);
        if (ocr_text) {
          toast.success(`Texte extrait : ${ocr_text.length} caractères`);
        }
        setIsExtracting(false);
      }

      const payload: any = {
        category_id: data.subCategory,
        title_fr: data.title.fr,
        title_en: data.title.en,
        description_fr: data.description.fr,
        description_en: data.description.en,
        is_published: true,
      };

      // Ajouter le texte extrait
      if (ocr_text) {
        payload.ocr_text = ocr_text;
        payload.ocr_status = "completed";
      }

      if (isExistingDocument && documentId) {
        await adminDocumentsApi.update(
          documentId,
          payload,
          data.fileFr || data.fileEn,
        );
        toast.success(t("edit_success_message"));
        setReadOnly(true);
        // Recharger les données
        const updatedDoc = await adminDocumentsApi.getById(documentId);
        setDocData(updatedDoc);
      } else {
        await adminDocumentsApi.create(payload, data.fileFr || data.fileEn);
        toast.success(t("success_message"));
        router.push("/dashboard/documents");
      }
    } catch (error: any) {
      toast.error(error.message || t("error_message"));
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;
    setIsDeleting(true);
    try {
      await adminDocumentsApi.delete(documentId);
      toast.success(t("delete_success_message"));
      router.push("/dashboard/documents");
    } catch (error: any) {
      toast.error(error.message || t("delete_error_message"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (loadingDocument) {
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
        href="/dashboard/documents"
        className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        {/* En-tête avec boutons */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {readOnly
                ? t("view_title")
                : isEditMode
                  ? t("edit_title")
                  : t("title")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {readOnly
                ? t("view_subtitle")
                : isEditMode
                  ? t("edit_subtitle")
                  : t("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Statut OCR */}
            {readOnly && isExistingDocument && docData && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100">
                {docData.ocr_status === "completed" ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-700">
                      OCR: OK ({docData.ocr_text?.length || 0} car.)
                    </span>
                  </>
                ) : docData.ocr_status === "processing" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                    <span className="text-blue-700">OCR: En cours...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-700">OCR: Non extrait</span>
                  </>
                )}
              </div>
            )}

            {readOnly && isExistingDocument && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-slate-200 hover:cursor-pointer"
                  onClick={() => setReadOnly(false)}
                >
                  <Edit className="w-4 h-4" />
                  {t("edit_btn")}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2 hover:cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  {t("delete_btn")}
                </Button>
              </>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Titres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title.fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.title_fr")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.title_fr_placeholder")}
                        className="h-12 w-full px-4 rounded-lg bg-slate-50/50 border-slate-200"
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
                name="title.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.title_en")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.title_en_placeholder")}
                        className="h-12 w-full px-4 rounded-lg bg-slate-50/50 border-slate-200"
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
                    <FormLabel>{t("form.category")}</FormLabel>
                    <Select
                      disabled={readOnly || loadingCategories}
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("subCategory", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 w-full px-4 rounded-lg bg-slate-50/50 border-slate-200">
                          <SelectValue
                            placeholder={t("form.category_placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>
                            {t("form.category_loading")}
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
                    <FormLabel>{t("form.sub_category")}</FormLabel>
                    <Select
                      disabled={readOnly || !selectedCategoryId}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 w-full px-4 rounded-lg bg-slate-50/50 border-slate-200">
                          <SelectValue
                            placeholder={t("form.sub_category_placeholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubCategories.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {t("form.sub_category_empty")}
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

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description.fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.description_fr")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("form.description_fr_placeholder")}
                        className="min-h-30 w-full p-4 rounded-lg bg-slate-50/50 border-slate-200 resize-y"
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
                name="description.en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.description_en")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("form.description_en_placeholder")}
                        className="min-h-30 w-full p-4 rounded-lg bg-slate-50/50 border-slate-200 resize-y"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Texte extrait par OCR */}
            {readOnly && docData?.ocr_text && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-semibold text-green-800 mb-2">
                  📝 Texte extrait du document ({docData.ocr_text.length}{" "}
                  caractères)
                </h4>
                <p className="text-xs text-green-700 max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {docData.ocr_text.substring(0, 1000)}
                  {docData.ocr_text.length > 1000 && "..."}
                </p>
              </div>
            )}

            {/* Upload fichier */}
            {!readOnly && (
              <FormField
                control={form.control}
                name="fileFr"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>{t("form.upload_pdf_fr")}</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) onChange(file);
                        }}
                        {...field}
                      />
                    </FormControl>
                    {isExtracting && (
                      <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Extraction du texte en cours...
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* LECTEUR PDF - simple iframe */}
            {readOnly && pdfUrl && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-800">
                    📄 Aperçu du document
                  </h3>
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
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <iframe
                    src={pdfUrl}
                    className="w-full h-[600px]"
                    title="Aperçu PDF"
                  />
                </div>
              </div>
            )}

            {/* Boutons en mode édition */}
            {!readOnly && (
              <div className="flex justify-end pt-6 mt-8 border-t border-slate-100 gap-3">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 border-slate-200"
                    onClick={() => setReadOnly(true)}
                  >
                    {t("cancel_btn")}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || isExtracting}
                  className="h-12 px-8 bg-[#33a1db] hover:bg-[#288abb] text-white gap-2 rounded-lg font-medium shadow-sm"
                >
                  {isSubmitting || isExtracting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isEditMode ? t("update_now") : t("publish_now")}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-xl">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              {t("delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              {t("delete_confirm_message")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {t("cancel_btn")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 h-12"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t("confirm_delete_btn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
