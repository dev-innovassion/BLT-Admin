import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Copy, Check, X, Calendar, Filter,
  Gamepad2, Trophy, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { backendRequest } from "@/lib/backendApi";


interface UnifiedTransaction {
  transaction_id: string;
  player_id: string;
  player_name: string;
  player_email: string;
  game_name: string;
  round_id: string | null;
  bet_amount: number;
  win_amount: number;
  currency: string;
  source: "games" | "sportsbook";
  created_at: string;
}

interface UnifiedTransactionStats {
  total_count: number;
  total_bet: number;
  total_win: number;
  ggr: number;
  player_profit: number;
  house_profit: number;
  house_loss: number;
  games_count: number;
  games_bet: number;
  games_win: number;
  games_ggr: number;
  games_house_profit: number;
  games_house_loss: number;
  sportsbook_count: number;
  sportsbook_bet: number;
  sportsbook_win: number;
  sportsbook_ggr: number;
  sportsbook_house_profit: number;
  sportsbook_house_loss: number;
}

interface UnifiedTransactionResponse {
  data: UnifiedTransaction[];
  total: number;
  page: number;
  page_size: number;
  stats: UnifiedTransactionStats | null;
  profit_margin?: number | null;
}


const getToken = () => localStorage.getItem("access_token") || "";

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);


function CopyableId({ id, label }: { id: string; label: string }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const ids = id.split(',').map(s => s.trim()).filter(Boolean);

  const copy = async (val: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-col gap-0.5">
      {ids.map((single, idx) => (
        <div key={idx} className="flex items-center gap-1.5 group cursor-default">
          <span className="font-mono text-xs text-muted-foreground">{single}</span>
          <button
            onClick={() => copy(single, idx)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded flex-shrink-0"
          >
            {copiedIdx === idx
              ? <Check className="h-3 w-3 text-green-500" />
              : <Copy className="h-3 w-3 text-muted-foreground" />}
          </button>
        </div>
      ))}
    </div>
  );
}

function SourceBadge({ source }: { source: "games" | "sportsbook" }) {
  return source === "games"
    ? (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
        <Gamepad2 className="h-3 w-3" /> Games
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
        <Trophy className="h-3 w-3" /> Sportsbook
      </span>
    );
}


export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [source, setSource] = useState("all");
  const [amountType, setAmountType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, source, amountType, startDate, endDate, timestamp]);

  const buildParams = useCallback(() => {
    const p = new URLSearchParams({
      page: page.toString(),
      page_size: PAGE_SIZE.toString(),
    });
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (source !== "all") p.set("source", source);
    if (amountType !== "all") p.set("amount_type", amountType);
    if (timestamp) {
      p.set("timestamp", timestamp);
    } else {
      if (startDate) p.set("start_date", startDate);
      if (endDate) p.set("end_date", endDate);
    }
    return p.toString();
  }, [page, debouncedSearch, source, amountType, startDate, endDate, timestamp]);

  const { data: response, isLoading } = useQuery<UnifiedTransactionResponse>({
    queryKey: ["unified-transactions", page, debouncedSearch, source, amountType, startDate, endDate, timestamp],
    queryFn: async () => {
      const res = await backendRequest(
        "GET",
        `/api/v1/admin/transactions/unified?${buildParams()}`,
        undefined,
        getToken()
      );
      return res.json();
    },
  });

  const rows = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const stats = response?.stats ?? null;
  const profitMargin = response?.profit_margin ?? null;

  const agentProfit = (stats && profitMargin !== null && profitMargin !== undefined)
    ? {
        total:      (stats.ggr * profitMargin) / 100,
        games:      (stats.games_ggr * profitMargin) / 100,
        sportsbook: (stats.sportsbook_ggr * profitMargin) / 100,
        margin:     profitMargin,
      }
    : null;

  const hasActiveFilters = source !== "all" || amountType !== "all" || startDate || endDate || timestamp;

  const clearFilters = () => {
    setSource("all");
    setAmountType("all");
    setStartDate("");
    setEndDate("");
    setTimestamp("");
    setSearch("");
  };

  const StatCard = ({
    label, value, sub, color,
  }: { label: string; value: string; sub?: string; color?: string }) => (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${color ?? ""}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Unified view of Games and Sportsbook transactions
        </p>
      </div>

      {stats && (
        <div className="space-y-4">

          {agentProfit && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                <span className="text-yellow-500">★</span>
                <span className="text-yellow-500">Your Profit</span>
                <span className="text-muted-foreground/60 font-normal normal-case">({agentProfit.margin}% of GGR)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                  label="Total Profit"
                  value={(agentProfit.total >= 0 ? "+" : "") + fmt(agentProfit.total)}
                  color={agentProfit.total >= 0 ? "text-yellow-500" : "text-red-500"}
                  sub={`${agentProfit.margin}% × GGR ${fmt(stats.ggr)}`}
                />
                <StatCard
                  label="Games Profit"
                  value={(agentProfit.games >= 0 ? "+" : "") + fmt(agentProfit.games)}
                  color={agentProfit.games >= 0 ? "text-yellow-500" : "text-red-500"}
                  sub={`${agentProfit.margin}% × Games GGR ${fmt(stats.games_ggr)}`}
                />
                <StatCard
                  label="Sportsbook Profit"
                  value={(agentProfit.sportsbook >= 0 ? "+" : "") + fmt(agentProfit.sportsbook)}
                  color={agentProfit.sportsbook >= 0 ? "text-yellow-500" : "text-red-500"}
                  sub={`${agentProfit.margin}% × SB GGR ${fmt(stats.sportsbook_ggr)}`}
                />
              </div>
            </div>
          )}

          {profitMargin === null && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Overall
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Transactions" value={stats.total_count.toLocaleString()} />
              <StatCard label="Total Bet" value={fmt(stats.total_bet)} />
              <StatCard label="Total Win" value={fmt(stats.total_win)} />
              <StatCard
                label="GGR"
                value={(stats.ggr >= 0 ? "+" : "") + fmt(stats.ggr)}
                color={stats.ggr >= 0 ? "text-green-500" : "text-red-500"}
                sub="Bet − Win"
              />
              <StatCard
                label="House Profit"
                value={fmt(stats.house_profit)}
                color="text-green-500"
                sub="When house wins"
              />
              <StatCard
                label="House Loss"
                value={fmt(stats.house_loss)}
                color="text-red-500"
                sub="When players win"
              />
            </div>
          </div>
          )}

          {profitMargin === null && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-blue-500">Games</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Transactions" value={stats.games_count.toLocaleString()} />
              <StatCard label="Total Bet" value={fmt(stats.games_bet)} />
              <StatCard label="Total Win" value={fmt(stats.games_win)} />
              <StatCard
                label="GGR"
                value={(stats.games_ggr >= 0 ? "+" : "") + fmt(stats.games_ggr)}
                color={stats.games_ggr >= 0 ? "text-green-500" : "text-red-500"}
              />
              <StatCard label="House Profit" value={fmt(stats.games_house_profit)} color="text-green-500" />
              <StatCard label="House Loss" value={fmt(stats.games_house_loss)} color="text-red-500" />
            </div>
          </div>
          )}

          {profitMargin === null && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-purple-500" />
              <span className="text-purple-500">Sportsbook</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Transactions" value={stats.sportsbook_count.toLocaleString()} />
              <StatCard label="Total Bet" value={fmt(stats.sportsbook_bet)} />
              <StatCard label="Total Win" value={fmt(stats.sportsbook_win)} />
              <StatCard
                label="GGR"
                value={(stats.sportsbook_ggr >= 0 ? "+" : "") + fmt(stats.sportsbook_ggr)}
                color={stats.sportsbook_ggr >= 0 ? "text-green-500" : "text-red-500"}
              />
              <StatCard label="House Profit" value={fmt(stats.sportsbook_house_profit)} color="text-green-500" />
              <StatCard label="House Loss" value={fmt(stats.sportsbook_house_loss)} color="text-red-500" />
            </div>
          </div>
          )}

        </div>
      )}

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs ml-auto" onClick={clearFilters}>
              <X className="h-3 w-3 mr-1" /> Clear all
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by player, email, transaction ID, game, round ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={source} onValueChange={setSource}>
            <SelectTrigger>
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="games">Games</SelectItem>
              <SelectItem value="sportsbook">Sportsbook</SelectItem>
            </SelectContent>
          </Select>

          <Select value={amountType} onValueChange={setAmountType}>
            <SelectTrigger>
              <SelectValue placeholder="Amount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Bet &amp; Win</SelectItem>
              <SelectItem value="bet">Bets only</SelectItem>
              <SelectItem value="win">Wins only</SelectItem>
            </SelectContent>
          </Select>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setTimestamp(""); }}
              disabled={!!timestamp}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setTimestamp(""); }}
              disabled={!!timestamp}
            />
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Exact Timestamp
              <span className="text-muted-foreground/60">(overrides date range)</span>
            </label>
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={timestamp}
                onChange={(e) => { setTimestamp(e.target.value); setStartDate(""); setEndDate(""); }}
                className="flex-1"
              />
              {timestamp && (
                <Button variant="outline" size="icon" onClick={() => setTimestamp("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
            {source !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Source: {source}
                <button onClick={() => setSource("all")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {amountType !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Amount: {amountType}
                <button onClick={() => setAmountType("all")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {startDate && (
              <Badge variant="secondary" className="gap-1">
                From: {startDate}
                <button onClick={() => setStartDate("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {endDate && (
              <Badge variant="secondary" className="gap-1">
                To: {endDate}
                <button onClick={() => setEndDate("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {timestamp && (
              <Badge variant="secondary" className="gap-1">
                At: {new Date(timestamp).toLocaleString()}
                <button onClick={() => setTimestamp("")}><X className="h-3 w-3" /></button>
              </Badge>
            )}
          </div>
        )}
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Transaction ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Player</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Game / Source</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Round ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Amounts</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">Time</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-30" />
                      <p>No transactions found</p>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((tx) => {
                  const pl = tx.win_amount - tx.bet_amount;
                  const d = new Date(tx.created_at);
                  const datePart = d.toLocaleDateString();
                  const timePart = d.toLocaleTimeString();
                  return (
                    <tr key={tx.transaction_id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <CopyableId id={tx.transaction_id} label="tx" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground leading-tight">
                            {tx.player_name || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground">{tx.player_email || "—"}</span>
                          <CopyableId id={tx.player_id} label="player" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{tx.game_name}</span>
                          <SourceBadge source={tx.source} />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {tx.round_id
                          ? <CopyableId id={tx.round_id} label="round" />
                          : <span className="text-muted-foreground">—</span>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 font-mono text-xs">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Bet</span>
                            <span className={tx.bet_amount > 0 ? "text-orange-500 font-semibold" : "text-muted-foreground"}>
                              {tx.bet_amount > 0 ? fmt(tx.bet_amount) : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Win</span>
                            <span className={tx.win_amount > 0 ? "text-green-500 font-semibold" : "text-muted-foreground"}>
                              {tx.win_amount > 0 ? fmt(tx.win_amount) : "—"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-0.5 border-t border-border/50">
                            <span className="text-muted-foreground">P/L</span>
                            <span className={`font-bold ${pl >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {pl >= 0 ? "+" : ""}{fmt(pl)}
                            </span>
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground text-[10px] font-medium">
                              {tx.currency}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-foreground font-medium whitespace-nowrap">{datePart}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{timePart}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <p className="text-sm text-muted-foreground">
            {total === 0
              ? "No results"
              : `${((page - 1) * PAGE_SIZE) + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total.toLocaleString()} transactions`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
