//routes/invoice.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const InvoiceController = require('../controllers/invoice.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const invoiceController = new InvoiceController();

router.post('/', authenticate, AsyncWrapper(invoiceController.postInvoice));

router.put('/', authenticate, AsyncWrapper(invoiceController.putInvoiceById));

router.get('/', authenticate, AsyncWrapper(invoiceController.getInvoiceById));

router.get(
  '/multi',
  authenticate,
  AsyncWrapper(invoiceController.getInvoiceByMulti),
);

export const invoiceRouter = { baseUrl: '/api/invoice', router };
