const {
  colorRepo,
  titleRepo,
  logoRepo,
  colCardRepo,
  videoRepo,
  aboutRepo,
  siteContentRepo,
  eventRepo,
} = require("../repositories/siteRepository");

// Centralized fallback content - previously scattered inline in server.js
const DEFAULTS = {
  colors: { primary: "#009344", secondary: "#006635", other: "#f6a623" },
  titles: {
    title: "Green Technology",
    subTitle: "",
    heroEyebrow: "INNOVATION",
    heroUrl: "#",
  },
  logo: { logoMark: "GT", logoTextTop: "Green", logoTextBottom: "Technology" },
  colCard: {
    label: "ANNOUNCEMENT",
    heading: "Upcoming Events",
    description: "Stay updated",
    images: [],
  },
  video: { videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  about: {
    title: "ABOUT US",
    description: "We are committed to innovation.",
    images: [],
  },
};

/**
 * Assembles all data required to render the tenant's home page.
 * Business logic (defaults, shaping data) lives here -
 * controllers stay thin, repositories stay dumb.
 */
async function getHomePageData(tenantId) {
  const [colors, titles, events, logo, colCard, video, about, siteContent] =
    await Promise.all([
      colorRepo.findOne(tenantId),
      titleRepo.findOne(tenantId),
      eventRepo.findAll(tenantId),
      logoRepo.findOne(tenantId),
      colCardRepo.findOne(tenantId),
      videoRepo.findOne(tenantId),
      aboutRepo.findOne(tenantId),
      siteContentRepo.findOne(tenantId),
    ]);

  return {
    colors: colors || DEFAULTS.colors,
    titles: titles || DEFAULTS.titles,
    events: events || [],
    logo: logo || DEFAULTS.logo,
    colCard: colCard || DEFAULTS.colCard,
    video: video || DEFAULTS.video,
    about: about || DEFAULTS.about,
    siteContent: siteContent || {},
  };
}

module.exports = { getHomePageData };
