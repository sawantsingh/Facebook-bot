'use strict';

// Wit.ai parameters
const WIT_TOKEN = "CQYOSB2V4UJ4PER2Z3N6EBFGCJ7WPV7S"//;process.env.WIT_TOKEN;
if (!WIT_TOKEN) {
  throw new Error('missing WIT_TOKEN');
}

// Messenger API parameters
const FB_PAGE_TOKEN = "EAAJbdXC4E9kBAI3AlQbzScNuCkfhZBZCdoDy6VIVX5VP8m1pBA56xolOWS7RqtQVZCjC9DljgoA9FqdVdgmqALfxYCrqgE6GXJIR7NOxiJOcgK4ZALeeQTZCDo0KweiDhZANT8qcgyMFduJdNzFMe001HMhkHPt6wiOlmZBYq8xZAvjvU1ZC5cRpe";//process.env.FB_PAGE_TOKEN;

var FB_VERIFY_TOKEN = "my_voice_is_my_password_verify_me";//process.env.FB_VERIFY_TOKEN;
if (!FB_VERIFY_TOKEN) {
  FB_VERIFY_TOKEN = "just_do_it";
}

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
};