"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";

export interface StatsData {
  lead: number;
  customer: number;

  contactTotal: number;
  contactFromInstagram: number;
  contactFromFacebook: number;
  contactFromMember: number;

  visitTotal: number;
  visitFromInstagram: number;
  visitFromFacebook: number;
}

export interface DashboardStatsType {
  "30d": StatsData;
  "60d": StatsData;
  "90d": StatsData;
  "180d": StatsData;
  "365d": StatsData;
  total: StatsData;
}

export interface MonthlyStatsData {
  year: number;
  month: number;
  contactTotal: number;
  visitTotal: number;
}

export interface DashboardStatsResponse {
  periodStats: DashboardStatsType;
  monthlyStats: MonthlyStatsData[];
}

function getPeriodCutoffDate(period: string): string {
  if (period === "total") return new Date(0).toISOString();
  const days = parseInt(period);
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function calculateStats(
  contacts: Array<{ status: string; source: string; created_at: string }>,
  visits: Array<{ source: string; visited_at: string }>,
  cutoffDate: string
): StatsData {
  const filteredContacts = contacts.filter((c) => c.created_at >= cutoffDate);
  const filteredVisits = visits.filter((v) => v.visited_at >= cutoffDate);

  return {
    lead: filteredContacts.filter((c) => c.status === "lead").length,
    customer: filteredContacts.filter((c) => c.status === "customer").length,

    contactTotal: filteredContacts.length,
    contactFromInstagram: filteredContacts.filter(
      (c) => c.source === "Public Lead Form - instagram"
    ).length,
    contactFromFacebook: filteredContacts.filter((c) => c.source === "Public Lead Form - facebook")
      .length,
    contactFromMember: filteredContacts.filter((c) => c.source?.includes("@")).length,

    visitTotal: filteredVisits.length,
    visitFromInstagram: filteredVisits.filter((v) => v.source === "instagram").length,
    visitFromFacebook: filteredVisits.filter((v) => v.source === "facebook").length,
  };
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsResponse | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const [contactsResult, visitsResult] = await Promise.all([
    supabase.from("contacts").select("status, source, created_at").eq("organization_id", orgId),
    supabase.from("visit_logs").select("source, visited_at").eq("organization_id", orgId),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (visitsResult.error) throw visitsResult.error;

  const contacts = contactsResult.data || [];
  const visits = visitsResult.data || [];

  const periods = ["30d", "60d", "90d", "180d", "365d", "total"] as const;
  const periodStats = {} as DashboardStatsType;

  for (const period of periods) {
    const cutoffDate = getPeriodCutoffDate(period);
    periodStats[period] = calculateStats(contacts, visits, cutoffDate);
  }

  // ====================================================================================================

  const monthlyData = new Map<
    string,
    { year: number; month: number; contacts: number; visits: number }
  >();

  contacts.forEach((c) => {
    const date = new Date(c.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    const current = monthlyData.get(key) || { year, month, contacts: 0, visits: 0 };
    monthlyData.set(key, { ...current, contacts: current.contacts + 1 });
  });

  visits.forEach((v) => {
    const date = new Date(v.visited_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    const current = monthlyData.get(key) || { year, month, contacts: 0, visits: 0 };
    monthlyData.set(key, { ...current, visits: current.visits + 1 });
  });

  const monthlyStats = Array.from(monthlyData.values())
    .map((data) => ({
      year: data.year,
      month: data.month,
      contactTotal: data.contacts,
      visitTotal: data.visits,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  return {
    periodStats,
    monthlyStats,
  };
}
