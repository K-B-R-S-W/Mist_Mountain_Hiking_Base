"use client";

import { useState } from "react";
import type { SiteSettings, SiteBranding } from "@/lib/types/domain";
import { updateSiteSettings } from "@/lib/actions/update-site-settings";
import { SiteAssetUpload } from "@/components/admin/site-asset-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ActionButton } from "@/components/admin/ui/action-button";
import { useToast } from "@/components/admin/ui/toast";
import {
  Palette,
  Building2,
  Share2,
  MapPin,
  BookOpen,
  Save,
  Info,
} from "lucide-react";

interface SettingsTabsProps {
  settings: SiteSettings;
  branding: SiteBranding;
}

export function SettingsTabs({ settings, branding }: SettingsTabsProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "branding" | "general" | "social" | "google" | "about"
  >("branding");

  const handleGeneralSubmit = async (formData: FormData) => {
    try {
      const result = await updateSiteSettings({
        hotelName: formData.get("hotelName"),
        tagline: formData.get("tagline"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
        heroTitle: formData.get("heroTitle"),
        heroSubtitle: formData.get("heroSubtitle"),
        bookingUrl: formData.get("bookingUrl"),
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Hotel & contact settings saved.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings.");
    }
  };

  const handleSocialSubmit = async (formData: FormData) => {
    try {
      const result = await updateSiteSettings({
        whatsapp: formData.get("whatsapp"),
        facebook: formData.get("facebook"),
        instagram: formData.get("instagram"),
        tiktok: formData.get("tiktok"),
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Social channels & WhatsApp links saved.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save social links.");
    }
  };

  const handleGoogleSubmit = async (formData: FormData) => {
    try {
      const result = await updateSiteSettings({
        googleMapsUrl: formData.get("googleMapsUrl"),
        googlePlaceId: formData.get("googlePlaceId"),
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("Google integration settings saved.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save Google settings.");
    }
  };

  const handleAboutSubmit = async (formData: FormData) => {
    try {
      const result = await updateSiteSettings({
        aboutIntro: formData.get("aboutIntro"),
        aboutDifferent: formData.get("aboutDifferent"),
        aboutLand: formData.get("aboutLand"),
        aboutLocation: formData.get("aboutLocation"),
        aboutWhoFor: formData.get("aboutWhoFor"),
        aboutTeam: formData.get("aboutTeam"),
        aboutSustainability: formData.get("aboutSustainability"),
      });

      if (!result.ok) {
        toast.error(result.error);
      } else {
        toast.success("About page story sections saved.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save story content.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-black/8 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "branding"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <Palette className="h-4 w-4" />
          <span>Branding & Imagery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "general"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Hotel & Contact</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "social"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>Social & WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("google")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "google"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>Location & Google</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
            activeTab === "about"
              ? "bg-primary text-background shadow-xs"
              : "text-muted hover:text-text hover:bg-black/4"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>About Page Stories</span>
        </button>
      </div>

      {/* Tab 1: Branding & Imagery */}
      <div className={activeTab === "branding" ? "space-y-6" : "hidden"}>
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base text-text">Logo & Favicon</h2>
            <p className="text-xs text-muted">
              Logo displays in the site header and footer. Favicon renders in browser tabs and bookmarks.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <SiteAssetUpload
              type="logo"
              label="Header Logo (Dark or Transparent)"
              currentUrl={branding.logoUrl}
              currentAlt={branding.logoAlt}
              removeConfirmMessage="Remove logo? Header will fall back to typographic wordmark."
            />
            <SiteAssetUpload
              type="favicon"
              label="Browser Favicon (Square 512×512)"
              currentUrl={branding.faviconUrl}
              removeConfirmMessage="Remove favicon? Browser tabs will use generated default mark."
            />
          </div>
        </section>

        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-base text-text">Homepage Key Visuals</h2>
            <p className="text-xs text-muted">
              High-resolution landscape photos featured on the primary landing sections of the public website.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            <SiteAssetUpload
              type="hero"
              label="Hero Primary Banner"
              currentUrl={branding.heroUrl}
              currentAlt={branding.heroAlt}
              removeConfirmMessage="Remove hero image? Homepage will use brand color backdrop."
              aspect="wide"
            />
            <SiteAssetUpload
              type="mist_experience"
              label="The Mist Experience Banner"
              currentUrl={branding.mistExperienceUrl}
              currentAlt={branding.mistExperienceAlt}
              removeConfirmMessage="Remove image? Section will fall back to moss tint."
              aspect="wide"
            />
            <SiteAssetUpload
              type="experiences"
              label="Experiences Overview"
              currentUrl={branding.experiencesUrl}
              currentAlt={branding.experiencesAlt}
              removeConfirmMessage="Remove image? Section will fall back to clay tint."
              aspect="wide"
            />
          </div>
        </section>
      </div>

      {/* Tab 2: General Hotel Info */}
      <div className={activeTab === "general" ? "block" : "hidden"}>
        <form action={handleGeneralSubmit} className="card p-6 space-y-6 shadow-xs">
          <div className="space-y-4">
            <div className="border-b border-black/8 pb-3">
              <h2 className="font-semibold text-base text-text">Hotel Identity & Contact Details</h2>
              <p className="text-xs text-muted">Primary business information displayed across headers, footers, and booking pages.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-field">
                <label htmlFor="hotelName" className="text-xs font-medium text-text">
                  Property / Hotel Name
                </label>
                <input
                  id="hotelName"
                  name="hotelName"
                  defaultValue={settings.hotelName}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="tagline" className="text-xs font-medium text-text">
                  Property Tagline
                </label>
                <input
                  id="tagline"
                  name="tagline"
                  defaultValue={settings.tagline ?? ""}
                  placeholder="e.g. Natural Spring Retreat & Tea Mountain Base"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="phone" className="text-xs font-medium text-text">
                  Primary Contact Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  defaultValue={settings.phone ?? ""}
                  placeholder="+94 77 779 0674"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="email" className="text-xs font-medium text-text">
                  Inquiry Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={settings.email ?? ""}
                  placeholder="info@mistmountain.lk"
                  className="form-input"
                />
              </div>

              <div className="form-field sm:col-span-2">
                <label htmlFor="address" className="text-xs font-medium text-text">
                  Physical Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  defaultValue={settings.address ?? ""}
                  placeholder="Mist Mountain Hiking Base, Ella, Sri Lanka"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="heroTitle" className="text-xs font-medium text-text">
                  Hero Main Headline
                </label>
                <input
                  id="heroTitle"
                  name="heroTitle"
                  defaultValue={settings.heroTitle ?? ""}
                  placeholder="Natural spring retreat in the Ella mountains"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="heroSubtitle" className="text-xs font-medium text-text">
                  Hero Subtitle
                </label>
                <input
                  id="heroSubtitle"
                  name="heroSubtitle"
                  defaultValue={settings.heroSubtitle ?? ""}
                  placeholder="Three secluded suites on an active tea estate..."
                  className="form-input"
                />
              </div>

              <div className="form-field sm:col-span-2">
                <label htmlFor="bookingUrl" className="text-xs font-medium text-text">
                  Booking.com Direct Property URL (Optional)
                </label>
                <input
                  id="bookingUrl"
                  name="bookingUrl"
                  defaultValue={settings.bookingUrl ?? ""}
                  placeholder="https://www.booking.com/hotel/lk/..."
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/8 flex justify-end">
            <ActionButton pendingLabel="Saving hotel details...">
              <Save className="h-4 w-4" />
              <span>Save Hotel & Contact</span>
            </ActionButton>
          </div>
        </form>
      </div>

      {/* Tab 3: Social Links */}
      <div className={activeTab === "social" ? "block" : "hidden"}>
        <form action={handleSocialSubmit} className="card p-6 space-y-6 shadow-xs">
          <div className="space-y-4">
            <div className="border-b border-black/8 pb-3">
              <h2 className="font-semibold text-base text-text">Social Channels & Direct Chat</h2>
              <p className="text-xs text-muted">
                Direct contact links shown as icons in the footer and contact sections. Leave empty to hide.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="form-field">
                <label htmlFor="whatsapp" className="text-xs font-medium text-text">
                  WhatsApp Phone Number (with Country Code)
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  defaultValue={settings.whatsapp ?? ""}
                  placeholder="+94 77 779 0674"
                  className="form-input"
                />
                <span className="text-[11px] text-muted">The website automatically formats direct wa.me chat links.</span>
              </div>

              <div className="form-field">
                <label htmlFor="facebook" className="text-xs font-medium text-text">
                  Facebook Page URL
                </label>
                <input
                  id="facebook"
                  name="facebook"
                  defaultValue={settings.facebook ?? ""}
                  placeholder="https://facebook.com/mistmountain"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="instagram" className="text-xs font-medium text-text">
                  Instagram Profile URL
                </label>
                <input
                  id="instagram"
                  name="instagram"
                  defaultValue={settings.instagram ?? ""}
                  placeholder="https://instagram.com/mistmountain"
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label htmlFor="tiktok" className="text-xs font-medium text-text">
                  TikTok Profile URL
                </label>
                <input
                  id="tiktok"
                  name="tiktok"
                  defaultValue={settings.tiktok ?? ""}
                  placeholder="https://tiktok.com/@mistmountain"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/8 flex justify-end">
            <ActionButton pendingLabel="Saving social links...">
              <Save className="h-4 w-4" />
              <span>Save Social & WhatsApp</span>
            </ActionButton>
          </div>
        </form>
      </div>

      {/* Tab 4: Location & Google */}
      <div className={activeTab === "google" ? "block" : "hidden"}>
        <form action={handleGoogleSubmit} className="card p-6 space-y-6 shadow-xs">
          <div className="space-y-4">
            <div className="border-b border-black/8 pb-3">
              <h2 className="font-semibold text-base text-text">Google Maps & Places Integration</h2>
              <p className="text-xs text-muted">Embed map rendering and Google reviews automated sync.</p>
            </div>

            <div className="space-y-4">
              <div className="form-field">
                <label htmlFor="googleMapsUrl" className="text-xs font-medium text-text">
                  Google Maps Embed URL (Iframe src only)
                </label>
                <input
                  id="googleMapsUrl"
                  name="googleMapsUrl"
                  defaultValue={settings.googleMapsUrl ?? ""}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="form-input"
                />
                <div className="flex items-start gap-1.5 p-3 rounded-lg bg-black/2 border border-black/5 text-xs text-muted">
                  <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                  <span>
                    How to get embed URL: Search property in Google Maps &rarr; Click Share &rarr; Select &ldquo;Embed a map&rdquo; &rarr; Copy the link inside <code>src=&quot;...&quot;</code> attribute.
                  </span>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="googlePlaceId" className="text-xs font-medium text-text">
                  Google Business Place ID
                </label>
                <input
                  id="googlePlaceId"
                  name="googlePlaceId"
                  defaultValue={settings.googlePlaceId ?? ""}
                  placeholder="ChIJ..."
                  className="form-input font-mono"
                />
                <span className="text-[11px] text-muted">
                  Used by the Google Review Sync engine on the Testimonials page.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-black/8 flex justify-end">
            <ActionButton pendingLabel="Saving Google settings...">
              <Save className="h-4 w-4" />
              <span>Save Location & Google</span>
            </ActionButton>
          </div>
        </form>
      </div>

      {/* Tab 5: About Page Stories */}
      <div className={activeTab === "about" ? "block" : "hidden"}>
        <form action={handleAboutSubmit} className="card p-6 space-y-6 shadow-xs">
          <div className="space-y-4">
            <div className="border-b border-black/8 pb-3">
              <h2 className="font-semibold text-base text-text">About Page Brand Stories</h2>
              <p className="text-xs text-muted">
                Rich narrative sections displayed on the public /about page. Use the editor for bold, headings, and bullet points.
              </p>
            </div>

            <div className="space-y-5">
              <RichTextEditor
                name="aboutIntro"
                label="1. Story & Introduction"
                defaultValue={settings.aboutIntro}
                placeholder="Who Mist Mountain is, origins of the retreat..."
              />
              <RichTextEditor
                name="aboutDifferent"
                label="2. What Makes Mist Mountain Different"
                defaultValue={settings.aboutDifferent}
              />
              <RichTextEditor
                name="aboutLand"
                label="3. The Mountain & Tea Plantation Land"
                defaultValue={settings.aboutLand}
              />
              <RichTextEditor
                name="aboutLocation"
                label="4. Location & Mountain Access"
                defaultValue={settings.aboutLocation}
              />
              <RichTextEditor
                name="aboutWhoFor"
                label="5. Who The Experience Is For"
                defaultValue={settings.aboutWhoFor}
              />
              <RichTextEditor
                name="aboutTeam"
                label="6. The Local Hospitality Team"
                defaultValue={settings.aboutTeam}
              />
              <RichTextEditor
                name="aboutSustainability"
                label="7. Sustainability & Spring Preservation"
                defaultValue={settings.aboutSustainability}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-black/8 flex justify-end">
            <ActionButton pendingLabel="Saving story sections...">
              <Save className="h-4 w-4" />
              <span>Save About Page Stories</span>
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
