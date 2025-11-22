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
  contactFromInstagram: number;
  contactFromFacebook: number;
  contactFromMember: number;
  visitTotal: number;
  visitFromInstagram: number;
  visitFromFacebook: number;
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
    {
      year: number;
      month: number;
      contactTotal: number;
      contactFromInstagram: number;
      contactFromFacebook: number;
      contactFromMember: number;
      visitTotal: number;
      visitFromInstagram: number;
      visitFromFacebook: number;
    }
  >();

  contacts.forEach((c) => {
    const date = new Date(c.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    const current = monthlyData.get(key) || {
      year,
      month,
      contactTotal: 0,
      contactFromInstagram: 0,
      contactFromFacebook: 0,
      contactFromMember: 0,
      visitTotal: 0,
      visitFromInstagram: 0,
      visitFromFacebook: 0,
    };

    monthlyData.set(key, {
      ...current,
      contactTotal: current.contactTotal + 1,
      contactFromInstagram:
        current.contactFromInstagram +
        (c.source === "Public Lead Form - instagram" ? 1 : 0),
      contactFromFacebook:
        current.contactFromFacebook + (c.source === "Public Lead Form - facebook" ? 1 : 0),
      contactFromMember: current.contactFromMember + (c.source?.includes("@") ? 1 : 0),
    });
  });

  visits.forEach((v) => {
    const date = new Date(v.visited_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    const current = monthlyData.get(key) || {
      year,
      month,
      contactTotal: 0,
      contactFromInstagram: 0,
      contactFromFacebook: 0,
      contactFromMember: 0,
      visitTotal: 0,
      visitFromInstagram: 0,
      visitFromFacebook: 0,
    };

    monthlyData.set(key, {
      ...current,
      visitTotal: current.visitTotal + 1,
      visitFromInstagram: current.visitFromInstagram + (v.source === "instagram" ? 1 : 0),
      visitFromFacebook: current.visitFromFacebook + (v.source === "facebook" ? 1 : 0),
    });
  });

  const monthlyStats = Array.from(monthlyData.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return {
    periodStats,
    monthlyStats,
  };
}