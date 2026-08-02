import { environment } from '../../../environments/environment';
import type { BlogPost } from '../../core/services/blog/blog.service';

export const BASE_URL = environment.webUrl;

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

export interface JsonTrip {
  id?: string;
  fromCity?: string | null;
  toCity?: string | null;
  fromState?: string | null;
  toState?: string | null;
  departureTime?: string | null;
  arrivalTime?: string | null;
  departureDate?: string | null;
  arrivalDate?: string | null;
  price?: number | string | null;
  boardingCity?: string | null;
  destCity?: string | null;
  tripTime?: string | null;
  arriveTime?: string | null;
  seatsLeft?: number | null;
  tripDate?: string | null;
}

export function currentPath(url: string): string {
  return url.split('?')[0];
}

function toIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return isNaN(date.getTime()) ? undefined : date.toISOString();
}

function dateTime(date?: string | null, time?: string | null): string | undefined {
  if (!date) return undefined;
  return time ? `${date}T${time}` : date;
}

export function breadcrumbList(crumbs: BreadcrumbItem[]): Record<string, unknown> {
  const items: BreadcrumbItem[] = [
    { name: 'تفية', url: `${BASE_URL}/home` },
    ...crumbs,
  ];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  };
}

export function webPage(name: string, path: string, description?: string): Record<string, unknown> {
  return {
    '@type': 'WebPage',
    '@id': `${BASE_URL}${path}#webpage`,
    url: `${BASE_URL}${path}`,
    name,
    ...(description ? { description } : {}),
    isPartOf: { '@id': `${BASE_URL}/#website` },
  };
}

export function pageGraph(
  name: string,
  path: string,
  crumbs: BreadcrumbItem[],
  description?: string,
): object[] {
  return [webPage(name, path, description), breadcrumbList(crumbs)];
}

export function busTrip(trip: JsonTrip): Record<string, unknown> | undefined {
  const id = trip.id;
  if (!id) return undefined;
  const fromCity = trip.fromCity ?? trip.boardingCity;
  const toCity = trip.toCity ?? trip.destCity;
  const from = fromCity
    ? { '@type': 'BusStop', name: trip.fromState ? `${fromCity}، ${trip.fromState}` : fromCity }
    : undefined;
  const to = toCity
    ? { '@type': 'BusStop', name: trip.toState ? `${toCity}، ${trip.toState}` : toCity }
    : undefined;
  const routeName = [from?.name, to?.name].filter(Boolean).join(' إلى ');
  const result: Record<string, unknown> = {
    '@type': 'BusTrip',
    '@id': `${BASE_URL}/seat/${id}#trip`,
    name: routeName ? `رحلة حافلة ${routeName}` : `رحلة حافلة ${id}`,
    provider: { '@id': `${BASE_URL}/#organization` },
  };
  if (from) result['departureBusStop'] = from;
  if (to) result['arrivalBusStop'] = to;
  const departureTime = dateTime(trip.departureDate ?? trip.tripDate, trip.departureTime ?? trip.tripTime);
  const arrivalTime = dateTime(trip.arrivalDate ?? trip.tripDate, trip.arrivalTime ?? trip.arriveTime);
  if (departureTime) result['departureTime'] = departureTime;
  if (arrivalTime) result['arrivalTime'] = arrivalTime;
  const price = trip.price == null ? undefined : Number(trip.price);
  if (price != null && !isNaN(price)) {
    result['offers'] = { '@type': 'Offer', price, priceCurrency: 'SDG' };
  }
  return result;
}

export function tripItemList(
  trips: JsonTrip[],
  name: string,
  path: string,
): Record<string, unknown> | undefined {
  const items = trips
    .map(t => busTrip(t))
    .filter((t): t is Record<string, unknown> => t !== undefined);
  if (!items.length) return undefined;
  return {
    '@type': 'ItemList',
    name,
    url: `${BASE_URL}${path}`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item,
    })),
  };
}

export function blogPosting(post: BlogPost): Record<string, unknown> {
  const url = `${BASE_URL}/blogs/blog/${post.slug}`;
  const result: Record<string, unknown> = {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    headline: post.title,
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  if (post.excerpt) result['description'] = post.excerpt;
  if (post.author?.name) result['author'] = { '@type': 'Person', name: post.author.name };
  const coverImage = post.coverImage
    ? post.coverImage.startsWith('http')
      ? post.coverImage
      : `${environment.fileUrl}${post.coverImage}`
    : undefined;
  if (coverImage) result['image'] = coverImage;
  const published = toIso(post.createdAt);
  const modified = toIso(post.updatedAt ?? post.createdAt);
  if (published) result['datePublished'] = published;
  if (modified) result['dateModified'] = modified;
  return result;
}

export function blogItemList(posts: BlogPost[]): Record<string, unknown> | undefined {
  const items = posts.map(p => blogPosting(p));
  if (!items.length) return undefined;
  return {
    '@type': 'ItemList',
    name: 'مقالات المدونة',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item,
    })),
  };
}

export function reservation(
  bookingId: string,
  tripName: string,
  price: number,
  currency: string,
  modifiedTime: string,
): Record<string, unknown> {
  return {
    '@type': 'Reservation',
    reservationId: bookingId,
    reservationStatus: 'https://schema.org/ReservationConfirmed',
    reservationFor: {
      '@type': 'BusTrip',
      name: tripName,
      offers: { '@type': 'Offer', price, priceCurrency: currency },
    },
    provider: { '@id': `${BASE_URL}/#organization` },
    modifiedTime,
    totalPrice: price,
    priceCurrency: currency,
  };
}
