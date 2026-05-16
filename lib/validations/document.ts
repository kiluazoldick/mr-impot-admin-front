import * as z from "zod"

interface DocumentSchemaOptions {
  requireFiles?: boolean
}

export const getDocumentSchema = (
  t: (key: string) => string,
  options: DocumentSchemaOptions = {}
) => {
  const requireFiles = options.requireFiles ?? true

  return z.object({
    title: z.object({
      fr: z.string().trim().min(1, t("title_fr_required")),
      en: z.string().trim().min(1, t("title_en_required")),
    }),
    category: z.string().min(1, t("category_required")),
    subCategory: z.string().min(1, t("sub_category_required")),
    description: z.object({
      fr: z.string().trim().min(1, t("description_fr_required")),
      en: z.string().trim().min(1, t("description_en_required")),
    }),
    fileFr: z.instanceof(File).optional(),
    fileEn: z.instanceof(File).optional(),
  }).superRefine((data, ctx) => {
    if (!requireFiles) {
      return
    }

    if (!data.fileFr && !data.fileEn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("file_required"),
        path: ["fileFr"],
      })
    }
  })
}

export type DocumentFormValues = z.infer<ReturnType<typeof getDocumentSchema>>
