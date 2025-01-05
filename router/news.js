const { response } = require("express");
const UserModel = require("../models/UserModel");

const Router = require("express").Router();

Router.post("/subscribe", async (req, res) => {
  const { email, preferences } = req.body;
  try {
    const user = await UserModel.findOneAndUpdate(
      { email },
      { $set: { preferences } },
      { upsert: true, new: true }
    );
    return res.status(200).json({
      message: "preferences updated",
      data: user,
    });
  } catch (err) {
    console.error("Error subscribing user:", err);
    res.status(500).json({
      error: "Error subscribing user",
    });
  }
});

module.exports = Router;
