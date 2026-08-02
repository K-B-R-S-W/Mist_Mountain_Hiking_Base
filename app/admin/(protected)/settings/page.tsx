import { updateSiteSettings } from "@/lib/actions/update-site-settings";
import { getSiteBranding, getSiteSettings } from "@/lib/repositories";
import { SiteAssetUpload } from "@/components/admin/site-asset-upload";

export default async function AdminSettingsPage() {
  const [settings, branding] = await Promise.all([getSiteSettings(), getSiteBranding()]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl text-primary">Settings</h1>
      <p className="mt-2 text-sm text-muted">Global website settings and contact metadata.</p>

      <section className="card mt-6">
        <h2 className="text-lg">Branding</h2>
        <p className="mt-1 text-sm text-muted">
          Logo shown in the site header. Favicon shown in browser tabs and bookmarks.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <SiteAssetUpload
            type="logo"
            label="Logo"
            currentUrl={branding.logoUrl}
            currentAlt={branding.logoAlt}
            removeConfirmMessage="Remove the logo? The header will fall back to text only."
          />
          <SiteAssetUpload
            type="favicon"
            label="Favicon"
            currentUrl={branding.faviconUrl}
            removeConfirmMessage="Remove the favicon? Browser tabs will fall back to the generated mark."
          />
        </div>
        <p className="mt-4 text-xs text-muted">
          Square images work best (e.g. 512×512). The favicon updates in browser tabs within a few
          minutes — browsers cache icons aggressively.
        </p>
      </section>

      <section className="card mt-6">
        <h2 className="text-lg">Homepage imagery</h2>
        <p className="mt-1 text-sm text-muted">
          Photos behind the Hero, &ldquo;The Mist Experience&rdquo;, and Experiences sections on the
          homepage. Each falls back to a solid brand-color block until an image is uploaded.
        </p>

        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SiteAssetUpload
            type="hero"
            label="Hero"
            currentUrl={branding.heroUrl}
            currentAlt={branding.heroAlt}
            removeConfirmMessage="Remove the hero image? The homepage will fall back to a solid forest-green background."
            aspect="wide"
          />
          <SiteAssetUpload
            type="mist_experience"
            label="The Mist Experience"
            currentUrl={branding.mistExperienceUrl}
            currentAlt={branding.mistExperienceAlt}
            removeConfirmMessage="Remove this image? That section will fall back to a solid moss-green block."
            aspect="wide"
          />
          <SiteAssetUpload
            type="experiences"
            label="Experiences"
            currentUrl={branding.experiencesUrl}
            currentAlt={branding.experiencesAlt}
            removeConfirmMessage="Remove this image? That section will fall back to a solid clay block."
            aspect="wide"
          />
        </div>
        <p className="mt-4 text-xs text-muted">
          Landscape images work best (e.g. 1600×1200 or wider). The hero image is the largest, most
          visible photo on the site — use your strongest shot of the springs, decks, or mountain view.
        </p>
      </section>

      <form
        action={async (formData) => {
          "use server";
          await updateSiteSettings({
            hotelName: formData.get("hotelName"),
            tagline: formData.get("tagline"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            address: formData.get("address"),
            heroTitle: formData.get("heroTitle"),
            heroSubtitle: formData.get("heroSubtitle"),
            bookingUrl: formData.get("bookingUrl"),
            googleMapsUrl: formData.get("googleMapsUrl"),
            googlePlaceId: formData.get("googlePlaceId"),
            whatsapp: formData.get("whatsapp"),
            facebook: formData.get("facebook"),
            instagram: formData.get("instagram"),
            tiktok: formData.get("tiktok"),
          });
        }}
        className="card mt-6 space-y-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-field">
            <span>Hotel name</span>
            <input name="hotelName" defaultValue={settings.hotelName} className="form-input" />
          </label>
          <label className="form-field">
            <span>Tagline</span>
            <input name="tagline" defaultValue={settings.tagline ?? ""} className="form-input" />
          </label>
          <label className="form-field">
            <span>Phone</span>
            <input name="phone" defaultValue={settings.phone ?? ""} className="form-input" />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input name="email" defaultValue={settings.email ?? ""} className="form-input" />
          </label>
        </div>
        <label className="form-field">
          <span>Address</span>
          <textarea name="address" defaultValue={settings.address ?? ""} rows={3} className="form-input" />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="form-field">
            <span>Hero title</span>
            <input name="heroTitle" defaultValue={settings.heroTitle ?? ""} className="form-input" />
          </label>
          <label className="form-field">
            <span>Hero subtitle</span>
            <input
              name="heroSubtitle"
              defaultValue={settings.heroSubtitle ?? ""}
              className="form-input"
            />
          </label>
          <label className="form-field">
            <span>Booking.com URL</span>
            <input name="bookingUrl" defaultValue={settings.bookingUrl ?? ""} className="form-input" />
          </label>
        </div>

        <div className="border-t border-black/5 pt-4">
          <h3 className="text-sm font-medium">Quick links</h3>
          <p className="mt-1 text-xs text-muted">
            Shown as icons in the footer and contact page. Leave any blank to hide that icon.
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="form-field">
              <span>WhatsApp number</span>
              <input
                name="whatsapp"
                placeholder="+94 77 779 0674"
                defaultValue={settings.whatsapp ?? ""}
                className="form-input"
              />
            </label>
            <label className="form-field">
              <span>Facebook URL</span>
              <input
                name="facebook"
                placeholder="https://facebook.com/..."
                defaultValue={settings.facebook ?? ""}
                className="form-input"
              />
            </label>
            <label className="form-field">
              <span>Instagram URL</span>
              <input
                name="instagram"
                placeholder="https://instagram.com/..."
                defaultValue={settings.instagram ?? ""}
                className="form-input"
              />
            </label>
            <label className="form-field">
              <span>TikTok URL</span>
              <input
                name="tiktok"
                placeholder="https://tiktok.com/@..."
                defaultValue={settings.tiktok ?? ""}
                className="form-input"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted">
            WhatsApp accepts a phone number with country code — the site builds the wa.me link for you.
          </p>
        </div>

        <div className="border-t border-black/5 pt-4">
          <h3 className="text-sm font-medium">Location &amp; Google</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="form-field md:col-span-2">
              <span>Google Maps embed URL</span>
              <input
                name="googleMapsUrl"
                placeholder="https://www.google.com/maps/embed?pb=..."
                defaultValue={settings.googleMapsUrl ?? ""}
                className="form-input"
              />
            </label>
            <p className="text-xs text-muted md:col-span-2 md:-mt-2">
              In Google Maps: search the property → Share → Embed a map → copy the URL inside the{" "}
              <code>src=&quot;...&quot;</code> attribute (not the share link) and paste it here.
            </p>
            <label className="form-field">
              <span>Google Place ID</span>
              <input
                name="googlePlaceId"
                placeholder="ChIJ..."
                defaultValue={settings.googlePlaceId ?? ""}
                className="form-input"
              />
            </label>
            <p className="text-xs text-muted">
              Used only for the Google review sync on the Testimonials page — find it by searching the
              business name at{" "}
              <span className="font-mono">developers.google.com/maps/documentation/places/web-service/place-id</span>
              . Also requires a <span className="font-mono">GOOGLE_PLACES_API_KEY</span> server
              environment variable (see README).
            </p>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>
    </div>
  );
}
