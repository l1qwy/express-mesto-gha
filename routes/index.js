const router = require('express').Router();
const userRouter = require('./users');
const cardsRouter = require('./cards');
const signupRouter = require('./signup');

router.use('/signup', signupRouter);
router.use('/users', userRouter);
router.use('/cards', cardsRouter);

module.exports = router;
