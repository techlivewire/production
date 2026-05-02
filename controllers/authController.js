const User = require("../models/User");

// ── Signup ────────────────────────────────────────────────────────────────────

exports.signupForm = (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/signup", { error: null, values: {} });
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, organization } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.render("auth/signup", {
        error: "Name, email and password are required.",
        values: req.body,
      });
    }
    if (password.length < 6) {
      return res.render("auth/signup", {
        error: "Password must be at least 6 characters.",
        values: req.body,
      });
    }
    if (password !== confirmPassword) {
      return res.render("auth/signup", {
        error: "Passwords do not match.",
        values: req.body,
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.render("auth/signup", {
        error: "An account with this email already exists.",
        values: req.body,
      });
    }

    // Create user
    const user = await User.create({
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      password,
      phone:        phone?.trim() || "",
      organization: organization?.trim() || "",
    });

    // Auto login after signup
    req.session.userId   = user._id;
    req.session.userName = user.name;

    res.redirect("/");
} catch (err) {
    console.error("Signup error:", err);
    res.render("auth/signup", {
      error: "Something went wrong. Please try again.",
      values: req.body || {},
    });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

exports.loginForm = (req, res) => {
  if (req.session.userId) return res.redirect("/");
  res.render("auth/login", { error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("auth/login", { error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render("auth/login", { error: "Invalid email or password." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.render("auth/login", { error: "Invalid email or password." });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    req.session.userId   = user._id;
    req.session.userName = user.name;

    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.render("auth/login", { error: "Something went wrong. Please try again." });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

// ── Admin: user list ──────────────────────────────────────────────────────────

exports.adminUsers = async (req, res) => {
  try {
    const page        = Math.max(1, parseInt(req.query.page) || 1);
    const PER_PAGE    = 20;
    const search      = req.query.search || "";
    const filter      = search
      ? { $or: [
          { name:  { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { organization: { $regex: search, $options: "i" } },
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip((page - 1) * PER_PAGE)
        .limit(PER_PAGE)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.render("admin/users", {
      users,
      total,
      page,
      totalPages: Math.ceil(total / PER_PAGE),
      search,
    });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).send("Failed to load users");
  }
};
