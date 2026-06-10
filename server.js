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

// ── Middleware (ORDER MATTERS) ────────────────────────────────────────────────
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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



// auth the admin
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.userRole !== "admin") {
    return res.status(403).render("errors/403");
  }
  next();
}

// ── Global locals ─────────────────────────────────────────────────────────────

app.use((req, res, next) => {
  res.locals.currentUser     = req.session.userId || null;
  res.locals.currentUserName = req.session.userName || null;
  res.locals.userRole        = req.session.userRole || null;
  next();
});
// ── Tenant ────────────────────────────────────────────────────────────────────
// app.use(async (req, res, next) => {
//   try {
//     let host = req.hostname.toLowerCase();
//     if (host.startsWith("www.")) host = host.replace("www.", "");
//     req.tenant = await Tenant.findOne({ domain: host });
//     next();
//   } catch (err) {
//     next(err);
//   }
// });


// middleware for tenant resolution
app.use(async (req, res, next) => {
  try {
    let host = req.hostname.toLowerCase();

    if (host.startsWith("www.")) {
      host = host.replace("www.", "");
    }

    // normalize (defensive coding)
    host = host.replace(/\/$/, "");

    console.log("HOST:", host);

    req.tenant = await Tenant.findOne({
      domain: host
    });

    next();
  } catch (err) {
    next(err);
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).send('OK'));

// ── Mount routes ──────────────────────────────────────────────────────────────
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




// app.get("/", async (req, res) => {

//     // res.send("Server is working");


//   try {
//    const colors = await colorRepo.findOne() || {
//       primary:   "#009344",
//       secondary: "#006635",
//       other:     "#f6a623"
//     };
//     const titles = await titleRepo.findOne();

//     const events = await Event.find();
//     const logo = await logoRepo.findOne();
//     const colCard = await colCardRepo.findOne();
//     const video = await videoRepo.findOne();
//     const about = await aboutRepo.findOne();





// res.render("index", {
//   colors,
//   titles,
//   events,
//   logo,
//   colCard: colCard || {
//     label: "ANNOUNCEMENT",
//     heading: "Upcoming Events",
//     description: "Stay updated with our latest events"
//   },
//   video: video || {
//   videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
// },
// about: about || {
//   title: "ABOUT US",
//   description: "We are committed to sustainable development and innovation.",
//   image: "/images/default-about.jpg"
// }

// });
//   } catch (err) {
//   console.error(err);
//   res.status(500).send("Failed to load page");
// }
// });

// app.get("/", async (req, res) => {
//   try {
//     if (!req.tenant) return res.status(404).render("tenant-not-found")

//     const tenantId = req.tenant._id;
  
//     const colors = await colorRepo.findOne({ tenantId }) || {
//       primary:"#009344",
//       secondary:"#006635",
//       other:"#f6a623"
//     };
//       console.log(colors)

//     const titles = await titleRepo.findOne({ tenantId });
//     const events = await Event.find({ tenantId });
//     const logo = await logoRepo.findOne({ tenantId });
//     const colCard = await colCardRepo.findOne({ tenantId });
//     const video = await videoRepo.findOne({ tenantId });
//     const about = await aboutRepo.findOne({ tenantId });

//     res.render("index", {
//       colors,
//       titles,
//       events,
//       logo,
//       colCard,
//       video,
//       about
//     });

//   } catch (err) {
//     res.status(500).send("Failed");
//   }
// });
// SENDING ALL THE DATA TO FILL THE PAGE
app.get("/", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found");
    const tenantId = req.tenant._id;

    const [colors, titles, events, logo, colCard, video, about, siteContent] = await Promise.all([
      colorRepo.findOne({ tenantId }),
      titleRepo.findOne({ tenantId }),
      Event.find({ tenantId }),
      logoRepo.findOne({ tenantId }),
      colCardRepo.findOne({ tenantId }),
      videoRepo.findOne({ tenantId }),
      aboutRepo.findOne({ tenantId }),
      SiteContent.findOne({ tenantId }),
    ]);

    res.render("index", {
      colors:  colors  || { primary: "#009344", secondary: "#006635", other: "#f6a623" },
      titles:  titles  || { title: "Green Technology", subTitle: "", heroEyebrow: "INNOVATION", heroUrl: "#" },
      events:  events  || [],
      logo:    logo    || { logoMark: "GT", logoTextTop: "Green", logoTextBottom: "Technology" },
      colCard: colCard || { label: "ANNOUNCEMENT", heading: "Upcoming Events", description: "Stay updated", images: [] },
      video:   video   || { videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      about:   about   || { title: "ABOUT US", description: "We are committed to innovation.", images: [] },
      siteContent: siteContent || {},
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load page");
  }
});

// app.get("/admin", async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: 1 });
//     res.render("admin", { events });
//   } catch (err) {
//     res.status(500).send("Failed to load admin panel");
//   }
// });

// app.get("/admin", async (req, res) => {
//   try {
//     if (!req.tenant) return res.status(404).render("tenant-not-found")

//     const tenantId = req.tenant._id;

//     const events = await Event.find({ tenantId }).sort({ date: 1 }); 

//     res.render("admin", { events });

//   } catch (err) {
//     res.status(500).send("Failed");
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


// app.get("/editEvent/:id", async (req, res) => {
//   try {
//     const tenantID=req.tenant._id;
//     // const event = await Event.findById(req.params.id);
//     const event = await Event.findOne({
//   _id: req.params.id,
//   tenantId
// });
//     res.render("edit", { event });
//   } catch (err) {
//     res.status(500).send("Failed to load edit page");
//   }
// });
app.get("/editEvent/:id", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;

    const event = await Event.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!event) return res.send("Event not found");

    res.render("edit", { event });

  } catch (err) {
    res.status(500).send("Failed to load edit page");
  }
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
// app.post("/updateEvent/:id", async (req, res) => {
//   try {
    
//     const { title, artists, date, time, location } = req.body;

//     await Event.findByIdAndUpdate(req.params.id, {
//       title,
//       artists,
//       date,
//       time,
//       location
//     });

//     res.redirect("/admin");

//   } catch (err) {
//     res.status(500).send("Failed to update event");
//   }
// });


app.post("/updateEvent/:id", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { title, artists, date, time, location } = req.body;

    await Event.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId
      },
      {
        title,
        artists,
        date,
        time,
        location
      }
    );

    res.redirect("/admin");

  } catch (err) {
    res.status(500).send("Failed to update event");
  }
});


// app.post("/updateLogo",  upload.single("image"), async (req, res) => {
//   try {
//     if (!req.tenant) return res.status(404).render("tenant-not-found")

//     const tenantId = req.tenant._id;
//     const { image, logoTextTop, logoTextBottom } = req.body;
    
//         if (image && image.length > 0) {
//       updateData.images = req.files.map(file => "/uploads/" + file.filename);
//     }

//     await logoRepo.findOneAndUpdate(
//       { tenantId },
//       {
//         tenantId,
//         image,
//         logoTextTop,
//         logoTextBottom
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );

//     res.redirect("/");

//   } catch (err) {
//     res.status(500).send("Failed to update logo");
//   }
// });



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





// app.post("/addEvent", async (req, res) => {
//   try {
//     const tenantID=req.tenant._id;
//     const { title, artists, date, time, location } = req.body;

//     if (!title || !artists || !date || !time || !location) {
//       return res.status(400).send("All fields required");
//     }

//     await Event.create({
//       tenantID,
//       title,
//       artists,
//       date,
//       time,
//       location
//     });

//     res.redirect("/admin");

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to add event");
//   }
// });

app.post("/addEvent", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;
    const { title, artists, date, time, location } = req.body;

    if (!title || !artists || !date || !time || !location) {
      return res.status(400).send("All fields required");
    }

    await Event.create({
      tenantId,
      title,
      artists,
      date,
      time,
      location
    });

    res.redirect("/admin");

  } catch (err) {
    res.status(500).send("Failed to add event");
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



// app.get("/deleteEvent/:id", async (req, res) => {
//   try {
//     await Event.findByIdAndDelete(req.params.id);
//     res.redirect("/");
//   } catch (err) {
//     res.status(500).send("Failed to delete event");
//   }
// });


app.get("/deleteEvent/:id", async (req, res) => {
  try {
    if (!req.tenant) return res.status(404).render("tenant-not-found")

    const tenantId = req.tenant._id;

    await Event.findOneAndDelete({
      _id: req.params.id,
      tenantId
    });

    res.redirect("/");

  } catch (err) {
    res.status(500).send("Failed to delete event");
  }
});





// app.post("/updateColor", async (req, res) => {
//   try {
//     const { primary, secondary, other } = req.body;
//     console.log( primary, secondary, other);

//     await colorRepo.findOneAndUpdate(
//       {},
//       { primary, secondary, other },
//       { upsert: true, new: true }
//     );

//     res.redirect("/");
//   } catch (err) {
//     console.error("Failed to update color:", err);
//     res.status(500).send("Failed to update color");
//   }
// });

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


// app.post("/updateTitle", async (req, res) => {
//   try {

//     const { title, subTitle, heroEyebrow, heroUrl } = req.body;

//     await titleRepo.findOneAndUpdate(
//       {},
//       { title, subTitle, heroEyebrow, heroUrl },
//       { upsert: true }
//     );

//     res.redirect("/");

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to update title");
//   }
// });

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

// app.post("/updateVideo", async (req, res) => {
//   try {
//     const { videoUrl } = req.body;

//     await videoRepo.findOneAndUpdate(
//       {},
//       { videoUrl },
//       { upsert: true }
//     );

//     res.redirect("/");

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to update video");
//   }
// });

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



// app.post("/updateAbout", upload.array("images", 10), async (req, res) => {
//   try {
//     const { title, description } = req.body;

//     const updateData = {
//       title,
//       description
//     };

//     // only update images if files uploaded
//     if (req.files && req.files.length > 0) {
//       updateData.images = req.files.map(file => "/uploads/" + file.filename);
//     }

//     await aboutRepo.findOneAndUpdate(
//       {},
//       updateData,
//       {
//         upsert: true,
//         new: true
//       }
//     );

//     res.redirect("/");
//   } catch (err) {
//     console.error("Update About Error:", err);
//     res.status(500).send("Failed to update About section");
//   }
// });

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
// app.post("/updatePage", async (req, res) => {
//   try {
//     const { name, content } = req.body;

//     await Page.findOneAndUpdate(
//       { name },
//       { content },
//       { upsert: true }
//     );

//     res.redirect("/admin");

//   } catch (err) {
//     res.status(500).send("Failed to update page");
//   }
// });


// app.post("/updatePage", async (req, res) => {
//   try {
//     if (!req.tenant) return res.status(404).render("tenant-not-found")

//     const tenantId = req.tenant._id;
//     const { name, content } = req.body;

//     await Page.findOneAndUpdate(
//       { name, tenantId },
//       {
//         name,
//         content,
//         tenantId
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );

//     res.redirect("/admin");

//   } catch (err) {
//     res.status(500).send("Failed to update page");
//   }
// });

// router.post("/admin/elibrary/import",
//   importUpload.fields([
//     { name: "excel", maxCount: 1 },
//     { name: "zip",   maxCount: 1 }
//   ]),
//   ctrl.adminImport
// );


//  FOR TEMPLATE DOWNLOAD

// app.get('/elibrary-template.xlsx', (req, res) => {
//     // __dirname is the folder where your server script lives
//     const filePath = path.join(__dirname, 'files', 'elibrary-template.xlsx');
    
//     res.download(filePath, 'elibrary-template.xlsx', (err) => {
//         if (err) {
//             console.error("File failed to send:", err);
//             res.status(404).send("File not found");
//         }
//     });
// });



