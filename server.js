require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const jwt = require('jsonwebtoken');



const PORT = process.env.PORT || 5000;

app.use(express.json());


// LOGIN ROUTE
app.post('/login', processToken, (req, res)=> {

  const Access_Token = genAccessToken(req.body.phoneNumber);
  const Refresh_Token = jwt.sign(req.body.phoneNumber, process.env.REFRESH_TOKEN_SECRET);
  res.json({access_token: Access_Token, refresh_token: Refresh_Token}).status(200);

})

// PROCESS TOKEN
function processToken(req, res, next) {
  
  const phoneNumber = req.body.phoneNumber;
  const  password=  req.body.password;
  const scopes = req.body.scopes;

  const options = {
  method: 'POST',
  url: 'https://stoplight.io/mocks/chatdaddy/openapi/15107942/token',
  headers: {'Content-Type': 'application/json'},
  data: {phoneNumber, password, scopes}
};

axios.request(options)
  .then(function (response) {
    if (response.data) {
       next();
    }
   }).catch(function (error) {
     console.error(error);
   });

}


// GEN TOKEN
function genAccessToken(audience) {
  return jwt.sign(audience, process.env.ACCESS_TOKEN_SECRET)
}


app.post('/addcontact', addContact, (req, res, next)=> {
    res.json('Bearer').status(200);
})

function addContact(req, res, next) {
 
  const name = req.body.name; 
  const phoneNumber = req.body.phoneNumber; 
  const email = req.body.email; 
  const tags = req.body.tags;   
  const assignee = req.body.assignee; 

  console.log(name, phoneNumber, email, tags, assignee);

  const options = {
    method: 'POST',
    url: 'https://stoplight.io/mocks/chatdaddy/openapi/15107977/contacts/upsert',
    headers: {'Content-Type': 'application/json', Authorization: ''},
    data: {
      contacts: [
        {
          name: 'string',
          phoneNumber: 'string',
          email: 'string',
          tags: ['string'],
          assignee: '52cf793d-61ec-4818-938e-7a539e4f8457'
        }
      ]
    }
  }
  
  axios.request(options).then(function (response) {
     if ( response.data.success ) {
        authenticateToken(req, res, next);
     }
  }).catch(function (error) {
    console.error(error);
  });

}

function authenticateToken(req, res, next) {
  
  const Access_Token = req.headers['authorization'];


    if (Access_Token === null ) return res.send('Not a bearer');
     
    jwt.verify(Access_Token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
         if (err) return res.sendStatus(403)
         next();
    })

}


app.listen(PORT, () => { console.log(`Listening on PORT ${PORT}`)})