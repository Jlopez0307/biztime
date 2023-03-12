/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")
const companyRoutes = require('./routes/companies');
const invoiceRoutes = require('./routes/invoices');


app.use(express.json());

//Company routes
app.use('/companies', companyRoutes);

//Invoice routes
app.use('/invoices', invoiceRoutes);

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000')
})


module.exports = app;
