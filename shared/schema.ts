import { z } from "zod";

export const userRoles = ["super_admin", "admin", "operator", "agent", "player"] as const;
export type UserRole = typeof userRoles[number];

export const transactionStatuses = ["completed", "pending", "cancelled"] as const;
export type TransactionStatus = typeof transactionStatuses[number];

export const depositWithdrawalStatuses = ["pending", "approved", "rejected"] as const;
export type DepositWithdrawalStatus = typeof depositWithdrawalStatuses[number];

export const userStatuses = ["active", "suspended", "inactive"] as const;
export type UserStatus = typeof userStatuses[number];

export const gameCategories = ["slots", "live", "table", "poker", "sports"] as const;
export type GameCategory = typeof gameCategories[number];

export const gameStatuses = ["active", "inactive", "maintenance"] as const;
export type GameStatus = typeof gameStatuses[number];

export const paymentMethods = ["bank_transfer", "credit_card", "crypto", "e_wallet"] as const;
export type PaymentMethod = typeof paymentMethods[number];

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(userRoles),
  password: z.string().optional(),
  balance: z.number().optional(),
  status: z.enum(userStatuses).optional(),
  createdAt: z.string(),
  permissions: z.array(z.string()).optional(),
  platform_code: z.string().optional(),
  assigned_platform_code: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthUser = z.infer<typeof authUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export const casinoUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(userRoles),
  balance: z.number(),
  status: z.enum(userStatuses),
  createdAt: z.string(),
  assignedTo: z.string().optional(),
  totalDeposits: z.number(),
  totalWithdrawals: z.number(),
  totalBets: z.number(),
  totalWins: z.number(),
  gamesPlayed: z.number(),
});

export const insertCasinoUserSchema = casinoUserSchema.omit({ id: true, createdAt: true }).extend({
  password: z.string().min(5),
});

export const updateCasinoUserSchema = casinoUserSchema.partial().omit({ id: true, createdAt: true });

export type CasinoUser = z.infer<typeof casinoUserSchema>;
export type InsertCasinoUser = z.infer<typeof insertCasinoUserSchema>;
export type UpdateCasinoUser = z.infer<typeof updateCasinoUserSchema>;

export const gameSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(gameCategories),
  provider: z.string(),
  status: z.enum(gameStatuses),
  totalPlays: z.number(),
  totalBets: z.number(),
  totalWins: z.number(),
  ggr: z.number(),
  rtp: z.number(),
  createdAt: z.string(),
});

export const insertGameSchema = gameSchema.omit({ id: true, createdAt: true, totalPlays: true, totalBets: true, totalWins: true, ggr: true });

export const updateGameSchema = gameSchema.partial().omit({ id: true, createdAt: true });

export type Game = z.infer<typeof gameSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type UpdateGame = z.infer<typeof updateGameSchema>;

export const gameTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  gameId: z.string(),
  gameName: z.string(),
  betAmount: z.number(),
  winAmount: z.number(),
  profitLoss: z.number(),
  status: z.enum(transactionStatuses),
  timestamp: z.string(),
});

export const insertGameTransactionSchema = gameTransactionSchema.omit({ id: true, timestamp: true });

export type GameTransaction = z.infer<typeof gameTransactionSchema>;
export type InsertGameTransaction = z.infer<typeof insertGameTransactionSchema>;

const decimalSchema = z.preprocess(
  (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "number") return isNaN(val) ? null : val;
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  },
  z.number().nullable().optional()
);

export const nextralGameTransactionSchema = z.object({
  id: z.string(),
  player_id: z.string(),
  wallet_id: z.string(),
  endpoint_type: z.string(),
  transaction_id: z.string(),
  round_id: z.string().nullable().optional(),
  game: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  currency: z.string(),
  amount: decimalSchema,
  bet_amount: decimalSchema,
  win_amount: decimalSchema,
  debit_amount: decimalSchema,
  credit_amount: decimalSchema,
  jackpot_amount: decimalSchema,
  jp_contrib: decimalSchema,
  reason: z.string().nullable().optional(),
  round_ended: z.boolean(),
  original_trans_id: z.string().nullable().optional(),
  client_token: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  player_name: z.string().nullable().optional(),
  player_email: z.string().nullable().optional(),
  is_test_user: z.boolean().nullable().optional(),
});

export const gameTransactionsStatsSchema = z.object({
  total_bets: z.number(),
  total_wins: z.number(),
  net_profit: z.number(),
  total_count: z.number(),
});

export type GameTransactionsStats = z.infer<typeof gameTransactionsStatsSchema>;

export type NextralGameTransaction = z.infer<typeof nextralGameTransactionSchema>;

export const nextralGameTransactionsResponseSchema = z.object({
  data: z.array(nextralGameTransactionSchema),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
  stats: gameTransactionsStatsSchema,
  total_stats: gameTransactionsStatsSchema,
});

export type NextralGameTransactionsResponse = z.infer<typeof nextralGameTransactionsResponseSchema>;

export const depositSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  amount: z.number(),
  method: z.enum(paymentMethods),
  status: z.enum(depositWithdrawalStatuses),
  timestamp: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const insertDepositSchema = depositSchema.omit({ id: true, timestamp: true, processedBy: true, processedAt: true });

export const updateDepositSchema = z.object({
  status: z.enum(depositWithdrawalStatuses),
  processedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type Deposit = z.infer<typeof depositSchema>;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type UpdateDeposit = z.infer<typeof updateDepositSchema>;

export const withdrawalSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  amount: z.number(),
  method: z.enum(paymentMethods),
  status: z.enum(depositWithdrawalStatuses),
  timestamp: z.string(),
  processedBy: z.string().optional(),
  processedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const insertWithdrawalSchema = withdrawalSchema.omit({ id: true, timestamp: true, processedBy: true, processedAt: true });

export const updateWithdrawalSchema = z.object({
  status: z.enum(depositWithdrawalStatuses),
  processedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type Withdrawal = z.infer<typeof withdrawalSchema>;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type UpdateWithdrawal = z.infer<typeof updateWithdrawalSchema>;

export const permissionSchema = z.object({
  role: z.enum(userRoles),
  permissions: z.array(z.string()),
});

export type Permission = z.infer<typeof permissionSchema>;

export const modulePermissionSchema = z.object({
  module: z.object({
    id: z.string(),
    name: z.string(),
    display_name: z.string(),
    description: z.string().optional(),
  }),
  permissions: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      display_name: z.string(),
      description: z.string().optional(),
      action: z.string(),
      assigned: z.boolean(),
    })
  ),
});

export type ModulePermission = z.infer<typeof modulePermissionSchema>;

export const rolePermissionsResponseSchema = z.object({
  role: z.string(),
  permissions: z.array(z.string()),
});

export type RolePermissionsResponse = z.infer<typeof rolePermissionsResponseSchema>;

export const assignPermissionsRequestSchema = z.object({
  role: z.enum(userRoles),
  permissions: z.array(z.string()),
});

export type AssignPermissionsRequest = z.infer<typeof assignPermissionsRequestSchema>;

export const dashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalGamesPlayed: z.number(),
  totalDeposits: z.number(),
  totalWithdrawals: z.number(),
  totalGGR: z.number(),
  superAdminCount: z.number(),
  adminCount: z.number(),
  operatorCount: z.number(),
  agentCount: z.number(),
  playerCount: z.number(),
  activeUsers: z.number(),
  pendingWithdrawals: z.number(),
  pendingDeposits: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const dailyStatsSchema = z.object({
  date: z.string(),
  deposits: z.number(),
  withdrawals: z.number(),
  ggr: z.number(),
  bets: z.number(),
  wins: z.number(),
});

export type DailyStats = z.infer<typeof dailyStatsSchema>;

export const topGameStatsSchema = z.object({
  gameId: z.string(),
  gameName: z.string(),
  revenue: z.number(),
  plays: z.number(),
});

export type TopGameStats = z.infer<typeof topGameStatsSchema>;
