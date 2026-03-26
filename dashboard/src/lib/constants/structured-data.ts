import { Description, Email, Name } from "@/types";

interface PostalAddress {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
}

interface AggregateRating {
  "@type": "AggregateRating";
  ratingValue: string;
  ratingCount: string;
}

interface GeoCoordinates {
  "@type": "GeoCoordinates";
  latitude: string;
  longitude: string;
}

interface EntryPoint {
  "@type": "EntryPoint";
  urlTemplate: string;
}

interface Appointment extends Name {
  "@type": "Appointment";
}

interface ScheduleAction {
  "@type": "ScheduleAction";
  target: EntryPoint;
  result: Appointment;
}