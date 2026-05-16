"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Search, Eye, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminDocumentsApi } from "@/lib/api-client";
import { PageHeader } from "../../_components/page-header";
import { StatCards, StatData } from "../../_components/stat-cards";
import { PrimaryButton } from "../../_components/primary-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  title_fr: string;
  title_en: string;
  category?: { id: string; name_fr: string; name_en: string };
  created_at: string;
  is_published: boolean;
}

const PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 5;

export function DocumentsPageView() {
  const t = useTranslations("Dashboard.Documents");
  const tPage = useTranslations("Dashboard.Documents.pagination");
  const locale = useLocale();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const result = await adminDocumentsApi.getAll({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      setDocuments(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotal(result.total || 0);
    } catch {
      toast.error(t("list_error_message"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page]);

  const stats: StatData[] = [
    {
      title: "Total documents",
      value: total,
      icon: Plus,
      bgColor: "bg-blue-50",
    },
  ];

  const startEntry = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry = Math.min(total, page * PAGE_SIZE);

  const visiblePages = (() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return Array.from({ length: MAX_VISIBLE_PAGES }, (_, i) => start + i);
  })();

  return (
    <motion.div
      className="flex-1 space-y-4 max-w-350 mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Link href="/dashboard/documents/add">
            <PrimaryButton icon={Plus}>{t("add_document")}</PrimaryButton>
          </Link>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <StatCards items={stats} />
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 px-1 mb-4">
          {t("list_of_all_documents")}
        </h2>

        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t("search_placeholder")}
              className="pl-10 h-10 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#33a1db] hover:bg-[#33a1db]">
                <TableHead className="text-white font-medium pl-6">
                  {t("table.title")}
                </TableHead>
                <TableHead className="text-white font-medium">
                  {t("table.sub_category")}
                </TableHead>
                <TableHead className="text-white font-medium">
                  {t("table.format")}
                </TableHead>
                <TableHead className="text-white font-medium">
                  {t("table.uploaded_on")}
                </TableHead>
                <TableHead className="text-white font-medium pr-6">
                  {t("table.action")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx} className="animate-pulse">
                    <TableCell className="pl-6 py-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="h-8 w-8 bg-slate-200 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t("no_documents")}
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900 pl-6 py-4">
                      {locale === "fr" ? doc.title_fr : doc.title_en}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {doc.category
                        ? locale === "fr"
                          ? doc.category.name_fr
                          : doc.category.name_en
                        : "-"}
                    </TableCell>
                    <TableCell className="text-slate-600">PDF</TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(doc.created_at).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Link href={`/dashboard/documents/${doc.id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-slate-100 text-slate-600 rounded-full h-8 w-8"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-slate-500 font-medium">
            {tPage("showing_entries", {
              start: startEntry,
              end: endEntry,
              total,
            })}
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="h-8 shadow-sm text-slate-600 font-medium"
                  text={tPage("previous")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {visiblePages.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === page}
                    className={
                      pageNumber === page
                        ? "h-8 w-8 bg-[#33a1db] text-white"
                        : "h-8 w-8 border border-slate-200 text-slate-600"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="h-8 shadow-sm text-slate-600 font-medium"
                  text={tPage("next")}
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </motion.div>
  );
}
