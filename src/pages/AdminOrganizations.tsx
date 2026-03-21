import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";

type Org = {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

const emptyForm = { name: "", logo_url: "", website_url: "", sort_order: 0, is_active: true };

const AdminOrganizations = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Org[];
    },
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `orgs/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return data.publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      let logoUrl = form.logo_url;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }
      const payload = {
        name: form.name,
        logo_url: logoUrl,
        website_url: form.website_url || null,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      if (editingId) {
        const { error } = await supabase.from("organizations").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("organizations").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
      qc.invalidateQueries({ queryKey: ["organizations"] });
      setOpen(false);
      resetForm();
      toast({ title: editingId ? "Organização atualizada" : "Organização criada" });
    },
    onError: (e: Error) => {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("organizations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-organizations"] });
      qc.invalidateQueries({ queryKey: ["organizations"] });
      toast({ title: "Organização eliminada" });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setLogoFile(null);
  };

  const openEdit = (org: Org) => {
    setEditingId(org.id);
    setForm({
      name: org.name,
      logo_url: org.logo_url,
      website_url: org.website_url || "",
      sort_order: org.sort_order,
      is_active: org.is_active,
    });
    setLogoFile(null);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Organizações</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar organização" : "Nova organização"}</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}
            >
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                {form.logo_url && !logoFile && (
                  <img src={form.logo_url} alt="" className="h-10 w-auto mb-2" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                {!logoFile && !editingId && (
                  <>
                    <p className="text-xs text-muted-foreground">ou URL direto:</p>
                    <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativa</Label>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Guardar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-center">Ordem</TableHead>
              <TableHead className="text-center">Ativa</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orgs?.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <img src={org.logo_url} alt={org.name} className="h-8 w-auto" />
                </TableCell>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>
                  {org.website_url && (
                    <a href={org.website_url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1 text-sm">
                      <ExternalLink className="w-3 h-3" /> Link
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-center">{org.sort_order}</TableCell>
                <TableCell className="text-center">{org.is_active ? "✓" : "—"}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(org)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(org.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminOrganizations;
