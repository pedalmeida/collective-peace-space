import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface AdminUser {
  user_id: string;
  email: string;
  created_at: string;
}

const AdminUsers = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = async () => {
    const { data: roles } = await supabase.from("user_roles").select("user_id, created_at").eq("role", "admin");
    if (!roles) { setLoading(false); return; }

    // We can't query auth.users from client, so we'll show user_id and created_at
    // For emails we use the edge function or just show IDs
    setAdmins(roles.map((r) => ({ user_id: r.user_id, email: "", created_at: r.created_at })));
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (password.length < 8) { toast.error("A password deve ter pelo menos 8 caracteres."); return; }

    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();

    const res = await supabase.functions.invoke("create-admin", {
      body: { email, password },
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (res.error || res.data?.error) {
      toast.error(res.data?.error || "Erro ao criar admin.");
    } else {
      toast.success("Admin criado com sucesso!");
      setEmail("");
      setPassword("");
      setOpen(false);
      fetchAdmins();
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Administradores</h1>
          <span className="text-sm text-muted-foreground">({admins.length})</span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo administrador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@exemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 8 caracteres" />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Criar admin
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead className="w-48">Adicionado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.user_id}>
                <TableCell className="font-mono text-sm">{a.user_id}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
