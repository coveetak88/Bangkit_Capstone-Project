const express = require('express');
const app = express();

const authRoutes = require('./app/routes/authRoutes');
const testRoutes = require('./app/routes/testRoutes');
const userRoutes = require('./app/routes/userRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/test', testRoutes);
app.use('/user', userRoutes)

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}.`)
});
