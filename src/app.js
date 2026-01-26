const express = require("express");
const phonesRoutes = require("./routes/phones.routes");

const app = express();

app.use(express.json());

// test route (health check)
app.get("/health", (req, res) => {
  res.json({ ok: true, message: "Inventory API is running" });
});

//Mount Routes 
app.use("/phones", phonesRoutes);

// error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});