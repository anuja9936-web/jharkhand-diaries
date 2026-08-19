# Phase 1: Destination Database Foundation

This phase adds the first real tourism data layer for the Jharkhand platform.

## What was added

- `public.destinations` table
- destination category and status enums
- row-level security for public browsing and admin-managed writes
- destination seed/demo content for Jharkhand
- reusable destination service functions
- real public `Explore` page backed by Supabase
- destination detail route at `/destinations/:slug`

## Categories

- `waterfall`
- `heritage`
- `tribal_culture`
- `eco`
- `craft`
- `adventure`
- `religious`
- `wildlife`

## Status values

- `draft`
- `published`

## RLS behavior

- Public and authenticated users can read only `published` destinations.
- Insert/update/delete are restricted to authenticated users whose JWT role resolves to `admin`.
- The admin policy depends on the role claim being available in the Clerk-to-Supabase JWT setup.

## Service functions

- `getPublishedDestinations()`
- `getDestinationBySlug(slug)`
- `getDestinationsByCategory(category)`
- `getDestinationsByDistrict(district)`
- `searchDestinations(searchTerm)`

## Routes

- `/explore`
- `/destinations/:slug`

## Seed data note

The seed rows are demo placeholders for development and UI testing. Coordinates, entry fees, and some descriptive details are intentionally conservative and should be reviewed before any public launch.
