import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if expired and validate the user against the auth server.
  // If the user has been deleted in Supabase, getUser() returns null even if
  // the cookie still holds an old JWT.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Gate /admin/* routes
  if (pathname.startsWith("/admin")) {
    const isLogin = pathname === "/admin/login";
    const isApi = pathname.startsWith("/admin/api/");

    if (!user && !isLogin && !isApi) {
      // Anonymous trying to access protected admin → bounce to login.
      // Also ACTIVELY clear any stale cookies so a deleted user can't reuse them.
      const loginUrl = new URL("/admin/login", request.url);
      const redirect = NextResponse.redirect(loginUrl);

      // Forward the cookie clears that updateSession may have queued (e.g. when
      // getUser invalidates a stale JWT).
      for (const c of response.cookies.getAll()) {
        redirect.cookies.set(c.name, c.value, c);
      }
      return redirect;
    }

    if (user && isLogin) {
      // Already signed in: send them to the dashboard.
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return response;
}
