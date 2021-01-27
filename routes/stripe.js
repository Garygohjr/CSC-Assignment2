var express = require('express');
var router = express.Router();

// Get env file for keys and Ids
const dotenv = require('dotenv');
dotenv.config();

// Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


/* Stipe (something) call */
router.get('/', function(req, res, next) {
  /*some stripe api call code*/
});

router.get('/getPKey', async (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
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

          outputList.push({
            price_id: price.id,
            product_id: price.product.id,
            product_name: product.name,
            currency: price.currency,
            amt: price.unit_amount_decimal / 100,
            paymentInterval: price.recurring.interval
          });


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


router.post('/createCustomer', async (req, res) => {
  // Create a new customer object
  const customer = await stripe.customers.create({
    email: req.body.email,
  });
  res.send({ customer });
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

  return res.status('200').send({ msg: "Subscription plan registered!"  });

} catch (error) {
  return res.status('402').send({ error: error.message  });
}


});


module.exports = router;
