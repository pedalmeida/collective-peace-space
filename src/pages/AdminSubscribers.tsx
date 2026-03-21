import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, Users } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Subscriber = Tables<"subscribers">;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const exportCSV = (rows: Subscriber[]) => {
  const header = "Email,Data de subscrição\n";
  const body = rows.map((r) => `${r.email},${formatDate(r.created_at)}`).join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "subscritores.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSubscribers(data ?? []);
        setLoading(false);
      });
  }, []);

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
          <Users className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Subscritores</h1>
          <span className="text-sm text-muted-foreground">({subscribers.length})</span>
        </div>
        {subscribers.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => exportCSV(subscribers)}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        )}
      </div>

      {subscribers.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">Ainda não há subscritores.</p>
      ) : (
        <div className="border border-border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="w-48">Data de subscrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminSubscribers;
