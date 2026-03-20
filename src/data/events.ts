export interface EventData {
  slug: string;
  date: string;
  location: string;
  time?: string;
  description?: string;
  walkInfo?: string;
  isPast: boolean;
}

export const events: EventData[] = [
  {
    slug: "outubro-2025-belem",
    date: "Sábado, 25 de Outubro 2025",
    location: "Jardins da Torre de Belém",
    time: "14:00",
    description: "Uma meditação colectiva junto ao Tejo, com vista para a Torre de Belém. Uma tarde de partilha e conexão em contacto com a natureza.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: true,
  },
  {
    slug: "novembro-2025-pavilhao",
    date: "Domingo, 30 de Novembro 2025",
    location: "Pavilhão de Portugal",
    time: "14:00",
    description: "Sessão de meditação no icónico Pavilhão de Portugal, no Parque das Nações. Um espaço aberto e inspirador para a prática colectiva.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: true,
  },
  {
    slug: "dezembro-2025-botanico",
    date: "Sábado, 20 de Dezembro 2025",
    location: "Jardim Botânico de Lisboa",
    time: "14:00",
    description: "Meditação de encerramento do ano rodeados pela biodiversidade do Jardim Botânico. Um momento de gratidão e reflexão.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: true,
  },
  {
    slug: "janeiro-2026-nacoes",
    date: "Domingo, 25 de Janeiro 2026",
    location: "Parque das Nações",
    time: "14:00",
    description: "O primeiro evento do ano, junto ao rio. Uma sessão para definir intenções e começar 2026 com presença e serenidade.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: true,
  },
  {
    slug: "fevereiro-2026-estrela",
    date: "Sábado, 28 de Fevereiro 2026",
    location: "Jardim da Estrela",
    time: "14:00",
    description: "Meditação no coração de Lisboa, debaixo das árvores centenárias do Jardim da Estrela. Um refúgio de calma na cidade.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: true,
  },
  {
    slug: "marco-2026-eduardo-vii",
    date: "Sábado, 29 de Março 2026",
    location: "Parque Eduardo VII — Anfiteatro do Jardim Amália Rodrigues",
    time: "14:00",
    description: "O próximo grande encontro de meditação colectiva. Junta-te a nós no Parque Eduardo VII para uma tarde de paz, caminhada e comunidade.",
    walkInfo: "Caminhada pela paz às 14:30",
    isPast: false,
  },
];

export const getEventBySlug = (slug: string) => events.find((e) => e.slug === slug);
export const pastEvents = events.filter((e) => e.isPast);
export const nextEvent = events.find((e) => !e.isPast);
