import type { Metadata } from "next";
import { getExperiencePageContent } from "@/lib/repositories";
import { AttractionCard } from "@/components/site/attraction-card";
import { ExperienceSplitRow } from "@/components/site/experience-split-row";
import { Reveal } from "@/components/site/motion/reveal";
import { Stagger, StaggerItem } from "@/components/site/motion/stagger";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "The real Pimbura hiking circuit, a working tea and spice plantation, and two natural spring pools — all reachable from Mist Mountain Hiking Base.",
};

export default async function ExperiencesPage() {
  const { attractions, plantation, springs } = await getExperiencePageContent();

  return (
    <div>
      <div className="page-shell py-16">
        <p className="eyebrow">EXPERIENCES</p>
        <h1 className="mt-3 text-3xl md:text-5xl">The real Pimbura hiking circuit</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Plan your stay around terrain, weather, and route intensity. Mornings for hiking and
          the plantation, afternoons for the spring pools and rest.
        </p>
      </div>

      {springs.length > 0 ? (
        <>
          <div className="contour-divider" />
          <div className="page-shell pt-16">
            <p className="eyebrow">THE SPRINGS</p>
            <h2 className="mt-3 max-w-xl text-2xl md:text-4xl">
              Two live water springs, gravity-fed and chemical-free
            </h2>
          </div>
          <div className="mt-10">
            {springs.map((image, index) => (
              <ExperienceSplitRow
                key={image.id}
                image={image}
                eyebrow="NATURAL SPRING POOLS"
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </>
      ) : null}

      {plantation.length > 0 ? (
        <>
          <div className="contour-divider" />
          <div className="page-shell pt-16">
            <p className="eyebrow">THE WORKING PLANTATION</p>
            <h2 className="mt-3 max-w-xl text-2xl md:text-4xl">
              We build the experience around the crops, not instead of them
            </h2>
          </div>
          <div className="mt-10">
            {plantation.map((image, index) => (
              <ExperienceSplitRow
                key={image.id}
                image={image}
                eyebrow="AGRO-TOURISM"
                reverse={index % 2 === 1}
              />
            ))}
          </div>
        </>
      ) : null}

      {attractions.length > 0 ? (
        <>
          <div className="contour-divider" />
          <section className="page-shell py-16">
            <Reveal variant="fade" duration={0.4}>
              <p className="eyebrow">THE TOURISM CIRCUIT</p>
              <h2 className="mt-3 max-w-xl text-2xl md:text-4xl">
                Caves, waterfalls, and a vanishing river — all within reach
              </h2>
              <p className="mt-4 max-w-2xl text-muted">
                Guests use Mist Mountain as a hub for guided routes to the landmarks below. Explore Kakuluwa Raja Maha Viharaya with our local expert guides.
              </p>
            </Reveal>
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {attractions.map((image) => (
                <StaggerItem key={image.id} className="h-full">
                  <AttractionCard image={image} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        </>
      ) : null}
    </div>
  );
}
