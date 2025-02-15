require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const UserModel = require("../models/UserModel");
const axios = require("axios");
const nodemailer = require("nodemailer");
const connectDb = require("./DB").connectionDb;

// Connect to the database
connectDb();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const fetchNewsFromCurrentsAPI = async () => {
  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        apiKey: process.env.NEWS_API_KEY, 
        country: "IN",
        language: "en",
      },
    });
    return response.data.articles || [];
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
};

const sendEmailNotification = async (user, news) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: user.email,
    subject: `Breaking News: ${news.title}`,
    text: news.description || "No description available.",
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", user.email);
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

const sendNewsAlert = async (news) => {
  const users = await UserModel.find({});
  users.forEach(async (user) => {
    if (user.preferences.notifications.includes("email")) {
      const filteredNews = news.filter(
        (n) => user.preferences.categories.includes(n.category || "general")
      );
      filteredNews.forEach(async (newsItem) => {
        await sendEmailNotification(user, newsItem);
        user.notificationsHistory.push({
          title: newsItem.title,
          category: newsItem.category || "general",
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
