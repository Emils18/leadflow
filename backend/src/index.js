import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import importRoutes from './routes/importRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import leadDetailsRoutes from './routes/leadDetailsRoutes.js';

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Expose API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lead-details', leadDetailsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ error: 'Internal system server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`LeadFlow Secure Engine running on port ${PORT}`);
});