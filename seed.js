
// require("dotenv").config();
// const mongoose = require("mongoose");

// const Tenant = require("./models/Tenant");
// const Color = require("./models/color");
// const Title = require("./models/title");

// mongoose.connect(process.env.MONGO_URI).then(async () => {

//   const tenant = await Tenant.create({
//     name: "Main Website",
//     domain: "localhost",
//     email: "admin@mail.com",
//     password: "1234"
//   });

//   await Color.create({
//     tenantId: tenant._id,
//     primary: "#009344",
//     secondary: "#006635",
//     other: "#f6a623"
//   });

//   await Title.create({
//     tenantId: tenant._id,
//     title: "Green Tech",
//     subTitle: "Welcome to our website"
//   });

//   console.log("Seed completed");
//   process.exit();
// });


// require("dotenv").config();
// const mongoose = require("mongoose");

// const Tenant = require("./models/Tenant");
// const Color = require("./models/color");
// const Title = require("./models/title");

// mongoose.connect(process.env.MONGO_URI).then(async () => {

//   // Tenant 1
//   const tenant1 = await Tenant.create({
//     name: "Tenant One",
//     domain: "tenant1.local",
//     email: "tenant1@mail.com",
//     password: "1234"
//   });

//   await Color.create({
//     tenantId: tenant1._id,
//     primary: "#ff0000",
//     secondary: "#cc0000",
//     other: "#ffaa00"
//   });

//   await Title.create({
//     tenantId: tenant1._id,
//     title: "Tenant One Website",
//     subTitle: "Welcome Tenant One"
//   });



//   // Tenant 2
//   const tenant2 = await Tenant.create({
//     name: "Tenant Two",
//     domain: "tenant2.local",
//     email: "tenant2@mail.com",
//     password: "1234"
//   });

//   await Color.create({
//     tenantId: tenant2._id,
//     primary: "#0000ff",
//     secondary: "#0033cc",
//     other: "#00ffff"
//   });

//   await Title.create({
//     tenantId: tenant2._id,
//     title: "Tenant Two Website",
//     subTitle: "Welcome Tenant Two"
//   });



//   console.log("All tenants seeded");
//   process.exit();
// });




require("dotenv").config();
const mongoose = require("mongoose");

const Tenant = require("./models/Tenant");
const Color = require("./models/color");
const Title = require("./models/title");




console.log("Tenant:", Tenant);
console.log("typeof:", typeof Tenant);
console.log("create:", Tenant.create);


mongoose.connect("mongodb+srv://eLibrarySystem:eLibrarySystem@cluster0.9mxtrby.mongodb.net/journaldb?retryWrites=true&w=majority&appName=Cluster0").then(async () => {

  // 1. Green Technology (Main Landing Page)
  const green = await Tenant.create({
    name: "Green Technology",
    domain: "greentechnology.site",
    email: "admin@greentechnology.site",
    password: "1234"
  });

  await Color.create({
    tenantId: green._id,
    primary: "#009344",
    secondary: "#006635",
    other: "#f6a623"
  });

  await Title.create({
    tenantId: green._id,
    title: "Green Technology",
    subTitle: "Welcome to Green Technology"
  });



  // 2. Fashion Technology
  const fashion = await Tenant.create({
    name: "Fashion Technology",
    domain: "fashiontechnology.site",
    email: "admin@fashiontechnology.site",
    password: "1234"
  });

  await Color.create({
    tenantId: fashion._id,
    primary: "#ff1493",
    secondary: "#c71585",
    other: "#ffd700"
  });

  await Title.create({
    tenantId: fashion._id,
    title: "Fashion Technology",
    subTitle: "Style Meets Innovation"
  });



  // 3. Art Technology
  const art = await Tenant.create({
    name: "Art Technology",
    domain: "arttechnology.site",
    email: "admin@arttechnology.site",
    password: "1234"
  });

  await Color.create({
    tenantId: art._id,
    primary: "#8a2be2",
    secondary: "#2b123d",
    other: "#ff69b4"
  });

  await Title.create({
    tenantId: art._id,
    title: "Art Technology",
    subTitle: "Creativity Powered by Tech"
  });



  // 4. Finance Technology
  const finance = await Tenant.create({
    name: "Finance Technology",
    domain: "financetechnology.site",
    email: "admin@financetechnology.site",
    password: "1234"
  });

  await Color.create({
    tenantId: finance._id,
    primary: "#1e90ff",
    secondary: "#0047ab",
    other: "#00c8ff"
  });

  await Title.create({
    tenantId: finance._id,
    title: "Finance Technology",
    subTitle: "Smart Finance Solutions"
  });



  // 5. Agri Technology
  const agri = await Tenant.create({
    name: "Agri Technology",
    domain: "agritechnology.site",
    email: "admin@agritechnology.site",
    password: "1234"
  });

  await Color.create({
    tenantId: agri._id,
    primary: "#228b22",
    secondary: "#006400",
    other: "#adff2f"
  });

  await Title.create({
    tenantId: agri._id,
    title: "Agri Technology",
    subTitle: "Future of Smart Farming"
  });


  //localhost
  
  const tenant = await Tenant.create({
    name: "Main Website",
    domain: "localhost",
    email: "admin@mail.com",
    password: "1234"
  });

  await Color.create({
    tenantId: tenant._id,
    primary: "#009344",
    secondary: "#006635",
    other: "#f6a623"
  });

  await Title.create({
    tenantId: tenant._id,
    title: "Green Tech",
    subTitle: "Welcome to our website"
  });


  // Tenant 2
  const tenant2 = await Tenant.create({
    name: "Tenant Two",
    domain: "tenant2.local",
    email: "tenant2@mail.com",
    password: "1234"
  });

  await Color.create({
    tenantId: tenant2._id,
    primary: "#0000ff",
    secondary: "#0033cc",
    other: "#00ffff"
  });

  await Title.create({
    tenantId: tenant2._id,
    title: "Tenant Two Website",
    subTitle: "Welcome Tenant Two"
  });


  console.log("All domains seeded successfully");
  process.exit();

}).catch((err) => {
  console.error(err);
  process.exit();
});