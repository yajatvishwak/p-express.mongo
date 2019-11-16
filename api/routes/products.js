const express = require('express');
const router = express.Router();
const Product = require("../models/product");
const mongoose = require('mongoose');
router.get('/', (req, res, next) => {
    Product.find().select('name price _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                products: docs.map(doc => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        _id: doc._id,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/products/' + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product
        .save()
        .then(result => {
            console.log(result);
            res.status(201).json({
                message: 'Product Made',
                createdProduct: {
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            });
        }).catch(
            err => {
                console.log(err);
                res.status(500).json({
                    error: err
                });

            }
        );


});

router.get('/:productID', (req, res, next) => {
    const id = req.params.productID;
    Product.findById(id).exec().then(doc => {
        console.log("from db", doc);
        if (doc) {
            res.status(200).json(doc);
        } else {
            res.status(404).json({
                message: "No Object found"
            });
        }

    }).catch(err => { console.log(err), res.status(500).json({ error: err }); });
});



router.delete('/:productID', (req, res, next) => {
    Product.remove({ _id: req.params.productID }).exec()
        .then(result => { res.status(200).json(result); })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
    res.status(200).json({
        message: 'Deleted product'
    });
});

router.patch('/:productID', (req, res, next) => {
    const productid = req.params.productID;
    console.log(productid);
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: productid }, { $set: updateOps }).exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Product Updated',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products'


                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;