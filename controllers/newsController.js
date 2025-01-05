const express = require("express");
const Router = express.Router();
const cron = require("cron");
const user = require("../models/UserModel");
const axios = require("axios");
const sendgrid = require("@sendgrid/mail");

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const fetchNewsFromCurrentsAPI = async () => {
  try {
    const response = await axios.get(
      "https://api.currentsapi.services/v1/latest-news",
      {
        params: {
          apiKey: process.env.CURRENTS_API_KEY,
          country: "IN",
          language: "en",
        },
      }
    );
    return response.data.news;
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
};

const sendEmailNotification = async (user, news) => {
  const msg = {
    to: user.email,
    from: "news@news_alert_app.com",
    subject: `Breaking News: ${news.title}`,
    text: news.description,
  };
  try {
    await sendgrid.send(msg);
    console.log("Email sent successfully");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const sendNewsAlert = async (news) => {
  const users = await user.find({});
  users.forEach(async (user) => {
    if (user.preferences.notifications.includes("email")) {
      const filteredNews = news.filter((n) =>
        user.preferences.categories.includes(n.category)
      );
      filteredNews.forEach(async (newsItem) => {
        await sendEmailNotification(user, newsItem);
        user.notificationsHistory.push({
          title: newsItem.title,
          category: newsItem.category,
          timeStamp: new Date(),
          status: "sent",
        });
        await user.save();
      });
    }
  });
};

cron.schedule("0 * * * *", async () => {
  console.log("Fetching News....");
  const news = await fetchNewsFromCurrentsAPI();
  await sendNewsAlert(news);
});

module.exports = {
  sendNewsAlert,
  fetchNewsFromCurrentsAPI,
};
