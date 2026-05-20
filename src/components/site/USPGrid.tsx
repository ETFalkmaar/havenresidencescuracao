import {
  CalendarCheck,
  HandHeart,
  House,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { siteConfig, type UspIcon } from '@/lib/site-config';

const ICONS: Record<UspIcon, LucideIcon> = {
  house: House,
  handHeart: HandHeart,
  calendarCheck: CalendarCheck,
  sun: Sun,
};

export function USPGrid() {
  return (
    <section className="border-b border-black/[0.06] py-20">
      <Container>
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.usps.map((usp) => {
            const Icon = ICONS[usp.icon];
            return (
              <div key={usp.title} className="text-center">
                <Icon
                  className="mx-auto h-12 w-12 text-sage-600"
                  strokeWidth={1.25}
                />
                <h3 className="mt-5 font-serif text-xl text-forest-dark">
                  {usp.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-dark/70">
                  {usp.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
