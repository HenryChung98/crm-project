"use server";
import { requireOrgAccess } from "@/shared-utils/org-access";

export interface DashboardStatsType {
  totalContact: number;
  newContact: number;
  lead: number;
  contactFromLead: number;

  contactFromInstagram: number;
  contactFromFacebook: number;
  contactFromMember: number;

  visitTotal: number;
  visitFromInstagram: number;
  visitFromFacebook: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStatsType | null> {
  if (!orgId) return null;

  const { supabase } = await requireOrgAccess(orgId, true);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [contactsResult, visitsResult] = await Promise.all([
    supabase.from("contacts").select("status, source, created_at").eq("organization_id", orgId),
    supabase.from("visit_logs").select("source, visited_at").eq("organization_id", orgId),
  ]);

  if (contactsResult.error) throw contactsResult.error;
  if (visitsResult.error) throw visitsResult.error;

  const contacts = contactsResult.data || [];
  const visits = visitsResult.data || [];
  const contactsLastThirtyDays = contacts.filter((c) => c.created_at >= thirtyDaysAgo);
  const visitsLastThirtyDays = visits.filter((v) => v.visited_at >= thirtyDaysAgo);

  // aggregate from memory
  return {
    totalContact: contacts.length,
    newContact: contactsLastThirtyDays.length,
    lead: contacts.filter((c) => c.status === "lead").length,
    contactFromLead: contacts.filter((c) => c.status === "customer").length,

    contactFromInstagram: contacts.filter((c) => c.source === "instagram Public Lead Form")
      .length,
      contactFromFacebook: contacts.filter((c) => c.source === "facebook Public Lead Form").length,
      contactFromMember: contacts.filter((c) => c.source?.includes("@")).length,

    visitTotal: visits.length,
    visitFromInstagram: visits.filter((v) => v.source === "instagram").length,
    visitFromFacebook: visits.filter((v) => v.source === "facebook").length,
  };
}
