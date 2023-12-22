const express = require('express'),  
  bodyParser = require("body-parser"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");
const app = express();

const authRoutes = require('./app/routes/authRoutes');
const testRoutes = require('./app/routes/testRoutes');
const userRoutes = require('./app/routes/userRoutes');
const restaurantRoutes = require('./app/routes/restaurantRoutes');
const foodRoutes = require('./app/routes/foodRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const options = {
  definition: {
    openapi: "3.1.0",
    // info: {
    //   title: "LogRocket Express API with Swagger",
    //   version: "0.1.0",
    //   description:
    //     "This is a simple CRUD API application made with Express and documented with Swagger",
    //   license: {
    //     name: "MIT",
    //     url: "https://spdx.org/licenses/MIT.html",
    //   },
    //   contact: {
    //     name: "LogRocket",
    //     url: "https://logrocket.com",
    //     email: "info@email.com",
    //   },
    // },
    // 🚩INI BOLEH DIGANTI2 GAK YA WKWK
    info: {
      title: "LocalBite API with Swagger",
      version: "1.0.0",
      description:
        "This API powers the LocalBite application, providing user authentication and management functionality, made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "LocalBite Team",
        url: "",
        email: "localbite.bangkit@gmail.com",
      },
    },
    servers: [
      {
        url: "https://localbitebackendnew.safira1003.repl.co:8081",
      },
    ],
  },
  apis: ["./app/routes/*.js"],
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, { explorer: false }));

app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/user', userRoutes);
app.use('/maps', restaurantRoutes);
app.use('/food', foodRoutes);

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`)
});
