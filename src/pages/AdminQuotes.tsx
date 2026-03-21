import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Quote {
  id: string;
  text: string;
  author: string | null;
  is_active: boolean;
  sort_order: number;
}

const AdminQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Quote | null>(null);
  const [formText, setFormText] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchQuotes = async () => {
    const { data } = await supabase
      .from("quotes")
      .select("id, text, author, is_active, sort_order")
      .order("sort_order", { ascending: true });
    setQuotes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, []);

  const resetForm = () => {
    setEditing(null);
    setFormText("");
    setFormAuthor("");
  };

  const startEdit = (q: Quote) => {
    setEditing(q);
    setFormText(q.text);
    setFormAuthor(q.author || "");
  };

  const handleSave = async () => {
    if (!formText.trim()) return;
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("quotes")
        .update({ text: formText.trim(), author: formAuthor.trim() || null })
        .eq("id", editing.id);
      if (error) toast.error("Erro ao atualizar");
      else toast.success("Citação atualizada");
    } else {
      const maxOrder = quotes.length ? Math.max(...quotes.map((q) => q.sort_order)) : 0;
      const { error } = await supabase
        .from("quotes")
        .insert({ text: formText.trim(), author: formAuthor.trim() || null, sort_order: maxOrder + 1 });
      if (error) toast.error("Erro ao criar");
      else toast.success("Citação criada");
    }

    setSaving(false);
    resetForm();
    fetchQuotes();
  };

  const toggleActive = async (q: Quote) => {
    await supabase.from("quotes").update({ is_active: !q.is_active }).eq("id", q.id);
    fetchQuotes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apagar esta citação?")) return;
    await supabase.from("quotes").delete().eq("id", id);
    toast.success("Citação apagada");
    fetchQuotes();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-foreground">Citações</h1>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editing ? "Editar citação" : "Nova citação"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Texto da citação"
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
          />
          <Input
            placeholder="Autor (opcional)"
            value={formAuthor}
            onChange={(e) => setFormAuthor(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !formText.trim()} size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editing ? "Guardar" : "Adicionar"}
            </Button>
            {editing && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Texto</TableHead>
                  <TableHead className="w-[140px]">Autor</TableHead>
                  <TableHead className="w-[80px]">Ativo</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-xs truncate">{q.text}</TableCell>
                    <TableCell className="text-muted-foreground">{q.author || "—"}</TableCell>
                    <TableCell>
                      <Switch checked={q.is_active} onCheckedChange={() => toggleActive(q)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(q)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminQuotes;
