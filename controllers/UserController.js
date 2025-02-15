const UserModel = require('../models/UserModel');

const UserRouter = require('express').Router();


UserRouter.post('/subscribe', async (req, res) => {
    const { email, preferences } = req.body
    try {
        const user = await UserModel.findOneAndUpdate(
            { email },
            { $set: { preferences } },
            { upsert: true, new: true }
        );
        return res.status(200).json({
            message: 'preferences updated',
            data: user
        })
    } catch (err) {
        console.error('Error subscribing user:', err);
        return res.status(500).json({
            error: 'Error subscribing user'
        })
    }
});



module.exports = UserRouter;