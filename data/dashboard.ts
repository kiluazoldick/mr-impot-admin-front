import { Users, FileText, Download, Search } from "lucide-react"

export const userChartData = [
	{ name: 'Jan', "Active Users": 130, "New Users": 200, "Downloads": 120, "Searches": 70 },
	{ name: 'Feb', "Active Users": 100, "New Users": 150, "Downloads": 80, "Searches": 40 },
	{ name: 'Mar', "Active Users": 140, "New Users": 180, "Downloads": 140, "Searches": 90 },
	{ name: 'Apr', "Active Users": 90, "New Users": 120, "Downloads": 160, "Searches": 110 },
	{ name: 'May', "Active Users": 110, "New Users": 210, "Downloads": 90, "Searches": 40 },
	{ name: 'Jun', "Active Users": 130, "New Users": 190, "Downloads": 160, "Searches": 120 },
	{ name: 'Jul', "Active Users": 160, "New Users": 200, "Downloads": 140, "Searches": 100 },
	{ name: 'Aug', "Active Users": 140, "New Users": 220, "Downloads": 90, "Searches": 70 },
	{ name: 'Sep', "Active Users": 150, "New Users": 190, "Downloads": 180, "Searches": 120 },
	{ name: 'Oct', "Active Users": 140, "New Users": 180, "Downloads": 130, "Searches": 70 },
	{ name: 'Nov', "Active Users": 240, "New Users": 210, "Downloads": 90, "Searches": 50 },
	{ name: 'Dec', "Active Users": 120, "New Users": 180, "Downloads": 110, "Searches": 70 },
]

export const userChartDataWeekly = [
	{ name: 'Mon', "Active Users": 40, "New Users": 60, "Downloads": 30, "Searches": 20 },
	{ name: 'Tue', "Active Users": 50, "New Users": 50, "Downloads": 40, "Searches": 30 },
	{ name: 'Wed', "Active Users": 70, "New Users": 80, "Downloads": 60, "Searches": 50 },
	{ name: 'Thu', "Active Users": 60, "New Users": 70, "Downloads": 50, "Searches": 40 },
	{ name: 'Fri', "Active Users": 90, "New Users": 100, "Downloads": 80, "Searches": 60 },
	{ name: 'Sat', "Active Users": 110, "New Users": 120, "Downloads": 90, "Searches": 80 },
	{ name: 'Sun', "Active Users": 130, "New Users": 140, "Downloads": 110, "Searches": 90 },
]

export const dashboardStatsData = [
	{
		titleKey: "total_users",
		value: "1245",
		icon: Users,
		bgColor: "bg-blue-500",
	},
	{
		titleKey: "documents_uploaded",
		value: "80",
		icon: FileText,
		bgColor: "bg-blue-400",
	},
	{
		titleKey: "downloads_today",
		value: "30",
		icon: Download,
		bgColor: "bg-blue-400",
	},
	{
		titleKey: "searches_today",
		value: "50",
		icon: Search,
		bgColor: "bg-blue-400",
	},
]

export const recentActivitiesData = [
	{ name: "John D.", actionKey: "downloaded", target: "Tax Law 2025", timeValue: 2 },
	{ name: "Marie K.", actionKey: "searched", target: "Criminal Law", timeValue: 20 },
	{ name: "John D.", actionKey: "downloaded", target: "Tax Law 2025", timeValue: 2 },
	{ name: "Marie K.", actionKey: "searched", target: "Criminal Law", timeValue: 2 },
]
