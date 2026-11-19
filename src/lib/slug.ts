/**
 * Slugs come from content/publications.json (approved: JSON wins over the
 * prototype's computed slugs). These helpers only look them up.
 */
import { publicationBySlug, publications, type PublicationView } from "./content"

export function getPublicationBySlug(slug: string): PublicationView | undefined {
  return publicationBySlug.get(slug)
}

export function allSlugs(): string[] {
  return publications.map((p) => p.slug)
}
