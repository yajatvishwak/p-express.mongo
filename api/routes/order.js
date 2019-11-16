const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');


router.get('/', (req, res, next) => {
    Order.find() //finds all order
        .select('quantity _id product')
        .exec() // turns it in to a real promise
        .then(docs => {
            res.status(201).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + doc._id
                        }

                    }
                }),

            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.post('/', (req, res, next) => {
    Product.findById(req.body.productID)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Not Found from post'
                });
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productID
            });
            order
                .save()
                .then(result => {

                    res.status(201).json({
                        message: 'Order stored',
                        createdOrder: {
                            _id: result._id,
                            product: result.product,
                            quantity: result.quantity
                        },
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + result._id

                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        message: 'Invalid Error',
                        error: err
                    })
                });

        })
        .catch(err => {
            res.status(500).json({
                message: 'Product not found',
                error: err
            });
        });



});

router.get('/:orderid', (req, res, next) => {
    Order.findById(req.params.orderid)
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'Not Found'
                });
            }

            res.status(200).json({
                orders: order
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });

});

router.delete('/:orderid', (req, res, next) => {
    Order.remove({ _id: req.params.orderid }).exec()
        .then(result => {
            res.status(200).json({
                message: "Order Deleted"
            });
        })
        .catch(err => {
            error: err
        });
});

router.delete('/', (req, res, next) => {
    Order.deleteMany({}).exec()
        .then(result => {
            res.status(201).json({
                message: 'Deleted all values'
            })
        })
        .catch(err => {
            console.log(err);
        });


});

module.exports = router;