const mongoose = require("mongoose");

const siteContentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },

  // ── Deal Section ──────────────────────────────────────────────────────────
  deal: {
    label:      { type: String, default: "Circular Economy" },
    pill1:      { type: String, default: "Everything you need" },
    pill2:      { type: String, default: "To know" },
    title:      { type: String, default: "The Deal" },
    buttonText: { type: String, default: "Apply to be subject matter expert" },
    card1Heading: { type: String, default: "Expert Guidance" },
    card1Text:    { type: String, default: "Sustainable Business Union – a collaborative platform helping businesses adopt future-ready, environmentally responsible, and profitable sustainability solutions." },
    card2Heading: { type: String, default: "Innovative Strategies" },
    card2Text:    { type: String, default: "From circular economy models to climate-aligned roadmaps, we help you design strategies that work in the real world." },
    card3Heading: { type: String, default: "Industry Network" },
    card3Text:    { type: String, default: "Connect with partners, experts, and peers driving sustainability across sectors and geographies." },
    card4Heading: { type: String, default: "Impact Approach" },
    card4Text:    { type: String, default: "Data-driven frameworks that measure environmental and business impact so you can scale what works." },
  },

  // ── Topics Section ────────────────────────────────────────────────────────
  topics: {
    label:   { type: String, default: "Circular Economy" },
    heading: { type: String, default: "Everything you need to explore" },
    topic1Heading: { type: String, default: "Earth (Land & Soil)" },
    topic1Text:    { type: String, default: "Unsustainable use is leading to deforestation, desertification, and food insecurity." },
    topic2Heading: { type: String, default: "Water" },
    topic2Text:    { type: String, default: "Threats include pollution, overuse, and climate-driven droughts that challenge communities." },
    topic3Heading: { type: String, default: "Air (Atmosphere)" },
    topic3Text:    { type: String, default: "Sustainability targets focus on reducing air pollution and greenhouse gas emissions." },
    whyHeading:    { type: String, default: "Why choose us?" },
    whyText:       { type: String, default: "Sustainable Business Union is a collaborative platform helping businesses adopt future-ready, environmentally responsible, and profitable sustainability solutions." },
    whyButton:     { type: String, default: "See all topics" },
  },

  // ── Newsletter ────────────────────────────────────────────────────────────
  newsletter: {
    heading:       { type: String, default: "Love green economy? Sign up for our newsletter" },
    description:   { type: String, default: "…and even if you don't understand it yet, sign up anyway – it's free to upgrade." },
    checkboxLabel: { type: String, default: "Yes, subscribe me to your newsletter." },
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  contact: {
    email:   { type: String, default: "info@sustainablebusinessunion.com" },
    address: { type: String, default: "Canary Wharf, London" },
    phone:   { type: String, default: "+44 7770 264192" },
  },

}, { timestamps: true });

module.exports = mongoose.model("SiteContent", siteContentSchema);
