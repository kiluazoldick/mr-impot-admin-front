import * as z from "zod"

export const getCategorySchema = (t: (key: string) => string) =>
  z
    .object({
      name: z.object({
        fr: z.string().trim().min(1, t("category_name_fr_required")),
        en: z.string().trim().min(1, t("category_name_en_required")),
      }),
      subCategories: z
        .array(
          z.object({
            id: z.string().trim().optional(),
            name: z.object({
              fr: z.string().trim().min(1, t("sub_category_name_fr_required")),
              en: z.string().trim().min(1, t("sub_category_name_en_required")),
            }),
          })
        )
        .min(1, t("at_least_one_sub_category")),
    })
    .superRefine((values, ctx) => {
      const normalizedFr = values.subCategories.map((item) => item.name.fr.trim().toLowerCase())
      const normalizedEn = values.subCategories.map((item) => item.name.en.trim().toLowerCase())
      const hasDuplicates =
        new Set(normalizedFr).size !== normalizedFr.length ||
        new Set(normalizedEn).size !== normalizedEn.length

      if (hasDuplicates) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("duplicate_sub_categories"),
          path: ["subCategories"],
        })
      }
    })

export type CategoryFormValues = z.infer<ReturnType<typeof getCategorySchema>>