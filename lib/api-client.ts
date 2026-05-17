const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://mr-impot-backend.vercel.app/api";

interface RequestOptions {
  headers?: Record<string, string>;
  isFormData?: boolean;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sb-access-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function request<T = any>(
  endpoint: string,
  options?: RequestInit & RequestOptions,
): Promise<T> {
  const { isFormData, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
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
    request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<any>("/auth/me"),
};

// ============================================
// ADMIN - CATÉGORIES
// ============================================
export const adminCategoriesApi = {
  getAll: () => request<any[]>("/admin/categories"),

  getById: (id: string) => request<any>(`/admin/categories/${id}`),

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
    request<any>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Record<string, any>) =>
    request<any>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<any>(`/admin/categories/${id}`, { method: "DELETE" }),
};

// ============================================
// ADMIN - DOCUMENTS
// ============================================
export const adminDocumentsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/admin/documents${query}`);
  },

  getById: (id: string) => request<any>(`/admin/documents/${id}`),

  create: async (
    data: {
      category_id: string;
      title_fr: string;
      title_en: string;
      description_fr?: string;
      description_en?: string;
      is_published?: boolean;
      ocr_text?: string;
      ocr_status?: string;
    },
    file?: File,
  ) => {
    let file_path: string | null = null;
    let file_size: number | null = null;

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

    return request<any>("/admin/documents", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        file_path,
        file_size,
        mime_type: file?.type || "application/pdf",
      }),
    });
  },

  update: async (id: string, data: Record<string, any>, file?: File) => {
    let file_path: string | null = null;
    let file_size: number | null = null;

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

    return request<any>(`/admin/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
        ...(file_path && {
          file_path,
          file_size,
          mime_type: file?.type || "application/pdf",
        }),
      }),
    });
  },

  delete: (id: string) =>
    request<any>(`/admin/documents/${id}`, { method: "DELETE" }),

  download: (id: string) =>
    request<any>(`/admin/documents/${id}?download=true`),
};

// ============================================
// ADMIN - VIDÉOS
// ============================================
export const adminVideosApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/admin/videos${query}`);
  },

  getById: (id: string) => request<any>(`/admin/videos/${id}`),

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

    if (file) {
      const { supabase } = await import("@/lib/supabase");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      file_path = uploadData?.path || fileName;
    }

    return request<any>("/admin/videos", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        file_path,
        file_size: file?.size || null,
      }),
    });
  },

  update: async (id: string, data: Record<string, any>, file?: File) => {
    let file_path: string | null = null;

    if (file) {
      const { supabase } = await import("@/lib/supabase");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("videos")
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      file_path = uploadData?.path || fileName;
    }

    return request<any>(`/admin/videos/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
        ...(file_path && { file_path, file_size: file?.size || null }),
      }),
    });
  },

  delete: (id: string) =>
    request<any>(`/admin/videos/${id}`, { method: "DELETE" }),
};

// ============================================
// PUBLIC
// ============================================
export const publicApi = {
  getCategories: () => request<any>("/public/categories"),

  getDocuments: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/public/documents${query}`);
  },

  getDocument: (id: string) => request<any>(`/public/documents/${id}`),

  downloadDocument: (id: string) =>
    request<any>(`/public/documents/${id}?download=true`),

  getVideos: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/public/videos${query}`);
  },

  getVideo: (id: string) => request<any>(`/public/videos/${id}`),
};

// ============================================
// ADMIN - USERS
// ============================================
export const adminUsersApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any>(`/admin/users${query}`);
  },
  getById: (id: string) => request<any>(`/admin/users/${id}`),
  updateStatus: (id: string, status: string) =>
    request<any>(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};
