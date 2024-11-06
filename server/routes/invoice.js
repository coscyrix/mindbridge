//routes/invoice.js

import { Router } from 'express';
import InvoiceController from '../controllers/invoice.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const invoiceController = new InvoiceController();

router.post('/', authenticate, AsyncWrapper(invoiceController.postInvoice));

router.put('/', authenticate, AsyncWrapper(invoiceController.putInvoiceById));

router.get('/', authenticate, AsyncWrapper(invoiceController.getInvoiceById));

export const invoiceRouter = { baseUrl: '/api/invoice', router };
