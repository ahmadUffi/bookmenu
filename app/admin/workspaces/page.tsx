import { createAdminClient } from "@/lib/supabase/admin";
import WorkspacesTable from "@/components/admin/workspaces-table";

export default async function AdminWorkspacesPage() {
  const adminDb = createAdminClient();

  const { data: restaurants } = await adminDb
    .from("restaurants")
    .select(`id, restaurant_name, slug, is_active, created_at, owner_id, menus(id, title, pdf_url, is_active)`)
    .order("created_at", { ascending: false });

  const ownerIds = [...new Set((restaurants ?? []).map((r) => r.owner_id))];

  const { data: owners } = ownerIds.length
    ? await adminDb.from("users").select("id, email").in("id", ownerIds)
    : { data: [] };

  const ownerEmailMap = new Map((owners ?? []).map((o) => [o.id, o.email]));

  const { data: usages } = await adminDb
    .from("subscription_usages")
    .select("user_id, qr_scan")
    .in("user_id", ownerIds);

  const usageMap = new Map((usages ?? []).map((u) => [u.user_id, u.qr_scan]));

  const rows = (restaurants ?? []).map((r) => {
    const menus = (r.menus as { id: string; title: string; pdf_url: string; is_active: boolean }[]) ?? [];
    return {
      id: r.id,
      name: r.restaurant_name,
      slug: r.slug,
      isActive: r.is_active ?? true,
      ownerEmail: ownerEmailMap.get(r.owner_id) ?? "—",
      menuCount: menus.length,
      qrScans: usageMap.get(r.owner_id) ?? 0,
      menus: menus.map((m) => ({ id: m.id, title: m.title, pdfUrl: m.pdf_url, isActive: m.is_active })),
    };
  });

  return (
    <div className="p-4 md:p-6">
      <WorkspacesTable rows={rows} />
    </div>
  );
}
