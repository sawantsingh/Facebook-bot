'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log(message);

    // Bot testing mode, run cb() and return
    if (require.main === module) {
      cb();
      return;
    }

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },

  ['merge'](sessionId, context, entities, message, cb) {

    const contract = firstEntityValue(entities, 'intent');
    
     console.log('Contract found', contract);

    if (contract) {

      if (contract == 'contract'){
        context.confirmation = 'Sure things! Please tell me your contract Id?';
      }
      else {
        context.confirmation = "Sorry, I didn't get you." ;
      }

      cb(context);
      delete context.confirmation;
    }    
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },


   ['getContract'](sessionId, context, cb) {
           
    //  const contractId = firstEntityValue(entities, 'intent');
    //  console.log('Intent ContractID found', contractId);
    //  if (contractId) {
    //    if(contractId == 'contractId') {
            context.contractInfo = 'Your current contract status is active';
      //  }
      //  else {
      //       context.contractInfo = "I didn't get, please provide a valid contract Id.";
      //  }
     //}
    cb(context);
    delete context.contractInfo;
  },


/*
  // fetch-weather bot executes
  ['fetch-weather'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)

    context.forecast = 'sunny';
    cb(context);
    delete context.loc;
  },
  */

};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}