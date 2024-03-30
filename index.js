const express = require("express");
require("dotenv").config();
const cors = require("cors");
const Item = require("./item");

const app = express();

const PORT = process.env.PORT;
app.use(cors());
app.use(express.json());

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
