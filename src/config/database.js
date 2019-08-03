require("dotenv/config");

module.exports = {
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_HOST,
  password: process.env.USER,
  database: process.env.PASS,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true
  }
};
