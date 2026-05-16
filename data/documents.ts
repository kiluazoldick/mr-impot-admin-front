import { FileText, Video, UserPlus } from "lucide-react"

export const documentStatsData = [
	{
		titleKey: "total_documents",
		value: "1,235",
		icon: FileText,
		bgColor: "bg-blue-500",
	},
	{
		titleKey: "uploaded_pdf",
		value: "980",
		icon: FileText,
		bgColor: "bg-blue-400",
	},
	{
		titleKey: "uploaded_video",
		value: "540",
		icon: Video,
		bgColor: "bg-blue-400",
	},
	{
		titleKey: "recently_added",
		value: "50",
		icon: UserPlus,
		bgColor: "bg-blue-400",
	},
]

export const documentsData = [
	{
		title: { fr: "Loi sur l'investissement 2025", en: "Investment Act 2025" },
		description: { fr: "Synthese du cadre fiscal 2025.", en: "Summary of the 2025 tax framework." },
		category: "Law",
		subCategory: "Tax Law",
		format: "PDF",
		uploadedOn: "21/01/2024",
	},
	{
		title: { fr: "Decret sur les droits de propriete", en: "Property Rights Decree" },
		description: { fr: "Principes cles des droits immobiliers.", en: "Key principles of property rights." },
		category: "Decree",
		subCategory: "Real Estate",
		format: "Video",
		uploadedOn: "21/01/2024",
	},
	{
		title: { fr: "Jurisprudence des droits civils 101", en: "Civil Rights Case 101" },
		description: { fr: "Resume des precedents majeurs.", en: "Recap of major precedents." },
		category: "Jurisprudence",
		subCategory: "Human Rights",
		format: "PDF",
		uploadedOn: "21/01/2024",
	},
]
