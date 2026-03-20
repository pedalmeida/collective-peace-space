import { Reveal } from "./Reveal";

export const Organizers = () => {
  return (
    <section id="organizadores" className="section-padding">
      <div className="container max-w-2xl text-center">
        <Reveal>
          <p className="text-sm tracking-widest uppercase text-accent font-medium mb-4">
            Com o apoio de…
          </p>
          <h2 className="text-foreground mb-8">Queres fazer parte da organização?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
            <p>
              Um grupo de cidadãos unidos pela sua aspiração por um mundo melhor
              e interesse na prática de meditação. A iniciativa não tem filiação
              política, religiosa ou ideológica.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Se pretendes adicionar-te à lista de organizadores contacta:{" "}
            <a href="mailto:info@meditarmundomelhor.org" className="text-accent hover:underline">
              info@meditarmundomelhor.org
            </a>
          </p>
        </Reveal>
      </div>
    </section>);

};