process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION:', err);
});

console.log("SERVER FILE LOADED");
require("dotenv").config();

const express      = require("express");
const path         = require("path");
const session      = require("express-session");
const MongoStore   = require("connect-mongo").default;
const tenantResolver = require("./middleware/tenantResolver");
const requireTenant = require("./middleware/requireTenant");
const siteController = require("./controllers/siteController");

const app = express();

// ── Models ────────────────────────────────────────────────────────────────────
const Event       = require("./models/Event");
const colorRepo   = require("./models/color");
const titleRepo   = require("./models/title");
const logoRepo    = require("./models/logo");
const colCardRepo = require("./models/colCard");
const videoRepo   = require("./models/video");
const aboutRepo   = require("./models/about");
const Page        = require("./models/Page");
const Tenant      = require("./models/Tenant");
const SiteContent = require("./models/SiteContent");

// ── Config ────────────────────────────────────────────────────────────────────
const upload         = require("./config/multer");
const connectDb      = require("./DB/DbConnect");
const MONGO_URI      = process.env.MONGO_URI || process.env.MONGODB_URI;

// ── Routes ────────────────────────────────────────────────────────────────────
const eLibraryRoutes = require("./routes/eLibraryRoutes");
const authRoutes     = require("./routes/authRoutes");

// ── App settings ──────────────────────────────────────────────────────────────
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Body parsing & static ────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("admin"));
app.use("/uploads", express.static("uploads"));

// ── Sessions ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || "sbu-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: "sessions",
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true }
}));

// ── Global locals (must run before any view-rendering routes) ──────────────────
app.use((req, res, next) => {
  res.locals.currentUser     = req.session.userId || null;
  res.locals.currentUserName = req.session.userName || null;
  res.locals.userRole        = req.session.userRole || null;
  next();
});

// ── Tenant resolution (must run before any tenant-aware routes) ────────────────
app.use(tenantResolver);

// auth the admin
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).render("errors/403");
  }
  next();
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).send('OK'));

// ── Mount routes ──────────────────────────────────────────────────────────────
app.use("/", require("./routes/siteRoutes"));
app.use(require("./routes/eventRoutes"));
app.use(eLibraryRoutes);
app.use(authRoutes);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDb()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection failed:", err));





// SENDING ALL THE DATA TO FILL THE PAGE
// app.get("/", requireTenant , siteController.getHome,  async (req, res) => {
//   try {
//     if (!req.tenant) return res.status(404).render("tenant-not-found");
//     const tenantId = req.tenant._id;

//     const [colors, titles, events, logo, colCard, video, about, siteContent] = await Promise.all([
//       colorRepo.findOne({ tenantId }),
//       titleRepo.findOne({ tenantId }),
//       Event.find({ tenantId }),
//       logoRepo.findOne({ tenantId }),
//       colCardRepo.findOne({ tenantId }),
//       videoRepo.findOne({ tenantId }),
//       aboutRepo.findOne({ tenantId }),
//       SiteContent.findOne({ tenantId }),
//     ]);

//     res.render("index", {
//       colors:  colors  || { primary: "#009344", secondary: "#006635", other: "#f6a623" },
//       titles:  titles  || { title: "Green Technology", subTitle: "", heroEyebrow: "INNOVATION", heroUrl: "#" },
//       events:  events  || [],
//       logo:    logo    || { logoMark: "GT", logoTextTop: "Green", logoTextBottom: "Technology" },
//       colCard: colCard || { label: "ANNOUNCEMENT", heading: "Upcoming Events", description: "Stay updated", images: [] },
//       video:   video   || { videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
//       about:   about   || { title: "ABOUT US", description: "We are committed to innovation.", images: [] },
//       siteContent: siteContent || {},
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to load page");
//   }
// });



// for form pre fill  

app.get("/admin", requireAdmin , async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;

    const [events, colors, titles, logo, colCard, video, about, siteContent] = await Promise.all([
      Event.find({ tenantId }).sort({ date: 1 }),
      colorRepo.findOne({ tenantId }),
      titleRepo.findOne({ tenantId }),
      logoRepo.findOne({ tenantId }),
      colCardRepo.findOne({ tenantId }),
      videoRepo.findOne({ tenantId }),
      aboutRepo.findOne({ tenantId }),
      SiteContent.findOne({ tenantId }),
    ]);

    res.render("admin", { events, colors, titles, logo, colCard, video, about, siteContent });
  } catch (err) {
    res.status(500).send("Failed");
  }
});


// GET /admin/pages  — page editor
app.get("/admin/pages", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
 
    const [privacy, terms] = await Promise.all([
      Page.findOne({ name: "privacy", tenantId }),
      Page.findOne({ name: "terms",   tenantId }),
    ]);
 
    const pagesData = {
      privacy: privacy?.structuredContent || {},
      terms:   terms?.structuredContent   || {},
    };
 
    res.render("admin/page-editor", { pagesData });
  } catch (err) {
    res.status(500).send("Failed to load page editor");
  }
});




app.get("/elibrary", (req, res) => {
  res.render("/elibrary/admin/index");
});





app.get("/privacy", async (req, res) => {
  try {
    const tenantId = req.tenant?._id;
    const page = await Page.findOne({ name: "privacy", tenantId });
    res.render("privacy", { pageData: page?.structuredContent || null });
  } catch (err) {
    res.status(500).send("Failed");
  }
});
 
// GET /terms
app.get("/terms", async (req, res) => {
  try {
    const tenantId = req.tenant?._id;
    const page = await Page.findOne({ name: "terms", tenantId });
    res.render("terms", { pageData: page?.structuredContent || null });
  } catch (err) {
    res.status(500).send("Failed");
  }
});


app.post("/updatePage", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
    const { name, content } = req.body;
    await Page.findOneAndUpdate({ name, tenantId }, { name, content, tenantId }, { upsert: true });
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Failed to update page");
  }
});

// POST /updatePageStructured
app.post("/updatePageStructured", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId  = req.tenant._id;
    const { name, pageTitle, lastUpdated, sections } = req.body;
 
    // Parse sections from form — sections is an object keyed by index
    const parsedSections = [];
    if (sections) {
      Object.values(sections).forEach(sec => {
        if (!sec.heading) return;
        parsedSections.push({
          heading: sec.heading,
          points:  Array.isArray(sec.points) ? sec.points.filter(Boolean) : [sec.points].filter(Boolean),
        });
      });
    }
 
    const structuredContent = { pageTitle, lastUpdated, sections: parsedSections };
 
    await Page.findOneAndUpdate(
      { name, tenantId },
      { name, tenantId, structuredContent },
      { upsert: true, new: true }
    );
 
    res.redirect("/admin/pages");
  } catch (err) {
    console.error("updatePageStructured error:", err);
    res.status(500).send("Failed to save page");
  }
});





app.get("/contact", (req, res) => {
  res.render("contact");
});



app.post("/updateLogo", upload.single("image"), async (req, res) => {
  try {
    if (!req.tenant) {
      return res.status(404).render("tenant-not-found");
    }

    const tenantId = req.tenant._id;
    const { logoTextTop, logoTextBottom } = req.body;

    let updateData = {
      tenantId,
      logoTextTop,
      logoTextBottom
    };

    // Only update image if a new file is uploaded
    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    await logoRepo.findOneAndUpdate(
      { tenantId },
      updateData,
      { upsert: true, new: true }
    );

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update logo");
  }
});








app.post("/updateColCard", upload.array("images", 5), async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { label, heading, description } = req.body;

    const updateData = {
      tenantId,
      label,
      heading,
      description
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => "/uploads/" + file.filename);
    }

    await colCardRepo.findOneAndUpdate(
      { tenantId },
      updateData,
      {
        upsert: true,
        new: true
      }
    );

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to update ColCard");
  }
});




app.post("/updateColor", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { primary, secondary, other } = req.body;

    await colorRepo.findOneAndUpdate(
      { tenantId },
      {
        tenantId,
        primary,
        secondary,
        other
      },
      {
        upsert: true,
        new: true
      }
    );

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to update color");
  }
});




app.post("/updateTitle",  upload.single("image") , async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { title, subTitle, heroEyebrow, heroUrl, heroUrlText } = req.body;


    let updateData = {
      title,
      subTitle,
      heroEyebrow,
       heroUrl,
        heroUrlText


    }


    // Only update image if a new file is uploaded
      if (req.file) {
      updateData.heroImage = "/uploads/" + req.file.filename;

    }


    await titleRepo.findOneAndUpdate(
      { tenantId },
      updateData,
      {
        upsert: true,
        new: true
      }
    );

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to update title");
  }
});



app.post("/updateVideo", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { videoUrl } = req.body;

    await videoRepo.findOneAndUpdate(
      { tenantId },
      {
        tenantId,
        videoUrl
      },
      {
        upsert: true,
        new: true
      }
    );

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to update video");
  }
});





app.post("/updateAbout", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { title, description } = req.body;

    const updateData = {
      tenantId,
      title,
      description
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => "/uploads/" + file.filename);
    }

    await aboutRepo.findOneAndUpdate(
      { tenantId },
      updateData,
      {
        upsert: true,
        new: true
      }
    );

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to update About section");
  }
});




app.post("/updateDeal", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
    const { label, pill1, pill2, title, buttonText, card1Heading, card1Text, card2Heading, card2Text, card3Heading, card3Text, card4Heading, card4Text } = req.body;

    await SiteContent.findOneAndUpdate(
      { tenantId },
      { $set: {
        tenantId,
        "deal.label": label, "deal.pill1": pill1, "deal.pill2": pill2,
        "deal.title": title, "deal.buttonText": buttonText,
        "deal.card1Heading": card1Heading, "deal.card1Text": card1Text,
        "deal.card2Heading": card2Heading, "deal.card2Text": card2Text,
        "deal.card3Heading": card3Heading, "deal.card3Text": card3Text,
        "deal.card4Heading": card4Heading, "deal.card4Text": card4Text,
      }},
      { upsert: true, new: true }
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Failed to update Deal section");
  }
});

app.post("/updateTopics", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
    const { label, heading, topic1Heading, topic1Text, topic2Heading, topic2Text, topic3Heading, topic3Text, whyHeading, whyText, whyButton } = req.body;

    await SiteContent.findOneAndUpdate(
      { tenantId },
      { $set: {
        tenantId,
        "topics.label": label, "topics.heading": heading,
        "topics.topic1Heading": topic1Heading, "topics.topic1Text": topic1Text,
        "topics.topic2Heading": topic2Heading, "topics.topic2Text": topic2Text,
        "topics.topic3Heading": topic3Heading, "topics.topic3Text": topic3Text,
        "topics.whyHeading": whyHeading, "topics.whyText": whyText,
        "topics.whyButton": whyButton,
      }},
      { upsert: true, new: true }
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Failed to update Topics section");
  }
});

app.post("/updateNewsletter", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
    const { heading, description, checkboxLabel } = req.body;

    await SiteContent.findOneAndUpdate(
      { tenantId },
      { $set: {
        tenantId,
        "newsletter.heading": heading,
        "newsletter.description": description,
        "newsletter.checkboxLabel": checkboxLabel,
      }},
      { upsert: true, new: true }
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Failed to update Newsletter");
  }
});

app.post("/updateContact", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;
    const { email, address, phone } = req.body;

    await SiteContent.findOneAndUpdate(
      { tenantId },
      { $set: {
        tenantId,
        "contact.email": email,
        "contact.address": address,
        "contact.phone": phone,
      }},
      { upsert: true, new: true }
    );
    res.redirect("/admin");
  } catch (err) {
    res.status(500).send("Failed to update Contact");
  }
});


