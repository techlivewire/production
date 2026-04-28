const express = require("express");
const app = express();
const mongoose = require("mongoose");

const fs = require("fs");
const path = require("path");

app.use(express.json());
app.use(express.static("public"));
app.use(express.static("admin"));
app.use(express.urlencoded({ extended: true })); 

app.set("views", path.join(__dirname, "views"));








module.exports = app;