const getEnvValue = (key: string, fallback: string): string => {
  const value = import.meta.env?.[key];

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return fallback;
};

export const SITE_NAME_JA = getEnvValue("VITE_SITE_NAME_JA", "広陵いどばた");
export const SITE_NAME_EN = getEnvValue("VITE_SITE_NAME_EN", "KORYO Idobata");
export const SITE_TAGLINE = getEnvValue(
  "VITE_SITE_TAGLINE",
  "まちのアイデア広場"
);

export const SITE = {
  nameJa: SITE_NAME_JA,
  nameEn: SITE_NAME_EN,
  tagline: SITE_TAGLINE,
};

export const SITE_TITLE = `${SITE.nameJa} - ${SITE.tagline}`;
