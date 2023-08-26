const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: error.message });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getUserId = (req, res) => {
  if (req.params.userId.length === 24) {
    User.findById(req.params.userId)
      .orFail(new Error('InvalidId'))
      .then((user) => {
        res.status(200).send(user);
      })
      .catch((error) => {
        if (error.message === 'InvalidId') {
          res.status(404).send({ message: 'Пользователь с данным индификатором не найден' });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  } else {
    res.status(400).send({ message: 'Некорректный индификатор' });
  }
};

module.exports.editUserInfo = (req, res) => {
  const { name, about } = req.body;
  if (req.user._id) {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
      .then((user) => res.send(user))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  } else {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

module.exports.editUserAvatar = (req, res) => {
  if (req.user._id) {
    User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
      .then((user) => res.send(user))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: error.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  } else {
    res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
