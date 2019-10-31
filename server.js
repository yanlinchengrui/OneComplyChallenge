const express = require('express');
const app = express();

const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config()

app.set('view engine', 'ejs');
app.use(morgan('dev'));

const PORT = 8080; // default port 8080
const api = 'https://www.formstack.com/api/v2';

const submission = `${api}/submission/551042206.json?oauth_token=${process.env.OAUTH_TOKEN}`;
const form = `${api}/form/3634968.json?oauth_token=${process.env.OAUTH_TOKEN}`;

app.get('/', (req, res) => {
  axios.get(submission).then(submissionRez => {
    const fieldAndValueList = submissionRez.data.data;

    axios.get(form).then(formRez => {
      const fields = formRez.data.fields;
      const resultObject = {};

      fieldAndValueList.forEach(fieldAndValue => {
        fields.forEach(field => {
          // match fields and get the label to save in the result object
          if (fieldAndValue.field === field.id) {
            if (fieldAndValue.value.includes('\n')) {
              // get rid of the '\n' and everything before '=' in the string
              const arrayOfPairs = fieldAndValue.value.split('\n');
              const arrayOfValues = arrayOfPairs.map(element => element.substr(element.indexOf("=") + 2));

              // if it is the name, join the array to get the full name
              // else return and manipulate the address array in the view
              if (field.label === 'Name of Dependent') {
                resultObject[field.label] = arrayOfValues.join(' ');
              } else {
                resultObject[field.label] = arrayOfValues;
              }
            } else {
              resultObject[field.label] = fieldAndValue.value;
            }
          }
        });
      });

      res.render('main', { rez: resultObject });
    });
  });
});

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}!`);
});