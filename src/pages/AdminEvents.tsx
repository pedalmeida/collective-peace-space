import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Event = Tables<"events">;

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar eventos");
    } else {
      setEvents(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Eliminar "${title}"?`)) return;

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao eliminar evento");
    } else {
      toast.success("Evento eliminado");
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
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
        <h1 className="text-lg font-semibold text-foreground">Eventos</h1>
        <Button asChild size="sm">
          <Link to="/admin/eventos/novo">
            <Plus className="w-4 h-4 mr-1.5" />
            Novo evento
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Nenhum evento criado.
        </p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Título</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Local</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-foreground font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.location}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${event.is_past ? "bg-muted text-muted-foreground" : "bg-accent/10 text-accent"}`}>
                      {event.is_past ? "Passado" : "Próximo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/admin/eventos/${event.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(event.id, event.title)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
