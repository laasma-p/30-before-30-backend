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

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};

app.post("/complete-item", verifyToken, async (req, res) => {
  const { itemId } = req.body;

  try {
    const item = await Item.findByPk(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found " });
    }

    if (item.userId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    item.completed = true;
    await item.save();
    res.json({ message: "Item marked as complete" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/user-items-list", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userListData = await Item.findAll({ where: { userId } });
    res.json(userListData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/add-item", verifyToken, async (req, res) => {
  const { item } = req.body;
  const userId = req.user.userId;

  if (!item) {
    return res.status(400).json({ message: "Item name is required" });
  }

  try {
    const newItem = await Item.create({ item, userId });

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/remove-item/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.destroy();
    res.status(200).json({ message: "Item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/clear-list", verifyToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await Item.destroy({ where: { userId } });
    res.status(200).json({ message: "All items removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/edit-item/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { item } = req.body;
  const userId = req.user.userId;

  if (!item) {
    return res.status(400).json({ message: "Item is required" });
  }

  try {
    const existingItem = await Item.findByPk(id);

    if (!existingItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    existingItem.item = item;
    await existingItem.save();
    res.json(existingItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

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

app.post("/register", async (req, res) => {
  const { enteredName, enteredEmail, enteredPassword } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email: enteredEmail } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(enteredPassword, 10);

    await User.create({
      name: enteredName,
      email: enteredEmail,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
