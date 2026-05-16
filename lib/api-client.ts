const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mr-impot-backend.vercel.app/api";

interface RequestOptions {
  headers?: Record<string, string>;
  isFormData?: boolean;
}

async function request<T>(
  endpoint: string,
  options?: RequestInit & RequestOptions,
): Promise<T> {
  const { isFormData, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Ne pas mettre Content-Type pour FormData (le navigateur le fait avec boundary)
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Envoyer les cookies de session
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Erreur réseau" }));
    throw new Error(error.error || `Erreur ${response.status}`);
  }

  return response.json();
}

// ============================================
// AUTH
// ============================================
export const authApi = {
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request("/auth/me"),
};

// ============================================
// ADMIN - CATÉGORIES
// ============================================
export const adminCategoriesApi = {
  getAll: () => request("/admin/categories"),

  getById: (id: string) => request(`/admin/categories/${id}`),

  create: (data: {
    name_fr: string;
    name_en: string;
    slug: string;
    parent_id?: string | null;
    description_fr?: string;
    description_en?: string;
    icon?: string;
    sort_order?: number;
    is_active?: boolean;
  }) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, any>) =>
    request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request(`/admin/categories/${id}`, { method: "DELETE" }),
};

// ============================================
// ADMIN - DOCUMENTS
// ============================================
export const adminDocumentsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/admin/documents${query}`);
  },

  getById: (id: string) => request(`/admin/documents/${id}`),

  create: async (
    data: {
      category_id: string;
      title_fr: string;
      title_en: string;
      description_fr?: string;
      description_en?: string;
      is_published?: boolean;
    },
    file?: File,
  ) => {
    let file_path: string | null = null;
    let file_size: number | null = null;

    // Upload direct vers Supabase Storage
    if (file) {
      const { supabase } = await import("@/lib/supabase");

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      file_path = uploadData?.path || fileName;
      file_size = file.size;
    }

    // Envoyer les métadonnées au backend
    return request("/admin/documents", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        file_path,
        file_size,
        mime_type: file?.type || "application/pdf",
      }),
    });
  },

  update: (id: string, data: Record<string, any>, file?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (file) formData.append("file", file);
    return request(`/admin/documents/${id}`, {
      method: "PUT",
      body: formData,
      isFormData: true,
    });
  },

  delete: (id: string) =>
    request(`/admin/documents/${id}`, { method: "DELETE" }),

  download: (id: string) => request(`/admin/documents/${id}?download=true`),
};

// ============================================
// ADMIN - VIDÉOS
// ============================================
export const adminVideosApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/admin/videos${query}`);
  },

  getById: (id: string) => request(`/admin/videos/${id}`),

  create: (
    data: {
      category_id: string;
      title_fr: string;
      title_en: string;
      description_fr?: string;
      description_en?: string;
      is_published?: boolean;
    },
    file?: File,
  ) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (file) formData.append("file", file);
    return request("/admin/videos", {
      method: "POST",
      body: formData,
      isFormData: true,
    });
  },

  update: (id: string, data: Record<string, any>, file?: File) => {
    // Si pas de fichier, envoyer en JSON simple
    if (!file) {
      return request(`/admin/videos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }
    // Si fichier, envoyer en FormData
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    formData.append("file", file);
    return request(`/admin/videos/${id}`, {
      method: "PUT",
      body: formData,
      isFormData: true,
    });
  },

  delete: (id: string) => request(`/admin/videos/${id}`, { method: "DELETE" }),
};

// ============================================
// PUBLIC
// ============================================
export const publicApi = {
  getCategories: () => request("/public/categories"),

  getDocuments: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/public/documents${query}`);
  },

  getDocument: (id: string) => request(`/public/documents/${id}`),

  downloadDocument: (id: string) =>
    request(`/public/documents/${id}?download=true`),

  getVideos: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/public/videos${query}`);
  },

  getVideo: (id: string) => request(`/public/videos/${id}`),
};

// ============================================
// DASHBOARD
// ============================================
export const dashboardApi = {
  getStats: () => request("/admin/dashboard/stats"),
  getRecentActivity: () => request("/admin/dashboard/recent-activity"),
  getChartData: () => request("/admin/dashboard/chart-data"),
};

// ============================================
// ADMIN - USERS
// ============================================
export const adminUsersApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/admin/users${query}`);
  },
  getById: (id: string) => request(`/admin/users/${id}`),
  updateStatus: (id: string, status: string) =>
    request(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
