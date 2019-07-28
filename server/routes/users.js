const router = require("express").Router();
const { user, loan } = require("../../db/models");

router.get("/", (req, res) => {
  const { id } = req.query;
  console.log(id);
  const userFoundPromise =
    id !== undefined
      ? user.findOne({ where: { id: id, deleted: false } })
      : user.findAll({ where: { deleted: false } });
  userFoundPromise
    .then(data => {
      if (!data) {
        res.status(404).send(data);
      }
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  const userFoundPromise =
    id !== undefined
      ? user.findOne({ where: { id: id, deleted: false } })
      : user.findAll();
  userFoundPromise
    .then(data => {
      if (!data) {
        res.status(404).send(data);
      }
      res.status(200).send(data);
    })
    .catch(err => {
      res.send(err).status(404);
    });
});

router.post("/", (req, res) => {
  const newUserValues = req.body;
  user
    .create(newUserValues)
    .then(() => {
      res.status(201).send();
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.put("/:id", (req, res) => {
  const updatedValues = req.body;
  const { id } = req.query;
  user
    .findOne(id)
    .then(userToUpdate => {
      userToUpdate
        .update(updatedValues)
        .then(() => {
          res.status(204).send();
        })
        .catch(err => {
          res.status(404).send(err);
        });
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
  const promiseSender = loan.findOne({ where: { senderId: id } }).catch(err => {
    res.status(500).send(err);
  });
  const promiseReciever = loan
    .findOne({ where: { recieverId: id } })
    .catch(err => {
      res.status(500).send(err);
    });
  Promise.all([promiseSender, promiseReciever])
    .then(values => {
      for (let i = 0; i < values.length; i += 1) {
        if (values[i]) {
          res.status(400).send("you have loans active");
          return;
        }
      }
      user.findByPk(id).then(userToDelete => {
        console.log(userToDelete);
        userToDelete.update({ deleted: true });
        res.status(200).send();
      });
    })
    .catch(err => {
      console.log(err);
      res.status(404).send(err);
    });
});

module.exports = router;
