const SOCIAL_IMAGE = "https://flow.virzyguns.com/social/flow-og-home-0808.jpg";

export function GET() {
  return Response.redirect(SOCIAL_IMAGE, 307);
}
