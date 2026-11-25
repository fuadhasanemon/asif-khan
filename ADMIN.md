# Admin panel

Edit the site's content at **/admin** without touching code: publications,
profile and contact, section order and titles, research lines, experience,
methods, the record numbers, and the CV PDF.

Every save is checked with the same rules the build uses, across all content
files. If something is wrong (a missing field, a duplicate slug, an author
not written as "Surname, I. I."), nothing is saved and the panel lists what to
fix. A save can never break the site.

## Turn it on

Set `ADMIN_PASSWORD` (at least 8 characters). Without it, /admin shows
"The admin panel is off".

## Where saves go

| Where the site runs | What a save does | Setup |
|---|---|---|
| Your computer, `pnpm dev` | Writes `content/*.json` (and `public/files/…` for the CV); the page reloads with the change | `ADMIN_PASSWORD` in `.env.local` |
| Vercel (production) | Commits the file to GitHub; Vercel rebuilds and the change is live in about a minute | `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO`, optional `GITHUB_BRANCH` |

### Production setup (once)

1. Push this project to a GitHub repository and import it in Vercel.
2. On GitHub, create a **fine-grained personal access token**: only this
   repository, permission **Contents: Read and write**.
3. In Vercel → Project → Settings → Environment Variables, add
   `ADMIN_PASSWORD`, `GITHUB_TOKEN`, `GITHUB_REPO` (`owner/name`) and, if the
   branch is not `main`, `GITHUB_BRANCH`. Redeploy.
4. Open `https://your-domain/admin` and sign in.

## Using it

- **Lists** (publications, roles, paragraphs, authors…): *Add item*,
  *Up* / *Down* to reorder, *Remove* then *Confirm remove*.
- **Empty fields** marked “(empty)” are saved as “none” (for example, an empty
  abstract shows the placeholder box).
- **Publication slug**: *From title* fills it from the title.
- **Section order**: *Sections and order* → *Home order*; the nav follows it.
- **CV**: on the admin home, upload a PDF (up to 8 MB).
- Leaving a page with unsaved changes asks for confirmation.

## Security notes

- Sessions last 8 hours in an httpOnly, SameSite=Strict cookie scoped to
  /admin, signed with `ADMIN_SECRET` (or a key derived from the password).
  Changing the password signs everyone out.
- Every save action re-checks the session on the server.
- /admin is excluded from search engines (robots.txt and `noindex`).
- There is no rate limiting on sign-in; use a long, unique password.
