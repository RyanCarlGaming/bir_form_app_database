import express from 'express';
import cors from 'cors';
import {
  closeDatabase,
  createApplication,
  createEmployer,
  createForm,
  createSpouse,
  createTaxpayer,
  deleteForm,
  getFormById,
  getProfile,
  getStatsSummary,
  getTaxpayerById,
  initializeDatabase,
  listForms,
  listTaxpayers,
  updateForm,
  updateProfile,
  updateTaxpayer,
} from './db.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function notFound(res, message) {
  return res.status(404).json({ error: message });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/taxpayers', asyncRoute(async (req, res) => {
  const taxpayers = await listTaxpayers();
  res.json(taxpayers);
}));

app.post('/api/taxpayers', asyncRoute(async (req, res) => {
  const taxpayer = await createTaxpayer(req.body);
  res.status(201).json(taxpayer);
}));

app.get('/api/taxpayers/:id', asyncRoute(async (req, res) => {
  const taxpayer = await getTaxpayerById(req.params.id);
  if (!taxpayer) return notFound(res, 'Taxpayer not found');
  return res.json(taxpayer);
}));

app.put('/api/taxpayers/:id', asyncRoute(async (req, res) => {
  const taxpayer = await updateTaxpayer(req.params.id, req.body);
  if (!taxpayer) return notFound(res, 'Taxpayer not found');
  return res.json(taxpayer);
}));

app.post('/api/taxpayers/:id/spouse', asyncRoute(async (req, res) => {
  const spouse = await createSpouse(req.params.id, req.body);
  res.status(201).json(spouse);
}));

app.post('/api/taxpayers/:id/employers', asyncRoute(async (req, res) => {
  const employer = await createEmployer(req.params.id, req.body);
  res.status(201).json(employer);
}));

app.get('/api/forms/stats/summary', asyncRoute(async (req, res) => {
  const summary = await getStatsSummary();
  res.json(summary);
}));

app.get('/api/forms', asyncRoute(async (req, res) => {
  const forms = await listForms({
    taxpayerId: req.query.taxpayerId,
    formType: req.query.formType,
    status: req.query.status,
  });
  res.json(forms);
}));

app.post('/api/forms', asyncRoute(async (req, res) => {
  const form = await createForm(req.body);
  res.status(201).json(form);
}));

app.get('/api/forms/:id', asyncRoute(async (req, res) => {
  const form = await getFormById(req.params.id);
  if (!form) return notFound(res, 'Form not found');
  return res.json(form);
}));

app.put('/api/forms/:id', asyncRoute(async (req, res) => {
  const form = await updateForm(req.params.id, req.body);
  if (!form) return notFound(res, 'Form not found');
  return res.json(form);
}));

app.delete('/api/forms/:id', asyncRoute(async (req, res) => {
  const deleted = await deleteForm(req.params.id);
  if (!deleted) return notFound(res, 'Form not found');
  return res.json({ message: 'Form deleted successfully' });
}));

app.get('/api/profile', asyncRoute(async (req, res) => {
  const profile = await getProfile();
  res.json(profile);
}));

app.put('/api/profile', asyncRoute(async (req, res) => {
  const profile = await updateProfile(req.body);
  res.json(profile);
}));

app.post('/api/applications', asyncRoute(async (req, res) => {
  const result = await createApplication(req.body);
  res.status(201).json(result);
}));

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err, req, res, next) => {
  void req;
  void next;
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function start() {
  const dbPath = await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`BIR Form API Server running on http://localhost:${PORT}`);
    console.log(`Database: ${dbPath}`);
  });
}

process.on('SIGINT', async () => {
  await closeDatabase().catch((err) => console.error('Error closing database:', err));
  process.exit(0);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
