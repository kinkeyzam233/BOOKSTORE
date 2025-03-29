const bcrypt = require("bcryptjs");
const db = require("../config/db");

// Signup
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    await db.none(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).json({ error: "Error registering user" });
  }
};

// Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Store user session
    req.session.user = { id: user.id, name: user.name, email: user.email };

    // Send success response with user data
    res
      .status(200)
      .json({ message: "Login successful", user: req.session.user });

    // Optional: Redirect for non-API based requests
    // res.redirect('/home'); // You can use this if your app is using server-side rendering.
  } catch (err) {
    console.error("Error logging in:", err.message);
    res.status(500).json({ error: "Error logging in" });
  }
};

// Logout
exports.logoutUser = (req, res) => {
  if (!req.session) {
    return res.status(400).json({ error: "No active session" });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.status(500).json({ error: "Error logging out" });
    }

    res.json({ message: "Logged out successfully" });
  });
};
