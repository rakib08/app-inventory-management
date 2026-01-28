const express = require('express');
const phonesRoutes = require('./routes/phones.routes');

const app = express();

app.use(express.json());

app.use(express.static('public'));

// test route (health check)

app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Inventory API is running' });
});

// Mount Routes
app.use('/phones', phonesRoutes);

// error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
