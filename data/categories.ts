export interface LocalizedCategoryName {
  fr: string
  en: string
}

export interface DocumentSubCategory {
  id: string
  localizedName: LocalizedCategoryName
}

export interface DocumentCategory {
  id: string
  localizedName: LocalizedCategoryName
  subCategories: DocumentSubCategory[]
  updatedAt: string
}

export const documentCategoriesData: DocumentCategory[] = [
  {
    id: "cat-1",
    localizedName: { fr: "Fiscalite", en: "Tax" },
    subCategories: [
      { id: "sub-1", localizedName: { fr: "Declarations", en: "Filings" } },
      { id: "sub-2", localizedName: { fr: "TVA", en: "VAT" } },
      { id: "sub-3", localizedName: { fr: "Controles fiscaux", en: "Tax audits" } },
    ],
    updatedAt: "2026-03-21",
  },
  {
    id: "cat-2",
    localizedName: { fr: "Juridique", en: "Legal" },
    subCategories: [
      { id: "sub-4", localizedName: { fr: "Droit du travail", en: "Labor law" } },
      { id: "sub-5", localizedName: { fr: "Contentieux", en: "Litigation" } },
      { id: "sub-6", localizedName: { fr: "Contrats", en: "Contracts" } },
    ],
    updatedAt: "2026-04-01",
  },
  {
    id: "cat-3",
    localizedName: { fr: "Comptabilite", en: "Accounting" },
    subCategories: [
      { id: "sub-7", localizedName: { fr: "Bilan", en: "Balance sheet" } },
      { id: "sub-8", localizedName: { fr: "Cloture mensuelle", en: "Month end" } },
    ],
    updatedAt: "2026-04-08",
  },
]