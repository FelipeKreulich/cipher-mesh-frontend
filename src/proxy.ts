import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Next 16 renamed the middleware convention to "proxy"; next-intl still ships
// the handler under its original name.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
