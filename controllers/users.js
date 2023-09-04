const httpConstants = require('http2').constants;
const User = require('../models/user');
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(httpConstants.HTTP_STATUS_OK).send(users))
    .catch(next);
};

module.exports.addUser = (req, res, next) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(httpConstants.HTTP_STATUS_CREATED).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(error.message));
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(httpConstants.HTTP_STATUS_OK).send(user);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequestError('Некорректный индификатор'));
      } else if (error.name === 'DocumentNotFoundError') {
        next(
          new NotFoundError('Пользователь с данным индификатором не найден'),
        );
      } else {
        next(error);
      }
    });
};

module.exports.editUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: 'true', runValidators: true },
  )
    .orFail()
    .then((user) => res.status(httpConstants.HTTP_STATUS_OK).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(error.message));
      } else if (error.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с данным индификатором не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.editUserAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { new: 'true', runValidators: true },
  )
    .orFail()
    .then((user) => res.status(httpConstants.HTTP_STATUS_OK).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(error.message));
      } else if (error.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с данным индификатором не найден'));
      } else {
        next(error);
      }
    });
};
