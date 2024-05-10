const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const userListData = await Item.findAll({ where: { userId: user.id } });

    res.json({ token, listData: userListData });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
