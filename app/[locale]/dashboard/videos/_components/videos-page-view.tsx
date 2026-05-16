"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Search, Eye, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "../../_components/page-header";
import { PrimaryButton } from "../../_components/primary-button";
import { adminVideosApi } from "@/lib/api-client";
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

interface VideoRow {
  id: string;
  title_fr: string;
  title_en: string;
  category?: string;
  created_at: string;
  is_published: boolean;
}

const PAGE_SIZE = 10;

export function VideosPageView() {
  const t = useTranslations("Dashboard.Videos");
  const tPage = useTranslations("Dashboard.Documents.pagination");
  const locale = useLocale();

  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const result = await adminVideosApi.getAll({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      const list = (result.data || []).map((vid: any) => ({
        id: vid.id,
        title_fr: vid.title_fr || "",
        title_en: vid.title_en || "",
        category: vid.category
          ? locale === "fr"
            ? vid.category.name_fr
            : vid.category.name_en
          : "-",
        created_at: vid.created_at,
        is_published: vid.is_published,
      }));

      setVideos(list);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load videos:", error);
      if (error.message === "Token invalide") {
        toast.error("Session expirée");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, locale]);

  const filteredData = useMemo(
    () =>
      videos.filter(
        (video) =>
          video.title_fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.title_en.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [videos, searchTerm],
  );

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
          <Link href="/dashboard/videos/add">
            <PrimaryButton icon={Plus}>{t("add_video")}</PrimaryButton>
          </Link>
        }
      />

      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#33a1db] hover:bg-[#33a1db]">
                <TableHead className="text-white font-medium">
                  {t("table.title")}
                </TableHead>
                <TableHead className="text-white font-medium">
                  {t("table.category")}
                </TableHead>
                <TableHead className="text-white font-medium">
                  {t("table.status")}
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
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-48" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-16" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 bg-slate-200 rounded-full ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    {t("no_videos")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((video) => (
                  <TableRow key={video.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {locale === "fr" ? video.title_fr : video.title_en}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {video.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${video.is_published ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-yellow-50 text-yellow-700 ring-yellow-600/20"} ring-1 ring-inset`}
                      >
                        {video.is_published ? "Publié" : "Brouillon"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(video.created_at).toLocaleDateString(locale)}
                    </TableCell>
                    <TableCell className="pr-6">
                      <Link href={`/dashboard/videos/${video.id}`}>
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

        <div className="py-4 flex items-center justify-between flex-wrap gap-4">
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
                  className="h-8 shadow-sm text-slate-600"
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
                          ? "h-8 w-8 bg-[#33a1db] text-white"
                          : "h-8 w-8 border border-slate-200 text-slate-600"
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
                  className="h-8 shadow-sm text-slate-600"
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
