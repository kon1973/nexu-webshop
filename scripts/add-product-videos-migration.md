Migration steps (manual):

1) Update Prisma schema (done) - added `videos Json?` on `Product` model.
2) Run `npx prisma migrate dev --name add-product-videos` to generate and apply migration locally.
3) Update any seed scripts if you want to populate demo videos (optional).
4) Deploy migration to production environment: `DATABASE_URL` must be set; run `npx prisma migrate deploy`.
5) Update admin UI and API to accept and validate videos (see code changes in `app/admin/edit-product` and `app/admin/add-product`).
6) Add tests for product JSON-LD to include VideoObject when `videos` is present.

Notes:
- `videos` is stored as JSON to allow flexible fields like `url`, `title`, `description`, `thumbnail`, `uploadDate`.
- Consider adding validation for video host domains if you restrict to YouTube/Vimeo/CDN.
