import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";

const AdminEventForm = () => {
  const { id } = useParams();
  const isEditing = !!id && id !== "novo";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("14:00");
  const [location, setLocation] = useState("");
  const [slug, setSlug] = useState("");
  const [walkInfo, setWalkInfo] = useState("");
  const [isPast, setIsPast] = useState(false);
  const [flyerUrl, setFlyerUrl] = useState("");

  useEffect(() => {
    if (isEditing) {
      supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            toast.error("Evento não encontrado");
            navigate("/admin");
            return;
          }
          setTitle(data.title);
          setDescription(data.description ?? "");
          setDate(data.date);
          setTime(data.time);
          setLocation(data.location);
          setSlug(data.slug);
          setWalkInfo(data.walk_info ?? "");
          setIsPast(data.is_past);
          setFlyerUrl(data.flyer_url ?? "");
          setLoading(false);
        });
    }
  }, [id, isEditing, navigate]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      setSlug(generateSlug(val));
    }
  };

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `flyers/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) {
      toast.error("Erro ao enviar flyer");
      setUploading(false);
      return;
    }

    const { data: publicData } = supabase.storage.from("media").getPublicUrl(path);
    setFlyerUrl(publicData.publicUrl);
    setUploading(false);
    toast.success("Flyer enviado");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !slug) {
      toast.error("Preenche os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    const payload = {
      title,
      description: description || null,
      date,
      time,
      location,
      slug,
      walk_info: walkInfo || null,
      is_past: isPast,
      flyer_url: flyerUrl || null,
    };

    if (isEditing) {
      const { error } = await supabase.from("events").update(payload).eq("id", id);
      if (error) {
        toast.error("Erro ao atualizar evento");
      } else {
        toast.success("Evento atualizado");
        navigate("/admin");
      }
    } else {
      const { error } = await supabase.from("events").insert(payload);
      if (error) {
        toast.error(error.message.includes("duplicate") ? "Slug já existe" : "Erro ao criar evento");
      } else {
        toast.success("Evento criado");
        navigate("/admin");
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h1 className="text-lg font-semibold text-foreground">
        {isEditing ? "Editar evento" : "Novo evento"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Hora *</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Local *</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="walkInfo">Info caminhada</Label>
          <Input id="walkInfo" value={walkInfo} onChange={(e) => setWalkInfo(e.target.value)} placeholder="Ex: Caminhada pela paz às 14:30" />
        </div>

        <div className="space-y-2">
          <Label>Flyer</Label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
              <Upload className="w-4 h-4" />
              {uploading ? "A enviar..." : "Enviar flyer"}
              <input type="file" accept="image/*" className="hidden" onChange={handleFlyerUpload} disabled={uploading} />
            </label>
            {flyerUrl && (
              <img src={flyerUrl} alt="Flyer" className="w-16 h-16 object-cover rounded-lg border border-border" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch id="isPast" checked={isPast} onCheckedChange={setIsPast} />
          <Label htmlFor="isPast">Evento passado</Label>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {isEditing ? "Guardar" : "Criar evento"}
        </Button>
      </form>
    </div>
  );
};

export default AdminEventForm;
