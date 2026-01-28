const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

/**
 * POST /phones
 * Create a phone model entry
 */
router.post('/', async (req, res, next) => {
    try {
        const {
            brand,
            model,
            ram,
            storage,
            color,
            purchasePrice,
            sellingPrice,
            quantity,
            status, // optional (default: in_stock)
        } = req.body;

        // validation
        if (
            !brand
            || !model
            || color == null
            || ram == null
            || storage == null
            || purchasePrice == null
            || sellingPrice == null
            || quantity == null
        ) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: [
                    'brand',
                    'model',
                    'ram',
                    'storage',
                    'color',
                    'purchasePrice',
                    'sellingPrice',
                    'quantity',
                ],
            });
        }

        const phone = await prisma.phone.create({
            data: {
                brand: String(brand).trim(),
                model: String(model).trim(),
                ram: Number(ram),
                storage: Number(storage),
                color: String(color).trim(),

                purchasePrice: String(purchasePrice),
                sellingPrice: String(sellingPrice),

                quantity: Number(quantity),

                status: status ? String(status) : undefined,
            },
        });

        return res.status(201).json(phone);
    } catch (err) {
        return next(err);
    }
});

/**
 * GET /phones
 * List phones + filters: brand, model, minPrice, maxPrice
 */
router.get('/', async (req, res, next) => {
    try {
        const {
 brand, model, minPrice, maxPrice 
} = req.query;

        const where = {};

        if (brand) {
            where.brand = { contains: String(brand), mode: 'insensitive' };
        }

        if (model) {
            where.model = { contains: String(model), mode: 'insensitive' };
        }

        const phones = await prisma.phone.findMany({
            where,
            orderBy: { createdAt: 'asc' },
        });

        return res.json(phones);
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
