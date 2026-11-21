import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTabRefetch } from "@/hooks/useTabRefetch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Gamepad2,
  Folder,
  X,
  Check,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, BACKEND_BASE_URL } from "@/lib/constants";
import axios from "axios";

const GAMES_PER_PAGE = 24;
const MANAGEMENT_GAMES_PER_PAGE = 12;

const buildPaginationRange = (currentPage: number, totalPages: number) => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const range: (number | "ellipsis-left" | "ellipsis-right")[] = [];
  range.push(1);

  const left = Math.max(2, currentPage - 2);
  const right = Math.min(totalPages - 1, currentPage + 2);

  if (left > 2) {
    range.push("ellipsis-left");
  }

  for (let page = left; page <= right; page++) {
    range.push(page);
  }

  if (right < totalPages - 1) {
    range.push("ellipsis-right");
  }

  range.push(totalPages);
  return range;
};

interface Game {
  name: string;
  code: string;
  providers: string[];
  categories: string[];
  images: {
    size1?: string;
    [key: string]: string | undefined;
  };
}

interface GamesResponse {
  allGames: Game[];
  categories: string[];
  categoriesData: {
    images: Record<string, string>;
  };
  layout: any[];
  page: number;
  page_size: number;
  providers: string[];
  providersData: {
    images: Record<string, string>;
  };
  sidebarGamesOptions: any[];
  totalGames: number;
}

interface GameCategory {
  id: number;
  name: string;
  description: string;
  image_url: string;
  icon_url: string;
  is_active: boolean;
  game_names: string[];
  provider_names: string[];
}

interface GameDB {
  id: number;
  name: string;
  label: string;
  provider_name: string;
  image_path: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_ids?: number[];
}

interface GameDBPage {
  games: GameDB[];
  total: number;
  page: number;
  page_size: number;
}

interface ProviderDB {
  id: number;
  name: string;
  image_path: string;
  icon_path?: string;
  is_active: boolean;
  games_count?: number;
  created_at: string;
  updated_at: string;
}

function getGameProvider(game: Game): string {
  return game.providers?.[0] ?? "";
}

function getGameImageUrl(game: Game): string {
  return game.images?.size1 ?? "";
}

function buildGameImageSrc(imagePath: string, backendBaseUrl: string): string {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${backendBaseUrl}/${cleanPath}`;
}

function buildGamesByProvider(allGames: Game[]): Record<string, Game[]> {
  const map: Record<string, Game[]> = {};
  for (const game of allGames) {
    for (const provider of game.providers ?? []) {
      if (!map[provider]) map[provider] = [];
      map[provider].push(game);
    }
  }
  return map;
}

export default function GamesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GameCategory | null>(null);
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<GameDB | null>(null);
  const [gameName, setGameName] = useState("");
  const [gameLabel, setGameLabel] = useState("");
  const [gameProvider, setGameProvider] = useState("");
  const [gameImagePath, setGameImagePath] = useState("");
  const [gameIsActive, setGameIsActive] = useState(true);
  const [gameCategoryIds, setGameCategoryIds] = useState<number[]>([]);
  const [uploadingGameImage, setUploadingGameImage] = useState(false);
  const gameImageInputRef = useRef<HTMLInputElement>(null);

  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ProviderDB | null>(null);
  const [providerName, setProviderName] = useState("");
  const [providerImagePath, setProviderImagePath] = useState("");
  const [providerIconPath, setProviderIconPath] = useState("");
  const [providerIsActive, setProviderIsActive] = useState(true);
  const [uploadingProviderImage, setUploadingProviderImage] = useState(false);
  const [uploadingProviderIcon, setUploadingProviderIcon] = useState(false);
  const providerImageInputRef = useRef<HTMLInputElement>(null);
  const providerIconInputRef = useRef<HTMLInputElement>(null);

  const { activeTab, setActiveTab, handleTabChange } = useTabRefetch("games-list", [
    "/api/v1/games",
    "/api/v1/games/categories",
    "/api/v1/games/manage",
    "/api/v1/games/providers",
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [managementPage, setManagementPage] = useState(1);

  const { data: gamesData, isLoading, refetch } = useQuery<GamesResponse>({
    queryKey: ["/api/v1/games", currentPage, GAMES_PER_PAGE, providerFilter],
    queryFn: async () => {
      const response = await axios.get<GamesResponse>(`${API_BASE_URL}/games`, {
        params: {
          page: currentPage,
          page_size: GAMES_PER_PAGE,
          ...(providerFilter && providerFilter !== "all"
            ? { provider: providerFilter }
            : {}),
        },
      });
      return response.data;
    },
  });

  const gamesByProvider = useMemo(
    () => buildGamesByProvider(gamesData?.allGames ?? []),
    [gamesData?.allGames]
  );

  const { data: categories, refetch: refetchCategories } = useQuery<GameCategory[]>({
    queryKey: ["/api/v1/games/categories"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ success: boolean; data: GameCategory[] }>(
        `${API_BASE_URL}/games/categories`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data.data;
    },
    enabled: activeTab === "categories",
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      image_url?: string;
      icon_url?: string;
      provider_names?: string[];
      games?: Array<{ name: string; provider: string }>;
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/games/categories`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Category created successfully" });
      setIsCategoryDialogOpen(false);
      refetchCategories();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating category",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        name?: string;
        description?: string;
        image_url?: string;
        icon_url?: string;
        is_active?: boolean;
        provider_names?: string[];
        games?: Array<{ name: string; provider: string }>;
      };
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/games/categories/${id}`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Category updated successfully" });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      refetchCategories();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating category",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/games/categories/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      toast({ title: "Category deleted successfully" });
      refetchCategories();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting category",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const totalGames = gamesData?.totalGames ?? gamesData?.allGames?.length ?? 0;

  const {
    data: dbGamesPage,
    refetch: refetchDBGames,
    isLoading: isLoadingDBGames,
  } = useQuery<GameDBPage>({
    queryKey: ["/api/v1/games/manage", managementPage, MANAGEMENT_GAMES_PER_PAGE],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get<{
        success: boolean;
        data: GameDB[];
        total?: number;
        page?: number;
        page_size?: number;
      }>(`${API_BASE_URL}/games/manage`, {
        params: {
          page: managementPage,
          page_size: MANAGEMENT_GAMES_PER_PAGE,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const payload = response.data;
      const total = payload.total ?? payload.data.length;

      return {
        games: payload.data,
        total,
        page: payload.page ?? managementPage,
        page_size: payload.page_size ?? MANAGEMENT_GAMES_PER_PAGE,
      };
    },
    enabled: activeTab === "game-management",
  });

  const dbGames = dbGamesPage?.games || [];
  const totalDBGames = dbGamesPage?.total || 0;

  const createGameMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      label: string;
      provider_name: string;
      image_path?: string;
      category_ids?: number[];
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/games/manage`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Game created successfully" });
      setIsGameDialogOpen(false);
      resetGameForm();
      refetchDBGames();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating game",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const updateGameMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        label?: string;
        provider_name?: string;
        image_path?: string;
        is_active?: boolean;
        category_ids?: number[];
      };
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/games/manage/${id}`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Game updated successfully" });
      setIsGameDialogOpen(false);
      setEditingGame(null);
      resetGameForm();
      refetchDBGames();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating game",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGameMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/games/manage/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      toast({ title: "Game deleted successfully" });
      refetchDBGames();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting game",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const { data: dbProviders, refetch: refetchProviders } = useQuery<ProviderDB[]>({
    queryKey: ["/api/v1/games/providers"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ success: boolean; data: ProviderDB[] }>(
        `${API_BASE_URL}/games/providers`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data.data;
    },
    enabled: activeTab === "providers",
  });

  const createProviderMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      image_path?: string;
      icon_path?: string;
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/games/providers`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Provider created successfully" });
      setIsProviderDialogOpen(false);
      resetProviderForm();
      refetchProviders();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating provider",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const updateProviderMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        image_path?: string;
        icon_path?: string;
        is_active?: boolean;
      };
    }) => {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/games/providers/${id}`,
        data,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast({ title: "Provider updated successfully" });
      setIsProviderDialogOpen(false);
      setEditingProvider(null);
      resetProviderForm();
      refetchProviders();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating provider",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: number) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/games/providers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: () => {
      toast({ title: "Provider deleted successfully" });
      refetchProviders();
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting provider",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });

  const filteredGames = (gamesData?.allGames || []).filter((game) => {
    const primaryProvider = getGameProvider(game);
    const matchesSearch =
      game.name.toLowerCase().includes(search.toLowerCase()) ||
      game.code.toLowerCase().includes(search.toLowerCase()) ||
      primaryProvider.toLowerCase().includes(search.toLowerCase());
    const matchesProvider =
      providerFilter === "all" || game.providers.includes(providerFilter);
    return matchesSearch && matchesProvider;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, providerFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalGames / GAMES_PER_PAGE));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [totalGames, currentPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalDBGames / MANAGEMENT_GAMES_PER_PAGE));
    if (managementPage > maxPage) {
      setManagementPage(maxPage);
    }
  }, [totalDBGames, managementPage]);

  const totalPages = Math.max(1, Math.ceil(totalGames / GAMES_PER_PAGE));
  const paginatedGames = filteredGames;

  const paginationRange = useMemo(
    () => buildPaginationRange(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const managementTotalPages = Math.max(
    1,
    Math.ceil(totalDBGames / MANAGEMENT_GAMES_PER_PAGE)
  );

  const paginatedDBGames = dbGames;

  const managementPaginationRange = useMemo(
    () => buildPaginationRange(managementPage, managementTotalPages),
    [managementPage, managementTotalPages]
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleManagementPageChange = (page: number) => {
    if (page < 1 || page > managementTotalPages) return;
    setManagementPage(page);
  };

  const paginationStart =
    totalGames === 0 ? 0 : (currentPage - 1) * GAMES_PER_PAGE + 1;
  const paginationEnd = Math.min(currentPage * GAMES_PER_PAGE, totalGames);

  const managementPaginationStart =
    totalDBGames === 0
      ? 0
      : (managementPage - 1) * MANAGEMENT_GAMES_PER_PAGE + 1;
  const managementPaginationEnd = Math.min(
    managementPage * MANAGEMENT_GAMES_PER_PAGE,
    totalDBGames
  );

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setSelectedGames([]);
    setSelectedProviders([]);
    setIsCategoryDialogOpen(true);
  };

  const handleEditCategory = async (category: GameCategory) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ success: boolean; data: GameCategory }>(
        `${API_BASE_URL}/games/categories/${category.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const fullCategory = response.data.data;

      const categoryGames: Game[] = [];
      if (gamesData) {
        (fullCategory.provider_names || []).forEach((provName) => {
          const providerGames = gamesByProvider[provName] || [];
          categoryGames.push(...providerGames);
        });
        (fullCategory.game_names || []).forEach((gameName) => {
          const game = gamesData.allGames.find((g) => g.name === gameName);
          if (
            game &&
            !categoryGames.some(
              (cg) => cg.name === game.name && cg.code === game.code
            )
          ) {
            categoryGames.push(game);
          }
        });
      }

      setSelectedGames(categoryGames);
      setSelectedProviders(fullCategory.provider_names || []);
      setEditingCategory(fullCategory);
      setIsCategoryDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading category",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const resetGameForm = () => {
    setGameName("");
    setGameLabel("");
    setGameProvider("");
    setGameImagePath("");
    setGameIsActive(true);
    setGameCategoryIds([]);
  };

  const resetProviderForm = () => {
    setProviderName("");
    setProviderImagePath("");
    setProviderIconPath("");
    setProviderIsActive(true);
  };

  const handleCreateGame = () => {
    setEditingGame(null);
    resetGameForm();
    setIsGameDialogOpen(true);
  };

  const handleCreateProvider = () => {
    setEditingProvider(null);
    resetProviderForm();
    setIsProviderDialogOpen(true);
  };

  const handleEditProvider = (provider: ProviderDB) => {
    setEditingProvider(provider);
    setProviderName(provider.name);
    setProviderImagePath(provider.image_path || "");
    setProviderIconPath(provider.icon_path || "");
    setProviderIsActive(provider.is_active);
    setIsProviderDialogOpen(true);
  };

  const handleSubmitProvider = () => {
    if (!providerName) {
      toast({
        title: "Validation Error",
        description: "Provider name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingProvider) {
      updateProviderMutation.mutate({
        id: editingProvider.id,
        data: {
          image_path: providerImagePath,
          icon_path: providerIconPath,
          is_active: providerIsActive,
        },
      });
    } else {
      createProviderMutation.mutate({
        name: providerName,
        image_path: providerImagePath,
        icon_path: providerIconPath,
      });
    }
  };

  const handleProviderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProviderImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const response = await axios.post<{ success: boolean; url: string }>(
        `${API_BASE_URL}/games/providers/upload/image`,
        formData,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              }
            : { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setProviderImagePath(response.data.url);
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingProviderImage(false);
      if (providerImageInputRef.current) {
        providerImageInputRef.current.value = "";
      }
    }
  };

  const handleProviderIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProviderIcon(true);
    try {
      const formData = new FormData();
      formData.append("icon", file);

      const token = localStorage.getItem("token");
      const response = await axios.post<{ success: boolean; url: string }>(
        `${API_BASE_URL}/games/providers/upload/icon`,
        formData,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              }
            : { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setProviderIconPath(response.data.url);
      }
    } catch (error: any) {
      console.error("Failed to upload icon:", error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingProviderIcon(false);
      if (providerIconInputRef.current) {
        providerIconInputRef.current.value = "";
      }
    }
  };

  const handleEditGame = async (game: GameDB) => {
    setEditingGame(game);
    setGameName(game.name);
    setGameLabel(game.label);
    setGameProvider(game.provider_name);
    setGameImagePath(game.image_path);
    setGameIsActive(game.is_active);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<{ success: boolean; data: GameDB }>(
        `${API_BASE_URL}/games/manage/${game.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setGameCategoryIds(response.data.data.category_ids || []);
    } catch (error) {
      console.error("Failed to fetch game categories:", error);
    }

    setIsGameDialogOpen(true);
  };

  const handleSubmitGame = () => {
    if (!gameName || !gameLabel || !gameProvider) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingGame) {
      updateGameMutation.mutate({
        id: editingGame.id,
        data: {
          label: gameLabel,
          provider_name: gameProvider,
          image_path: gameImagePath,
          is_active: gameIsActive,
          category_ids: gameCategoryIds,
        },
      });
    } else {
      createGameMutation.mutate({
        name: gameName,
        label: gameLabel,
        provider_name: gameProvider,
        image_path: gameImagePath,
        category_ids: gameCategoryIds,
      });
    }
  };

  const handleGameImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGameImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("token");
      const response = await axios.post<{ success: boolean; url: string }>(
        `${API_BASE_URL}/games/manage/upload/image`,
        formData,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              }
            : { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setGameImagePath(response.data.url);
      }
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingGameImage(false);
      if (gameImageInputRef.current) {
        gameImageInputRef.current.value = "";
      }
    }
  };

  const handleSubmitCategory = (formData: {
    name: string;
    description: string;
    image_url: string;
    icon_url: string;
  }) => {
    const providerGameKeys = new Set<string>();
    selectedProviders.forEach((provName) => {
      const providerGames = gamesByProvider[provName] || [];
      providerGames.forEach((g) => {
        providerGameKeys.add(`${g.name}|${getGameProvider(g)}`);
      });
    });

    const individualGames = selectedGames
      .filter((g) => !providerGameKeys.has(`${g.name}|${getGameProvider(g)}`))
      .map((g) => ({
        name: g.name,
        provider: getGameProvider(g),
      }));

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: {
          ...formData,
          provider_names: selectedProviders.length > 0 ? selectedProviders : undefined,
          games: individualGames.length > 0 ? individualGames : undefined,
        },
      });
    } else {
      createCategoryMutation.mutate({
        ...formData,
        provider_names: selectedProviders.length > 0 ? selectedProviders : undefined,
        games: individualGames.length > 0 ? individualGames : undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage games, providers, and categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateCategory}>
            <Folder className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="games-list">Games List</TabsTrigger>
          <TabsTrigger value="game-management">Game Management</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="games-list" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Games</div>
              <div className="text-2xl font-bold">{totalGames}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Providers</div>
              <div className="text-2xl font-bold">
                {gamesData?.providers?.length || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-2xl font-bold">
                {gamesData?.categories?.length || 0}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Filtered Games</div>
              <div className="text-2xl font-bold">{filteredGames.length}</div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search games by name, code, or provider..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {(gamesData?.providers || []).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {paginatedGames.map((game) => {
                  const imagePath = getGameImageUrl(game);
                  const primaryProvider = getGameProvider(game);
                  return (
                    <div
                      key={`${primaryProvider}-${game.name}`}
                      className="group relative aspect-[4/3] rounded-lg overflow-hidden border bg-card hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <img
                        src={buildGameImageSrc(imagePath, BACKEND_BASE_URL) || `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`}
                        alt={game.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2">
                          <p className="text-white text-xs font-semibold truncate">
                            {game.name}
                          </p>
                          <p className="text-white/80 text-xs truncate">
                            {primaryProvider}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!isLoading && filteredGames.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No games found
              </div>
            )}
            {!isLoading && filteredGames.length > 0 && totalPages > 1 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Showing {paginationStart} - {paginationEnd} of {totalGames} games
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage - 1);
                        }}
                        className={
                          currentPage === 1 ? "pointer-events-none opacity-50" : undefined
                        }
                      />
                    </PaginationItem>
                    {paginationRange.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <PaginationItem key={`${item}-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(currentPage + 1);
                        }}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="game-management" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Game Management</h2>
              <Button onClick={handleCreateGame}>
                <Plus className="h-4 w-4 mr-2" />
                Create Game
              </Button>
            </div>

            {isLoadingDBGames ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedDBGames.map((game) => (
                  <Card key={game.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{game.label}</h3>
                        <p className="text-sm text-muted-foreground">{game.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Provider: {game.provider_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={game.is_active}
                          onCheckedChange={(checked) => {
                            updateGameMutation.mutate({
                              id: game.id,
                              data: { is_active: checked },
                            });
                          }}
                        />
                      </div>
                    </div>
                    <img
                      src={buildGameImageSrc(game.image_path, BACKEND_BASE_URL) || `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`}
                      alt={game.label}
                      className="w-full h-32 object-cover rounded mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`;
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditGame(game)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this game?")) {
                            deleteGameMutation.mutate(game.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
                {(!dbGames || dbGames.length === 0) && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No games found. Create your first game!
                  </div>
                )}
              </div>
            )}

            {!isLoadingDBGames && dbGames && dbGames.length > 0 && managementTotalPages > 1 && (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Showing {managementPaginationStart} - {managementPaginationEnd} of{" "}
                  {totalDBGames} games
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleManagementPageChange(managementPage - 1);
                        }}
                        className={
                          managementPage === 1 ? "pointer-events-none opacity-50" : undefined
                        }
                      />
                    </PaginationItem>
                    {managementPaginationRange.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <PaginationItem key={`${item}-${index}`}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return (
                        <PaginationItem key={item}>
                          <PaginationLink
                            href="#"
                            isActive={item === managementPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handleManagementPageChange(item);
                            }}
                          >
                            {item}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handleManagementPageChange(managementPage + 1);
                        }}
                        className={
                          managementPage === managementTotalPages
                            ? "pointer-events-none opacity-50"
                            : undefined
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Provider Management</h2>
              <Button onClick={handleCreateProvider}>
                <Plus className="h-4 w-4 mr-2" />
                Create Provider
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbProviders?.map((provider) => {
                const gamesCount = provider.games_count ?? 0;

                return (
                  <Card key={provider.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {provider.icon_path ? (
                            <img
                              src={buildGameImageSrc(provider.icon_path, BACKEND_BASE_URL)}
                              alt={provider.name}
                              className="w-6 h-6 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          <h3 className="font-semibold">{provider.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {gamesCount} {gamesCount === 1 ? "game" : "games"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.is_active}
                          onCheckedChange={(checked) => {
                            updateProviderMutation.mutate({
                              id: provider.id,
                              data: { is_active: checked },
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setProviderFilter(provider.name);
                          setActiveTab("games-list");
                        }}
                      >
                        <Gamepad2 className="h-3 w-3 mr-1" />
                        View Games ({gamesCount})
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProvider(provider)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (gamesCount > 0) {
                            confirm(
                              `This provider has ${gamesCount} ${
                                gamesCount === 1 ? "game" : "games"
                              }. ` +
                                `You cannot delete a provider that has games. Please reassign or delete the games first.`
                            );
                          } else {
                            if (confirm("Are you sure you want to delete this provider?")) {
                              deleteProviderMutation.mutate(provider.id);
                            }
                          }
                        }}
                        disabled={gamesCount > 0}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {(!dbProviders || dbProviders.length === 0) && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No providers found. Create your first provider!
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {categories && categories.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Game Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {category.icon_url ? (
                            <img
                              src={buildGameImageSrc(category.icon_url, BACKEND_BASE_URL)}
                              alt={category.name}
                              className="w-6 h-6 object-contain rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this category?")) {
                            deleteCategoryMutation.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isProviderDialogOpen} onOpenChange={setIsProviderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? "Edit Provider" : "Create Provider"}
            </DialogTitle>
            <DialogDescription>
              {editingProvider
                ? "Update provider information"
                : "Add a new provider to the system"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="providerName">Provider Name *</Label>
              <Input
                id="providerName"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g., PRAGMATICPLAY"
                disabled={!!editingProvider}
              />
              {editingProvider && (
                <p className="text-xs text-muted-foreground mt-1">
                  Provider name cannot be changed after creation
                </p>
              )}
            </div>

            <div>
              <Label>Provider Icon</Label>
              <input
                type="file"
                ref={providerIconInputRef}
                accept="image/*"
                onChange={handleProviderIconUpload}
                className="hidden"
              />
              <div className="space-y-2">
                {providerIconPath ? (
                  <div className="relative group">
                    <img
                      src={
                        providerIconPath.startsWith("http")
                          ? providerIconPath
                          : `${BACKEND_BASE_URL}${providerIconPath}`
                      }
                      alt="Provider icon"
                      className="w-full h-24 object-contain rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => providerIconInputRef.current?.click()}
                        disabled={uploadingProviderIcon}
                      >
                        {uploadingProviderIcon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setProviderIconPath("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    onClick={() => providerIconInputRef.current?.click()}
                    disabled={uploadingProviderIcon}
                  >
                    {uploadingProviderIcon ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6" />
                        <span>Upload Icon</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="providerIsActive"
                checked={providerIsActive}
                onCheckedChange={setProviderIsActive}
              />
              <Label htmlFor="providerIsActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProviderDialogOpen(false);
                setEditingProvider(null);
                resetProviderForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitProvider}
              disabled={
                createProviderMutation.isPending || updateProviderMutation.isPending
              }
            >
              {(createProviderMutation.isPending ||
                updateProviderMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingProvider ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        editingCategory={editingCategory}
        gamesData={gamesData}
        gamesByProvider={gamesByProvider}
        selectedGames={selectedGames}
        setSelectedGames={setSelectedGames}
        selectedProviders={selectedProviders}
        setSelectedProviders={setSelectedProviders}
        onSubmit={handleSubmitCategory}
        isLoading={
          createCategoryMutation.isPending || updateCategoryMutation.isPending
        }
      />

      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? "Edit Game" : "Create Game"}
            </DialogTitle>
            <DialogDescription>
              {editingGame
                ? "Update game information and settings"
                : "Add a new game to the system"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="gameName">Game Name *</Label>
              <Input
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="e.g., 5_ghosts"
                disabled={!!editingGame}
              />
              {editingGame && (
                <p className="text-xs text-muted-foreground mt-1">
                  Game name cannot be changed after creation
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="gameLabel">Game Label *</Label>
              <Input
                id="gameLabel"
                value={gameLabel}
                onChange={(e) => setGameLabel(e.target.value)}
                placeholder="e.g., 5 Ghosts"
              />
            </div>

            <div>
              <Label htmlFor="gameProvider">Provider *</Label>
              <Select value={gameProvider} onValueChange={setGameProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {dbProviders?.filter((p) => p.is_active).map((provider) => (
                    <SelectItem key={provider.name} value={provider.name}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!dbProviders || dbProviders.length === 0) && (
                <p className="text-xs text-muted-foreground mt-1">
                  No providers available. Please create a provider first.
                </p>
              )}
            </div>

            <div>
              <Label>Game Image</Label>
              <input
                type="file"
                ref={gameImageInputRef}
                accept="image/*"
                onChange={handleGameImageUpload}
                className="hidden"
              />
              <div className="space-y-2">
                {gameImagePath ? (
                  <div className="relative group">
                    <img
                      src={
                        gameImagePath.startsWith("http")
                          ? gameImagePath
                          : `${BACKEND_BASE_URL}${gameImagePath}`
                      }
                      alt="Game image"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => gameImageInputRef.current?.click()}
                        disabled={uploadingGameImage}
                      >
                        {uploadingGameImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setGameImagePath("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    onClick={() => gameImageInputRef.current?.click()}
                    disabled={uploadingGameImage}
                  >
                    {uploadingGameImage ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6" />
                        <span>Upload Image</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                {categories?.map((category) => {
                  const isSelected = gameCategoryIds.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                        isSelected ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setGameCategoryIds(
                            gameCategoryIds.filter((id) => id !== category.id)
                          );
                        } else {
                          setGameCategoryIds([...gameCategoryIds, category.id]);
                        }
                      }}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected ? "bg-primary border-primary" : ""
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="gameIsActive"
                checked={gameIsActive}
                onCheckedChange={setGameIsActive}
              />
              <Label htmlFor="gameIsActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGameDialogOpen(false);
                setEditingGame(null);
                resetGameForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitGame}
              disabled={
                createGameMutation.isPending || updateGameMutation.isPending
              }
            >
              {(createGameMutation.isPending || updateGameMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editingGame ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CategoryDialog({
  open,
  onOpenChange,
  editingCategory,
  gamesData,
  gamesByProvider,
  selectedGames,
  setSelectedGames,
  selectedProviders,
  setSelectedProviders,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: GameCategory | null;
  gamesData: GamesResponse | undefined;
  gamesByProvider: Record<string, Game[]>;
  selectedGames: Game[];
  setSelectedGames: (games: Game[]) => void;
  selectedProviders: string[];
  setSelectedProviders: (providers: string[]) => void;
  onSubmit: (data: {
    name: string;
    description: string;
    image_url: string;
    icon_url: string;
  }) => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [tempProvider, setTempProvider] = useState<string>("");
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (editingCategory) {
        setName(editingCategory.name);
        setDescription(editingCategory.description || "");
        setImageUrl(editingCategory.image_url || "");
        setIconUrl(editingCategory.icon_url || "");
      } else {
        setName("");
        setDescription("");
        setImageUrl("");
        setIconUrl("");
        setSelectedGames([]);
        setSelectedProviders([]);
      }
    }
  }, [open, editingCategory]);

  const handleAddProvider = () => {
    if (tempProvider && gamesData && !selectedProviders.includes(tempProvider)) {
      setSelectedProviders([...selectedProviders, tempProvider]);
      const providerGames = gamesByProvider[tempProvider] || [];
      const newGames = providerGames.filter(
        (g) =>
          !selectedGames.some(
            (sg) => sg.name === g.name && sg.code === g.code
          )
      );
      setSelectedGames([...selectedGames, ...newGames]);
      setTempProvider("");
    }
  };

  const handleRemoveProvider = (provName: string) => {
    setSelectedProviders(selectedProviders.filter((p) => p !== provName));
    const providerGames = gamesByProvider[provName] || [];
    const providerGameKeys = new Set(
      providerGames.map((g) => `${g.name}|${g.code}`)
    );
    setSelectedGames(
      selectedGames.filter((g) => !providerGameKeys.has(`${g.name}|${g.code}`))
    );
  };

  const handleRemoveGame = (game: Game) => {
    setSelectedGames(
      selectedGames.filter(
        (g) => !(g.name === game.name && g.code === game.code)
      )
    );
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append("icon", file);

      const token = localStorage.getItem("token");
      const response = await axios.post<{ success: boolean; url: string }>(
        `${API_BASE_URL}/games/categories/upload/icon`,
        formData,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              }
            : { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        setIconUrl(response.data.url);
      }
    } catch (error: any) {
      console.error("Failed to upload icon:", error);
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) {
        iconInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }
    onSubmit({ name, description, image_url: imageUrl, icon_url: iconUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Update category details and games"
              : "Create a new game category"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Popular Games"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Category description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category Icon</Label>
              <input
                type="file"
                ref={iconInputRef}
                accept="image/*"
                onChange={handleIconUpload}
                className="hidden"
              />
              <div className="space-y-2">
                {iconUrl ? (
                  <div className="relative group">
                    <img
                      src={
                        iconUrl.startsWith("http")
                          ? iconUrl
                          : `${BACKEND_BASE_URL}${iconUrl}`
                      }
                      alt="Category icon"
                      className="w-full h-24 object-contain rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `${BACKEND_BASE_URL}/api/v1/uploads/no-image-placeholder.png`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={uploadingIcon}
                      >
                        {uploadingIcon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setIconUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 flex flex-col items-center justify-center gap-2"
                    onClick={() => iconInputRef.current?.click()}
                    disabled={uploadingIcon}
                  >
                    {uploadingIcon ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6" />
                        <span>Upload Icon</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Add Games by Provider</Label>
              <div className="flex gap-2">
                <Select value={tempProvider} onValueChange={setTempProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {(gamesData?.providers || [])
                      .filter((p) => !selectedProviders.includes(p))
                      .map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddProvider} disabled={!tempProvider}>
                  Add Provider
                </Button>
              </div>
              {selectedProviders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedProviders.map((provName) => (
                    <Badge
                      key={provName}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveProvider(provName)}
                    >
                      {provName}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {gamesData && (
              <div className="space-y-2">
                <Label>Add Individual Games</Label>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded p-2">
                  {gamesData.allGames.map((game) => {
                    const isFromProvider = game.providers.some((p) =>
                      selectedProviders.includes(p)
                    );
                    const isSelected = selectedGames.some(
                      (g) => g.name === game.name && g.code === game.code
                    );
                    const isDisabled = isFromProvider;

                    return (
                      <div
                        key={`${game.code}-${game.name}`}
                        className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                          isSelected ? "bg-primary/10 border-primary" : ""
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (isDisabled) return;
                          if (isSelected) {
                            handleRemoveGame(game);
                          } else {
                            setSelectedGames([...selectedGames, game]);
                          }
                        }}
                        title={
                          isDisabled
                            ? "Already included from provider"
                            : isSelected
                            ? "Click to remove"
                            : "Click to add"
                        }
                      >
                        {isSelected ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <div className="h-4 w-4 border rounded" />
                        )}
                        <span className="text-sm truncate">{game.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Label>Selected Games ({selectedGames.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGames.map((game) => (
                  <Badge
                    key={`${game.code}-${game.name}`}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveGame(game)}
                  >
                    {game.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {editingCategory ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
