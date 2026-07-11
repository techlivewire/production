const BaseRepository = require("./baseRepository");

const Color = require("../models/color");
const Title = require("../models/title");
const Logo = require("../models/logo");
const ColCard = require("../models/colCard");
const Video = require("../models/video");
const About = require("../models/about");
const SiteContent = require("../models/SiteContent");
const Event = require("../models/Event");

/**
 * Repositories for everything the home page ("/") needs.
 * Each one is just a BaseRepository bound to its model -
 * no per-model boilerplate required.
 */
module.exports = {
  colorRepo: new BaseRepository(Color),
  titleRepo: new BaseRepository(Title),
  logoRepo: new BaseRepository(Logo),
  colCardRepo: new BaseRepository(ColCard),
  videoRepo: new BaseRepository(Video),
  aboutRepo: new BaseRepository(About),
  siteContentRepo: new BaseRepository(SiteContent),
  eventRepo: new BaseRepository(Event),
};
