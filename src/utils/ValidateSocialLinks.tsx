import { SocialLinks } from "../types";

export const validateSocialLinks = (links: SocialLinks): string | null => {
  const regexes: { [key: string]: RegExp } = {
    telegram: /^https:\/\/(t\.me|telegram\.me)\/[a-zA-Z0-9_]{5,32}$/,
    discord:
      /^https:\/\/discord\.(com|gg)\/(invite\/[a-zA-Z0-9-_]+|[a-zA-Z0-9-_]+)$/,
    instagram: /^https:\/\/www\.instagram\.com\/[a-zA-Z0-9._-]+\/$/,
    youtube:
      /^https:\/\/(www\.)?youtube\.com\/(channel\/[a-zA-Z0-9_-]+|user\/[a-zA-Z0-9_-]+)$/,
    twitter: /^https:\/\/twitter\.com\/[a-zA-Z0-9_]{1,15}$/,
    tiktok: /^https:\/\/www\.tiktok\.com\/@[a-zA-Z0-9._-]+$/,
  };

  // Check each link one by one
  for (const key in links) {
    const link = links[key as keyof SocialLinks];

    // Skip validation if the link is empty or null
    if (!link || link.trim() === "") continue;

    // Check for validation failure using regex
    if (!regexes[key]?.test(link)) {
      // Return the first invalid field's error message
      switch (key) {
        case "telegram":
          return "Invalid Telegram link";
        case "discord":
          return "Invalid Discord link";
        case "instagram":
          return "Invalid Instagram link";
        case "youtube":
          return "Invalid YouTube link";
        case "twitter":
          return "Invalid Twitter link";
        case "tiktok":
          return "Invalid TikTok link";
        default:
          return null;
      }
    }
  }

  // If all links are valid or empty, return null
  return null;
};
