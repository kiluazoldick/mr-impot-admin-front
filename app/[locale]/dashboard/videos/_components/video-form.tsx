"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useLocale } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { adminCategoriesApi, adminVideosApi } from "@/lib/api-client";
import {
  ArrowLeft,
  Upload,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  Play,
  Pause,
  Maximize2,
  Volume2,
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
import { z } from "zod";

const videoSchema = z.object({
  title_fr: z.string().min(1, "Titre FR requis"),
  title_en: z.string().min(1, "Titre EN requis"),
  category: z.string().min(1, "Catégorie requise"),
  subCategory: z.string().min(1, "Sous-catégorie requise"),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  videoFile: z.any().optional(),
});

type VideoFormValues = z.infer<typeof videoSchema>;

interface Category {
  id: string;
  name_fr: string;
  name_en: string;
  parent_id: string | null;
  subcategories?: Category[];
}

interface VideoFormProps {
  initialData?: Partial<VideoFormValues>;
  isViewMode?: boolean;
  videoId?: string;
}

export function VideoForm({
  initialData,
  isViewMode = false,
  videoId,
}: VideoFormProps) {
  const t = useTranslations("Dashboard.Videos");
  const router = useRouter();
  const locale = useLocale();

  const [readOnly, setReadOnly] = useState(isViewMode);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isExistingVideo = Boolean(videoId);
  const isEditMode = isExistingVideo && !readOnly;

  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: initialData || {
      title_fr: "",
      title_en: "",
      category: "",
      subCategory: "",
      description_fr: "",
      description_en: "",
      videoFile: undefined,
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
        toast.error("Erreur chargement catégories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!videoId || initialData) return;
    if (categories.length === 0) return;

    const fetchVideo = async () => {
      setLoadingVideo(true);
      try {
        const vid = await adminVideosApi.getById(videoId);
        setVideoData(vid);

        const subCategoryId = vid.category?.id;
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
          title_fr: vid.title_fr || "",
          title_en: vid.title_en || "",
          category: parentCategoryId,
          subCategory: subCategoryId || "",
          description_fr: vid.description_fr || "",
          description_en: vid.description_en || "",
          videoFile: undefined,
        });

        // Charger l'URL de la vidéo depuis Supabase
        if (vid.file_path) {
          const { data: urlData } = await supabase.storage
            .from("videos")
            .createSignedUrl(vid.file_path, 3600);
          if (urlData?.signedUrl) {
            setVideoUrl(urlData.signedUrl);
          }
        }
      } catch {
        toast.error("Erreur chargement vidéo");
      } finally {
        setLoadingVideo(false);
      }
    };
    fetchVideo();
  }, [videoId, initialData, categories, form]);

  const availableSubCategories = useMemo(() => {
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId,
    );
    return selectedCategory?.subcategories || [];
  }, [categories, selectedCategoryId]);

  const handleDelete = async () => {
    if (!videoId) return;
    setIsDeleting(true);
    try {
      await adminVideosApi.delete(videoId);
      toast.success("Vidéo supprimée");
      router.push("/dashboard/videos");
    } catch (error: any) {
      toast.error(error.message || "Erreur suppression");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const onSubmit = async (data: VideoFormValues) => {
    try {
      const payload = {
        category_id: data.subCategory,
        title_fr: data.title_fr,
        title_en: data.title_en,
        description_fr: data.description_fr || "",
        description_en: data.description_en || "",
        is_published: true,
      };

      if (isExistingVideo && videoId) {
        await adminVideosApi.update(videoId, payload, data.videoFile);
        toast.success("Vidéo mise à jour");
        setReadOnly(true);
      } else {
        await adminVideosApi.create(payload, data.videoFile);
        toast.success("Vidéo créée");
        router.push("/dashboard/videos");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur");
    }
  };

  if (loadingVideo) {
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
        href="/dashboard/videos"
        className="inline-flex pt-2 pl-6 items-center text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {readOnly
                ? "Détails vidéo"
                : isEditMode
                  ? "Modifier vidéo"
                  : "Ajouter vidéo"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {readOnly
                ? "Consultation"
                : isEditMode
                  ? "Modification"
                  : "Nouvelle vidéo"}
            </p>
          </div>

          {readOnly && isExistingVideo && (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2 border-slate-200"
                onClick={() => setReadOnly(false)}
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="gap-2"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* LECTEUR VIDÉO - visible seulement en mode lecture */}
        {readOnly && videoUrl && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                🎬 Lecture vidéo
              </h3>
              <span className="text-sm text-slate-500">
                {videoData?.title_fr || ""}
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full max-h-[500px]"
                poster={videoData?.thumbnail_path || undefined}
                style={{ backgroundColor: "#000" }}
              >
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" /> Lecture
              </span>
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Son
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> Plein écran disponible
              </span>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre (FR)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre en français"
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
                    <FormLabel>Titre (EN)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre en anglais"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
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
                          <SelectValue placeholder="Choisir une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>
                            Chargement...
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
                    <FormLabel>Sous-catégorie</FormLabel>
                    <Select
                      disabled={readOnly || !selectedCategoryId}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200">
                          <SelectValue placeholder="Choisir une sous-catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubCategories.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            Aucune
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description_fr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (FR)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description en français"
                        className="min-h-24 bg-slate-50/50 border-slate-200"
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
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (EN)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description en anglais"
                        className="min-h-24 bg-slate-50/50 border-slate-200"
                        disabled={readOnly}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!readOnly && (
              <FormField
                control={form.control}
                name="videoFile"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>🎬 Fichier vidéo (MP4)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="video/mp4,video/webm,video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
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

            {!readOnly && (
              <div className="flex justify-end pt-6 mt-8 border-t border-slate-100 gap-3">
                {isEditMode && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 px-6 border-slate-200"
                    onClick={() => setReadOnly(true)}
                  >
                    Annuler
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
                  {isEditMode ? "Mettre à jour" : "Publier"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4 text-xl">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              Supprimer cette vidéo ?
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Cette action est irréversible.
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
              Annuler
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
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
