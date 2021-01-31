var express = require('express');
const { Db } = require('mongodb');
var router = express.Router();
var productHelper = require('../helpers/productHelpers');
var userHelper = require('../helpers/userHelpers');
var verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next()
    } else {
        res.redirect('/login');
    };
};

/* GET users listing. */
router.get('/', async function (req, res, next) {
    let user = req.session.user;
    let cartCount = null;
    if (req.session.user) {
        cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    productHelper.getAllProduct().then((products) => {
        res.render('users/user-home', { products, user, cartCount })
    })
});

// get users login
router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
    } else {
        res.render('users/login', { logErr: req.session.logErr });
    }
});

// get users signup
router.get('/signup', (req, res) => {
    res.render('users/signup');
});

// post users signup form
router.post('/signup', (req, res) => {
    userHelper.doSignup(req.body).then((response) => {
        res.redirect('/login')
    });
});

// post users login form
router.post('/login', (req, res) => {
    userHelper.doLogin(req.body).then((response) => {
        if (response.status) {
            req.session.user = response.user;
            req.session.loggedIn = true;
            res.redirect('/');
        } else {
            req.session.logErr = "Invalid username or password";
            res.redirect('/login');
        }
    });
});

// get users logout
router.get('/logout', (req, res) => {
    req.session.user = null;
    req.session.loggedIn = false;
    res.redirect('/');
});

// get users cart
router.get('/cart', verifyLogin, async (req, res) => {
    let products = await userHelper.getCartProducts(req.session.user._id);
    let totalValue = 0;
    if (products.length > 0) {
        totalValue = await userHelper.getTotalAmount(req.session.user._id);
    }
    if (products.length < 1) {
        res.render('users/empty-cart', { user: req.session.user });
    } else {
        res.render('users/cart', { products, user: req.session.user, totalValue });
    }
});

// item adding function router
router.get('/addCart/:id', (req, res) => {
    console.log("api call");
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
        res.json({ status: true })
    });
});

// cart item increment or decrement function route
router.post('/change-product-quantity', (req, res) => {
    userHelper.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelper.getTotalAmount(req.session.user._id);
        res.json(response);
    });
});

// cart item remove function route
router.post('/remove-cart-item', (req, res) => {
    userHelper.deleteCartItem(req.body).then((response) => {
        res.json(response)
    });
});

// get users place order
router.get('/place-order', verifyLogin, async (req, res) => {
    let total = await userHelper.getTotalAmount(req.session.user._id);
    res.render('users/place-order', { total, user: req.session.user })
});

// post users place-order
router.post('/place-order', async (req, res) => {
    req.body.userId = req.session.user._id;
    let products = await userHelper.getCartProductList(req.body.userId);
    let totalPrice = await userHelper.getTotalAmount(req.body.userId);
    userHelper.placeOrder(req.body, products, totalPrice).then((orderId) => {
        if (req.body['payment-method'] === 'COD') {
            res.json({ codStatus: true });
        } else {
            // calling razorpay generated function
            userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
                res.json(response);
            })
        }
    });
});

// get users success page after payment
router.get('/order-success', (req, res) => {
    let email = req.session.user.Email;
    res.render('users/order-success', { email, user: req.session.user });
});

// get users my-orders
router.get('/my-orders', verifyLogin, async (req, res) => {
    let orders = await userHelper.getUserOrder(req.session.user._id);
    res.render('users/my-orders', { user: req.session.user, orders });
});

// get users details of specific order
router.get('/view-order-prod/:id', verifyLogin, async (req, res) => {
    let products = await userHelper.getUserOrderProduct(req.params.id);
    let order = await userHelper.getUserOrder(req.session.user._id)
    console.log("order:::", order);
    res.render('users/view-order-prod', { products, order, user: req.session.user })
});

// get users order tracking
router.get('/order-tracking/:id', verifyLogin, async (req, res) => {
    let orders = await userHelper.getUserOrder1(req.params.id);
    let products = await userHelper.getUserOrderProduct(req.params.id);
    res.render('users/order-tracking', { products, user: req.session.user, orders })
});

// get users product-details
router.get('/product-details/:id', async (req, res) => {
    let cartCount = null;
    if (req.session.user) {
        cartCount = await userHelper.getCartCount(req.session.user._id);
    }
    let products = await productHelper.getProductDetails(req.params.id);
    res.render('users/product-details', { products, user: req.session.user, cartCount })
});

// verify razorpay payment route
router.post('/verify-payment', (req, res) => {
    console.log(req.body);
    userHelper.verifyPayment(req.body).then(() => {
        userHelper.changePaymentStatus(req.body['order[receipt]']).then(() => {
            console.log("payment success");
            res.json({ status: true });
        });
    }).catch((err) => {
        console.log(err);
        res.json({ status: false, errMsg: "" })
    });
});

// get users contact page
router.get('/contact', (req, res) => {
    res.render('users/contact',{user:req.session.user});
});

module.exports = router;