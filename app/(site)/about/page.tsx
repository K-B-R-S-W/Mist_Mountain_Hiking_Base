export default function AboutPage() {
  return (
    <div className="page-shell py-16">
      <p className="eyebrow">ABOUT MIST MOUNTAIN</p>
      <h1 className="mt-3 text-3xl md:text-5xl">
        A family-run hiking base rooted in plantation land and spring water.
      </h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="card">
          <h2 className="text-xl">What makes it different</h2>
          <p className="mt-3 text-muted">
            Mist Mountain sits on a working tea-and-cinnamon landscape in Pimbura. The stay is
            designed around real terrain, local routes, and slower mountain days.
          </p>
        </article>
        <article className="card">
          <h2 className="text-xl">Water and weather</h2>
          <p className="mt-3 text-muted">
            Two natural springs feed the pools year-round. Cooler mornings, mist bands, and
            hillside winds shape the daily rhythm across decks and trails.
          </p>
        </article>
      </div>
    </div>
  );
}

