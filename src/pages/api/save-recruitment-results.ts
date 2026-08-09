import type { APIRoute } from 'astro';

export const prerender = true;

export const ALL: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: 'Recruitment results are managed directly via Keystatic CMS Admin at /keystatic',
      keystaticUrl: '/keystatic/#/keystatic/singletons/recruitment_results',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
