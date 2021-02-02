var express = require('express');
var router = express.Router();

const ObjectId = require('mongodb').ObjectId;
const db = require("../database.js");

const cognito = require("../cognito.js");

// Get env file for keys and Ids
const dotenv = require('dotenv');
dotenv.config();

// Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require('body-parser');

// << db init >>
db.initialize(process.env.NOSQL_DBNAME, 'users', function (dbCollection) { // successCallback
  // << db CRUD routes >>

    /* Stripe (something) call */
    router.get('/', function(req, res, next) {
      /*some stripe api call code*/
    });

    router.get('/getPKey', async (req, res) => {
      res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
    });

    router.post('/getAccountTier', async (req, res) => {
      
      var custId = req.body.custId;

      var query = {
        "stripe_id" : custId
      }

      var record = await dbCollection.findOne(query, null);

      console.log(record);

      if(record.price_id == process.env.STRIPE_PAIDTIER){
        return res.status('200').send({ msg: "Account Tier returned.", tier: 1 });
      }
      else if(record.price_id == process.env.STRIPE_FREETIER){
        return res.status('200').send({ msg: "Account Tier returned.", tier: 2 });
      }
      else{
        return res.status('400').send({ msg: "Account Tier not found." });
      }

    });


    router.get('/getAllPrices', async (req, res) => {
      
      try{
            const prices = await stripe.prices.list({
              active: true
            });

            var outputList = [];
            for (x = 0; x < prices.data.length; x++){
              price = prices.data[x];

              var product = await stripe.products.retrieve(price.product);

              if(!product.name.includes("Pokimane")){ //filter out CA1 products
                outputList.push({
                  price_id: price.id,
                  product_id: price.product.id,
                  product_name: product.name,
                  currency: price.currency,
                  amt: price.unit_amount_decimal / 100,
                  paymentInterval: price.recurring.interval
                });
              }
              


            }

            if(outputList.length > 0){
              res.send({ outputList });
            }
            else{
              res.send({ error : "No products found" });
            }

      } catch (error) {
        return res.status('402').send({ error: error.message  });
      }

    });
    
    router.post('/logoutCustomer', async (req, res) => {

      try {
        var fullUrl = req.protocol + '://' + req.get('host') + '/'
        var result = await cognito.signOut();
        if(result){
          return res.status('200').send({ msg: "Customer logged out!"});
        }
        else{
          return res.status('402').send({ error: result.error.message });
        }
        

      } catch (error) {
        console.log(error);
        return res.status('402').send({ error: error.message  });
      }


    });

    router.post('/loginCustomer', async (req, res) => {

      try {
        var email = req.body.email;
        var password = req.body.password;
        
        const result = await cognito.signIn(email, password);
        console.log(result);

        if(result.success){

          var query = {
            "email" : email
          }
    
          var record = await dbCollection.findOne(query, null);
    
          console.log(record);
          return res.status('200').send({ msg: "Customer logged in!", user: result, stripe_id: record.stripe_id  });
        }
        else{
          return res.status('402').send({ error: result.error.message  });
        }
        
      } catch (error) {
        console.log(error);
        return res.status('402').send({ error: error.message  });
      }


    });


    router.post('/createCustomer', async (req, res) => {
      // Create a new customer object

      var email = req.body.email;
      var password = req.body.password;
      var name = req.body.name;

      await cognito.signUp(email, password, name);

      const customer = await stripe.customers.create({
        email: email,
      });

      dbCollection.insertOne({ 
        email: email,
        name: name,
        stripe_id: customer.id
      })
      .then((result) => {
        res.send({ customer });
      })
      .catch(e => { 
          console.log(e);
          res.status('400').send({ error: e });
      });


      
    });



    router.post('/purchasePlan', async (req, res) => {

    try {
      var custId = req.body.CustomerId;
      var priceId = req.body.PriceId;
      var token = req.body.CardToken;
      console.log(req.body);
      var paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: token
        }
      });

      paymentMethod = await stripe.paymentMethods.attach(
        paymentMethod.id,
        {customer: custId}
      );

      const subscription = await stripe.subscriptions.create({
        customer: custId,
        items: [
          {price: priceId},
        ],
        default_payment_method: paymentMethod.id
        
      });
      
      var query = {
        "stripe_id" : custId
      }

      var update = {
        $set:{
          "paymentmethod_id" : paymentMethod.id,
          "subscription_id" : subscription.id,
          "price_id": priceId
        }
      }

      dbCollection.updateOne(query, update, { "upsert": false })
        .then((result) => {
          return res.status('200').send({ msg: "Subscription plan registered and saved to database!"  });
        })
        .catch(e => { return res.status('500').send({ error: e  }); });

      

    } catch (error) {
      return res.status('400').send({ error: error.message  });
    }


    });

    router.post('/accessPortal', async (req, res) => {
      
      try {
        var custId = req.body.custId;
        var destination_page = req.body.dest
        var fullUrl = req.protocol + '://' + req.get('host') + '/' + destination_page;
        console.log(req.protocol);
        console.log(req.get('host'));
        console.log(req.originalUrl);

        const session = await stripe.billingPortal.sessions.create({
          customer: custId,
          return_url: fullUrl,
        });

        //res.redirect(session.url);

        //immediate redirect not used at it producess this error in the browser in the console:
        //Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://billing.stripe.com/session/_IqC3lbzmq17AhOP3CGY1Cp3tOpIKTtY. (Reason: CORS header ‘Access-Control-Allow-Origin’ missing).
        //Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://billing.stripe.com/session/_IqC3lbzmq17AhOP3CGY1Cp3tOpIKTtY. (Reason: CORS request did not succeed).

        return res.status('200').send({ redirect_url: session.url  });

      } catch (error) {
        return res.status('402').send({ error: error.message  });
      }

    });





    router.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {

      let event;
    
      try {
        
        event = request.body;
        console.log(event.type);
    
      } catch (err) {
    
        console.log(`⚠️  Webhook error while parsing basic request.`, err.message);
    
        return response.send();
    
      }
    
      // Handle the event
    
      switch (event.type) {
    
        case 'payment_intent.payment_failed':

        case 'payment_intent.succeeded':
    
          var paymentIntent = event.data.object;

          // if(event.type == 'payment_intent.payment_failed'){

          // }
          // else if(event.type == 'payment_intent.succeeded'){

          // }
    
          console.log(`PaymentIntent detected for ${paymentIntent}`);
    
          // Then define and call a method to handle the successful payment intent.
    
          // handlePaymentIntentSucceeded(paymentIntent);
    
          break;
    
        case 'customer.subscription.updated':
    
          var subscription = event.data.object;
          var cust_id = subscription.customer;
          var new_price_id = subscription.items.data[0].price.id;
          //currently no interaction with database as you can get price id from subscription
          
          console.log(`Customer subscription updated`);
          console.log(cust_id);
          console.log(new_price_id);

          var query = {
            "stripe_id" : cust_id
          }
    
          var update = {
            $set:{
              "price_id": new_price_id
            }
          }
    
          dbCollection.updateOne(query, update, { "upsert": false });
            // .then((result) => {
            //   return response.status('200').send({ msg: "Subscription plan registered and saved to database!"  });
            // })
            // .catch(e => { 
            //   return response.status('500').send({ error: e  }); 
            // });


          break;
        
        // case 'customer.subscription.deleted':
    
        //   var subscription = event.data.object;
        //   var cust_id = subscription.customer;
          
        //   console.log(`Customer subscription updated`);

        //   break;
    
        default:
    
          // Unexpected event type
    
          console.log(`Unhandled event type ${event.type}.`);
    
      }
    
      // Return a 200 response to acknowledge receipt of the event
    
      response.send();
    
    });


}, function (err) { // failureCallback
  throw (err);
});

module.exports = router;
