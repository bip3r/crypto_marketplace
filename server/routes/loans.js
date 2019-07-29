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
  const info = req.body;
  const { ammount, senderId, recieverId } = info;
  const senderUserPromise = user.findByPk(senderId);
  const recieverUserPromis = user.findByPk(recieverId);
  Promise.all([senderUserPromise, recieverUserPromis])
    .then(users => {
      const [sender, reciever] = users;
      if (sender.funds < ammount) {
        throw new Error("sender does not have enough money");
      }
      sequelize.transaction(t => {
        return sender
          .update({ funds: sender.funds - ammount }, { transaction: t })
          .then(() => {
            return reciever.update(
              { funds: reciever.funds + ammount },
              { transaction: t }
            );
          });
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

router.put("/:id?", (req, res) => {
  //  deadline can only go up.
  //  funds can not be changed, nor recieverId, senderId and id.
  /*
    ! important:
    status 0 - waiting for approval, 
    status 1 - active,
    status 2 - paid, 
    status 3 - timeout unpaid (needs to address this in the client side)
   */
  const { deadline, status } = req.body;
  const id = req.params.id || req.query.id;
  console.log(deadline, id);
  loan
    .findByPk(id)
    .then(data => {
      if (
        Date.parse(deadline) <= Date.parse(data.deadline) ||
        (!deadline && !status)
      ) {
        throw new Error("missing element or incorrect syntax of element");
      } else if (status < 0 || status > 4) {
        throw new Error("incorrect status");
      }
      data.update(req.body).then(() => {
        res.status(200).send();
      });
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

router.delete("/:id?", (req, res) => {
  // can delete only if status is 2.
  const id = req.params.id || req.query.id;
  loan
    .findByPk(id)
    .then(data => {
      if (data.status === 2) {
        data.update({ deleted: true }).then(() => {
          res.status(204).send();
        });
      } else {
        res.status(403).send("loan is still active");
      }
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
});

module.exports = router;

/*
TODO:
  - interval function to change the ammount in loans based on the rates.
  - check for atleast one month time for the loan.
 */
