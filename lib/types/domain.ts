export type MediaFile = {
  id: string;
  bucket: string;
  path: string;
  url: string;
  alt: string | null;
  createdAt: string;
  isDeleted: boolean;
};

export type RoomSummary = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  maxGuests: number;
  basePrice: number;
  featured: boolean;
  isVisible: boolean;
  sortOrder: number;
  primaryImageUrl: string | null;
};

export type Amenity = {
  id: string;
  name: string;
  icon: string | null;
};

export type RoomDetail = RoomSummary & {
  description: string | null;
  images: Array<{ mediaId: string; url: string; alt: string | null; sortOrder: number }>;
  amenities: Amenity[];
};

export type GalleryImage = {
  id: string;
  title: string | null;
  description: string | null;
  category: string | null;
  featured: boolean;
  isVisible: boolean;
  sortOrder: number;
  mediaId: string;
  url: string;
  alt: string | null;
};

export type Testimonial = {
  id: string;
  name: string;
  country: string | null;
  rating: number | null;
  quote: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
  mediaId: string | null;
  photoUrl: string | null;
  source: "manual" | "google";
  reviewUrl: string | null;
};

export type BookingInquiry = {
  id: string;
  roomId: string | null;
  roomName: string | null;
  guestName: string;
  email: string;
  phone: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
  message: string | null;
  status: "pending" | "contacted" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  /** Booking channel. Present on all rows post-0004 migration (NOT NULL DEFAULT 'direct').
   *  Optional here since the web side never writes it and pre-migration reads
   *  may theoretically miss it if types are regenerated before the migration runs. */
  source?: "direct" | "phone" | "booking_com" | null;
  /** Booking.com reservation ID, populated by the Android Gmail sync. Not written by the web app. */
  bookingRef?: string | null;
};

export type SiteSettings = {
  hotelName: string;
  tagline: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  bookingUrl: string | null;
  googleMapsUrl: string | null;
  googlePlaceId: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  copyright: string | null;
};

export type SiteBranding = {
  logoUrl: string | null;
  logoAlt: string | null;
  faviconUrl: string | null;
  heroUrl: string | null;
  heroAlt: string | null;
  mistExperienceUrl: string | null;
  mistExperienceAlt: string | null;
  experiencesUrl: string | null;
  experiencesAlt: string | null;
};

export type AdminDashboardSummary = {
  totalRooms: number;
  visibleRooms: number;
  pendingBookings: number;
  visibleGalleryImages: number;
  approvedTestimonials: number;
  mediaLibrarySize: number;
};

export type ReportingOccupancy = {
  occupiedRoomNights: number;
  totalRoomNights: number;
  rate: number;
};

export type ReportingRevenue = {
  total: number;
  byRoom: Array<{ name: string; revenue: number }>;
};

export type ReportingSourceBreakdown = {
  direct: number;
  phone: number;
  booking_com: number;
};

export type ReportingData = {
  occupancy: ReportingOccupancy;
  revenue: ReportingRevenue;
  sourceBreakdown: ReportingSourceBreakdown;
};
