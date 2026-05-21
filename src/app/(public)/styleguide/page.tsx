import { Bath, Bed, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { IconStat } from '@/components/ui/IconStat';
import { Pill } from '@/components/ui/Pill';
import { SectionHeading } from '@/components/ui/SectionHeading';

const swatches: Array<[string, string, string]> = [
  ['sage-600', '#6f7f4f', 'bg-sage-600'],
  ['sage-700', '#566239', 'bg-sage-700'],
  ['sage-100', '#e7eada', 'bg-sage-100 ring-1 ring-black/10'],
  ['cream-100', '#f5f0e7', 'bg-cream-100 ring-1 ring-black/10'],
  ['forest', '#4a5a30', 'bg-forest'],
  ['forest-dark', '#3a4128', 'bg-forest-dark'],
];

export default function StyleguidePage() {
  return (
    <main className="min-h-screen bg-cream-100 py-16">
      <Container>
        <SectionHeading eyebrow="Styleguide" title="Design tokens & primitives" />

        <div className="mt-16 space-y-16">
          <section>
            <h3 className="font-serif text-2xl text-forest-dark">Typografie</h3>
            <div className="mt-4 space-y-3">
              <p className="text-xs uppercase tracking-widest text-sage-600">
                Eyebrow · Inter caps tracked
              </p>
              <h1 className="font-serif text-6xl font-light text-forest-dark">
                Cormorant serif, 6xl light
              </h1>
              <h2 className="font-serif text-4xl font-light text-forest-dark">
                Cormorant serif, 4xl light
              </h2>
              <p className="max-w-prose text-forest-dark/80">
                Body-tekst in Inter, schoon, leesbaar, met een lichte cream-achtergrond
                en olijfgroene accenten voor consistentie met de boutique-uitstraling.
              </p>
            </div>
          </section>

          <section>
            <h3 className="font-serif text-2xl text-forest-dark">Buttons</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              <Button>Reserveren</Button>
              <Button variant="ghost">Bekijk details</Button>
              <ButtonLink href="/">Naar home</ButtonLink>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section>
            <h3 className="font-serif text-2xl text-forest-dark">Pills</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              <Pill>Blue Haven</Pill>
              <Pill>Olive Retreat</Pill>
              <Pill>Horizon Villa</Pill>
            </div>
          </section>

          <section>
            <h3 className="font-serif text-2xl text-forest-dark">
              Card + IconStat
            </h3>
            <Card className="mt-4 max-w-md p-6">
              <Pill>Blue Haven</Pill>
              <h4 className="mt-3 font-serif text-2xl text-forest-dark">
                Voorbeeld accommodatie
              </h4>
              <p className="text-sm text-forest-dark/60">
                Plaatsnaam, Land
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <IconStat icon={Users} label="6 gasten" />
                <IconStat icon={Bed} label="3 slaapkamers" />
                <IconStat icon={Bath} label="3 badkamers" />
              </div>
            </Card>
          </section>

          <section>
            <h3 className="font-serif text-2xl text-forest-dark">Kleurpalet</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {swatches.map(([name, hex, cls]) => (
                <div key={name} className="text-center">
                  <div className={`h-20 rounded-xl ${cls}`} />
                  <p className="mt-2 text-xs font-medium text-forest-dark">{name}</p>
                  <p className="text-[10px] text-forest-dark/60">{hex}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
