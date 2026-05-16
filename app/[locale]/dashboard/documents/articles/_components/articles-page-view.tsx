"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Search, Eye, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../../../_components/page-header";
import { PrimaryButton } from "../../../_components/primary-button";
import { adminDocumentsApi } from "@/lib/api-client";
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

interface ArticleRow {
  id: string;
  title_fr: string;
  title_en: string;
  category?: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export function ArticlesPageView() {
  const t = useTranslations("Dashboard.Articles");
  const tPage = useTranslations("Dashboard.Documents.pagination");
  const locale = useLocale();

  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const result = await adminDocumentsApi.getAll({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      const list = (result.data || []).map((doc: any) => ({
        id: doc.id,
        title_fr: doc.title_fr || "",
        title_en: doc.title_en || "",
        category: doc.category
          ? locale === "fr"
            ? doc.category.name_fr
            : doc.category.name_en
          : "-",
        created_at: doc.created_at,
      }));

      setArticles(list);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load articles:", error);
      if (
        error.message === "Token invalide" ||
        error.message === "Non authentifié"
      ) {
        toast.error("Session expirée, veuillez vous reconnecter");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, locale]);

  const filteredData = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.title_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.title_en.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [articles, searchTerm],
  );

  return (
    <motion.div
      className="flex flex-col space-y-4 max-w-350 w-full mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <PageHeader
        title={t("title")}
        description={t("subtitle")}
        action={
          <Link href="/dashboard/documents/articles/add">
            <PrimaryButton icon={Plus} className="cursor-pointer">
              {t("Add.title")}
            </PrimaryButton>
          </Link>
        }
      />

      <div className="flex-1 flex flex-col space-y-4 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200"
            />
          </div>
          <Button
            variant="outline"
            className="h-11 border-slate-200 self-start md:self-auto gap-2"
          >
            <Filter className="w-4 h-4" />
            {t("filter")}
          </Button>
        </div>

        <div className="rounded-lg border border-slate-100 overflow-auto">
          <Table>
            <TableHeader className="bg-[#33a1db] hover:bg-[#33a1db] sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-semibold text-white h-12">
                  {t("table.title")}
                </TableHead>
                <TableHead className="font-semibold text-white">
                  {t("table.category")}
                </TableHead>
                <TableHead className="font-semibold text-white">
                  {t("table.uploaded_on")}
                </TableHead>
                <TableHead className="text-right pr-6 font-semibold text-white">
                  {t("table.action")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-48" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 bg-slate-200 rounded w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-32 text-center text-slate-500"
                  >
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((article) => (
                  <TableRow
                    key={article.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900">
                      {locale === "fr" ? article.title_fr : article.title_en}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {article.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(article.created_at).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Link
                        href={`/dashboard/documents/articles/${article.id}`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-slate-100 text-slate-600"
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

        <div className="flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-slate-500 font-medium">
            {tPage("showing_entries", {
              start: (page - 1) * PAGE_SIZE + 1,
              end: Math.min(page * PAGE_SIZE, total),
              total,
            })}
          </p>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === page}
                      className={
                        pageNum === page
                          ? "bg-[#33a1db] text-white"
                          : "bg-white border-slate-200 text-slate-600"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm"
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
