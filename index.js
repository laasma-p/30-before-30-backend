const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");
const Item = require("./item");
const User = require("./user");

const app = express();

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

app.post("/login", async (req, res) => {
  const { enteredEmail, enteredPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email: enteredEmail } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      enteredPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/items", async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
