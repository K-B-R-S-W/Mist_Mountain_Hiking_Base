const EXPERIENCES = [
  {
    title: "Pahiyangala cave trail",
    description: "A guided circuit linking the cave approach with nearby ridge viewpoints.",
  },
  {
    title: "Waterfall loop",
    description: "Half-day route covering multiple falls in the Pimbura area with local pacing.",
  },
  {
    title: "Plantation walk",
    description: "Tea and cinnamon field walk with harvesting and processing context.",
  },
  {
    title: "Vanishing river tunnel",
    description: "Paragala tunnel excursion with local safety routing and weather checks.",
  },
];

export default function ExperiencesPage() {
  return (
    <div className="page-shell py-16">
      <p className="eyebrow">EXPERIENCES</p>
      <h1 className="mt-3 text-3xl md:text-5xl">The real Pimbura hiking circuit</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Plan your stay around terrain, weather, and route intensity. We help guests structure
        mornings for hiking and afternoons for spring pools and rest.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {EXPERIENCES.map((experience) => (
          <article key={experience.title} className="card">
            <h2 className="text-xl">{experience.title}</h2>
            <p className="mt-3 text-muted">{experience.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

