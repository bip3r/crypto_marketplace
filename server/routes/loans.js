const router = require("express").Router();
const { user, loan, sequelize } = require("../../db/models");

const getLoanById = id => {
  return loan.findByPk(id);
};
const getLoanBySenderId = senderId => {
  return loan.findAll({
    where: {
      senderId: senderId,
      deleted: false
    }
  });
};
const getLoanByRecieverId = recieverId => {
  return loan.findAll({
    where: {
      recieverId: recieverId,
      deleted: false
    }
  });
};

router.get("/:id?", (req, res) => {
  const { senderId, recieverId } = req.query;
  const { id } = req.params;
  let reqLoan = null;
  if (id) {
    reqLoan = getLoanById(id);
  } else if (senderId) {
    reqLoan = getLoanBySenderId(senderId);
  } else if (recieverId) {
    reqLoan = getLoanByRecieverId(recieverId);
  } else {
    reqLoan = null;
  }
  reqLoan
    .then(data => {
      if (data && data[0]) {
        console.log(data);
        res.status(200).send(data);
        return;
      }
      res.status(404).send();
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.post("/", (req, res) => {
  //! add check for ammount of loan
  const info = req.body;
  const { ammount, senderId, recieverId } = info;
  const senderUserPromise = user.findByPk(senderId);
  const recieverUserPromis = user.findByPk(recieverId);
  Promise.all([senderUserPromise, recieverUserPromis]).then(users => {
    const [sender, reciever] = users;
    //! transaction does not work
    sequelize
      .transaction(t => {
        sender
          .update({ funds: sender.funds - ammount }, { transaction: t })
          .then(() => {
            reciever.update(
              { funds: sender.funds + ammount },
              { transaction: t }
            );
          });
      })
      .then(() => {
        loan.create(info).then(() => {
          res.status(201).send();
        });
      })
      .catch(err => {
        res.status(400).send(err.message);
      });
  });
});

module.exports = router;
