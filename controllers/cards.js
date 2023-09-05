const httpConstants = require('http2').constants;
const BadRequestError = require('../errors/badRequest');
const NotFoundError = require('../errors/notFound');
const ForbiddenError = require('../errors/forbidden');
const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.status(httpConstants.HTTP_STATUS_OK).send(cards))
    .catch(next);
};

module.exports.addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail()
        .populate('owner')
        .then((data) => res.status(httpConstants.HTTP_STATUS_CREATED).send(data))
        .catch((error) => {
          if (error.name === 'DocumentNotFoundError') {
            next(
              new NotFoundError('Карточка с указанным индификатором не найдена'),
            );
          } else {
            next(error);
          }
        });
    })
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Карточка другого пользователя');
      }
      Card.deleteOne(card)
        .orFail()
        .then(() => {
          res
            .status(httpConstants.HTTP_STATUS_OK)
            .send({ message: 'Карточка удалена' });
        })
        .catch((error) => {
          if (error.name === 'DocumentNotFoundError') {
            next(
              new NotFoundError('Карточка с указанным индификатором не найдена'),
            );
          } else if (error.name === 'CastError') {
            next(new BadRequestError('Некорректный индификатор'));
          } else {
            next(error);
          }
        });
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        next(
          new NotFoundError('Карточка с указанным индификатором не найдена'),
        );
      } else {
        next(error);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(httpConstants.HTTP_STATUS_OK).send(card);
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        next(
          new NotFoundError('Карточка с указанным индификатором не найдена'),
        );
      } else if (error.name === 'CastError') {
        next(new BadRequestError('Некорректный индификатор'));
      } else {
        next(error);
      }
    });
};

module.exports.unlikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(httpConstants.HTTP_STATUS_OK).send(card);
    })
    .catch((error) => {
      if (error.name === 'DocumentNotFoundError') {
        next(
          new NotFoundError('Карточка с указанным индификатором не найдена'),
        );
      } else if (error.name === 'CastError') {
        next(new BadRequestError('Некорректный индификатор'));
      } else {
        next(error);
      }
    });
};
