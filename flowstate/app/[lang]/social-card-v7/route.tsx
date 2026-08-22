const SOCIAL_IMAGE = "https://flow.virzyguns.com/social/flow-og-home-0808.png";

export function GET() {
  return Response.redirect(SOCIAL_IMAGE, 307);
}
