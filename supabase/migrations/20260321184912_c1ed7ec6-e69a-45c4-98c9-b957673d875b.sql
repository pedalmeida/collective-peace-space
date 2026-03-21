
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  logo_url text NOT NULL,
  website_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active organizations"
  ON public.organizations FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed with current hardcoded data
INSERT INTO public.organizations (name, logo_url, website_url, sort_order) VALUES
  ('Bhakti Marga', '/org-bhaktimarga.png', 'https://www.bhaktimarga.org', 1),
  ('Ananda Marga', '/org-anandamarga.png', 'https://www.anandamarga.org', 2),
  ('Núcleo Meditação FCUL', '/org-fcul.png', 'https://ciencias.ulisboa.pt', 3),
  ('Padma Yoga', '/org-padmayoga.png', 'https://www.padmayoga.pt', 4),
  ('Adiram Europe', '/org-adiram.png', 'https://www.adiram.net', 5),
  ('Centro de Reiki e Meditação Clássica', '/org-centro-reiki.png', 'https://www.centroreiki.pt', 6),
  ('IRBY-Center', '/org-irby-center.png', 'https://www.irby-center.com', 7),
  ('Yoga na Linha do Coração', '/org-yoga-coracao.png', 'https://www.yoganalinhadocoracao.pt', 8);
