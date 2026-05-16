import * as z from "zod";

export const getArticleSchema = (t: (key: string) => string) =>
  z.object({
    title_fr: z.string().min(1, t("title_fr_required")),
    title_en: z.string().min(1, t("title_en_required")),
    category: z.string().min(1, t("category_required")),
    subCategory: z.string().min(1, t("sub_category_required")),
    content_fr: z.string().min(1, t("content_fr_required")),
    content_en: z.string().min(1, t("content_en_required")),
    pdfFile: z.any().optional(),
  });

export type ArticleFormValues = z.infer<ReturnType<typeof getArticleSchema>>;
