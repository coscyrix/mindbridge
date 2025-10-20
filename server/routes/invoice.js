//routes/invoice.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import InvoiceController from '../controllers/invoice.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

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
