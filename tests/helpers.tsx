import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import en from "@/../messages/en.json";

/**
 * Components read their copy through next-intl, so tests render them against
 * the real English messages rather than fixtures. A missing or renamed key
 * fails the test instead of silently rendering a placeholder.
 */
export function renderWithIntl(ui: ReactElement, locale = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={en}>
      {ui}
    </NextIntlClientProvider>,
  );
}

export { en as messages };
