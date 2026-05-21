import type { Metadata } from 'next';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { InquiryForm } from '@/components/site/InquiryForm';
import { PageHeader } from '@/components/site/PageHeader';
import { contactContent } from '@/lib/page-content';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Contact',
  description: contactContent.hero.description,
};

export default function ContactPage() {
  const { hero, intro } = contactContent;
  const phoneDigits = siteConfig.contact.phone?.replace(/\s/g, '');
  const whatsappUrl = phoneDigits
    ? `https://wa.me/${phoneDigits.replace('+', '')}`
    : null;

  return (
    <>
      <PageHeader {...hero} />
      <section className="py-20">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-center leading-relaxed text-forest-dark/80">
              {intro}
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {siteConfig.contact.phone ? (
                <Card className="p-6 text-center">
                  <Phone
                    className="mx-auto h-8 w-8 text-sage-600"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-4 font-serif text-xl text-forest-dark">
                    Telefoon
                  </h3>
                  <a
                    href={`tel:${phoneDigits}`}
                    className="mt-2 inline-block text-sm text-forest-dark/80 transition-colors hover:text-sage-700"
                  >
                    {siteConfig.contact.phone}
                  </a>
                  {whatsappUrl ? (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-xs text-sage-700 transition-colors hover:text-sage-800"
                    >
                      Ook via WhatsApp
                    </a>
                  ) : null}
                </Card>
              ) : null}

              {siteConfig.contact.email ? (
                <Card className="p-6 text-center">
                  <Mail
                    className="mx-auto h-8 w-8 text-sage-600"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-4 font-serif text-xl text-forest-dark">
                    Email
                  </h3>
                  <a
                    href={`mailto:${siteConfig.contact.email}`}
                    className="mt-2 inline-block text-sm text-forest-dark/80 transition-colors hover:text-sage-700"
                  >
                    {siteConfig.contact.email}
                  </a>
                </Card>
              ) : null}

              {siteConfig.social.instagram ? (
                <Card className="p-6 text-center">
                  <Instagram
                    className="mx-auto h-8 w-8 text-sage-600"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-4 font-serif text-xl text-forest-dark">
                    Instagram
                  </h3>
                  <a
                    href={siteConfig.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-forest-dark/80 transition-colors hover:text-sage-700"
                  >
                    @blue_haven_residences
                  </a>
                </Card>
              ) : null}

              {siteConfig.contact.address ? (
                <Card className="p-6 text-center">
                  <MapPin
                    className="mx-auto h-8 w-8 text-sage-600"
                    strokeWidth={1.25}
                  />
                  <h3 className="mt-4 font-serif text-xl text-forest-dark">
                    Adres
                  </h3>
                  <p className="mt-2 text-sm text-forest-dark/80">
                    {siteConfig.contact.address}
                  </p>
                </Card>
              ) : null}
            </div>

            <div className="mt-16">
              <InquiryForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
