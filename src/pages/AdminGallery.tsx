import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type GalleryItem = Tables<"gallery">;

const AdminGallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) toast.error("Erro ao carregar galeria");
    else setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
    if (uploadError) {
      toast.error("Erro ao enviar imagem");
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);

    const { error: insertError } = await supabase.from("gallery").insert({
      image_url: publicData.publicUrl,
      caption: caption || null,
      sort_order: items.length,
    });

    if (insertError) {
      toast.error("Erro ao guardar na galeria");
    } else {
      toast.success("Imagem adicionada");
      setCaption("");
      fetchGallery();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta imagem?")) return;

    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao eliminar");
    } else {
      toast.success("Imagem eliminada");
      setItems((prev) => prev.filter((i) => i.id !== id));
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
      <h1 className="text-lg font-semibold text-foreground">Galeria</h1>

      {/* Upload form */}
      <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
        <div className="space-y-2">
          <Label htmlFor="caption">Legenda (opcional)</Label>
          <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Descrição da imagem" />
        </div>
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "A enviar..." : "Adicionar imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Gallery grid */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Nenhuma imagem na galeria.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border">
              <img
                src={item.image_url}
                alt={item.caption ?? ""}
                className="w-full aspect-square object-cover"
              />
              {item.caption && (
                <p className="p-2 text-xs text-muted-foreground truncate">{item.caption}</p>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
