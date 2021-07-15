const express = require('express');
const {parse, stringify} = require('envfile');
const fs = require('fs');
const { IgApiClient } = require('instagram-private-api');
require('dotenv').config();

const app = express();
const ig = new IgApiClient();
const port = process.env.PORT || 3000;

const MAX_LIKE_THRESHOLD = 50;
const DAYS_AGO_THRESHOLD = 7;
const DAYS_AGO_DATE = new Date();
DAYS_AGO_DATE.setDate(DAYS_AGO_DATE.getDate() - DAYS_AGO_THRESHOLD);
const envFilePath = '.env';
const UTF8 = 'utf8';
const USERS_TO_LIKE = new Set(fs.readFileSync('./lists/regular.txt', UTF8).split('\n'));
const MY_USERNAME = process.env.IG_USERNAME;
const MY_PASSWORD = process.env.IG_PASSWORD;
const LAST_SEEN_POST = process.env.MOST_RECENT_SEEN_IG_POST_CODE;

let isFirstPost = true;

app.get('/likePosts', async(req, res) => {
  ig.state.generateDevice(MY_USERNAME);
  const account = await ig.account.login(MY_USERNAME, MY_PASSWORD);
  const feed = ig.feed.timeline();
  let liked = 0, notSeenYet = true, isRecentPost = true;
  while (liked < MAX_LIKE_THRESHOLD && notSeenYet && isRecentPost) {
    await feed.items().then(fromFeed => {
      updateMostRecentSeenPostIfFirst(fromFeed);
      for (const post of fromFeed) {
        // debugPost(post);
        if (!post.user.friendship_status.following) {
          console.log('encountered an ad \n')
          continue;
        } 
        if (post.has_liked) {
          console.log('we liked already \n')
          continue;
        }
        if (liked >= MAX_LIKE_THRESHOLD) {
          break; // need a better way to break, it's still continuing here
        }
        if (post.code === LAST_SEEN_POST) {
          notSeenYet = false;
          break;
        }
        // if (getDate(post.taken_at) < DAYS_AGO_DATE) {
        //   console.log('old date') 
        //   console.log(getDate(post.taken_at));
        //   console.log(DAYS_AGO_DATE)
        //   isRecentPost = false;
        //   break;
        // }
        // doesn't work because posts returned aren't chrono ordered
        if (USERS_TO_LIKE.has(post.user.username)) {
          console.log('liking \n')
          ig.media.like({
            mediaId: post.id,
            moduleInfo: {
              user_id: account.pk
            }
          })
          liked++;
        }
      }
    });
  }
  res.sendStatus(200); 
});

app.get('/getFollowing', async(req, res) => {
  const following = await ig.feed.accountFollowing()
  const items = await following.items();
  console.log("following count: " + items.length);
  items.forEach(i => {
    console.log(i.username);
  });
  res.sendStatus(200); 
});

function getDate(timestamp) {
  return new Date(timestamp * 1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function debugPost(post) {
  console.log("the post code: " + post.code);
  console.log('the user: ' + post.user.username);
  console.log('seen?: ' + post.is_seen);
  console.log('liked?: ' + post.has_liked + '\n');
}

function basicPromiseHandling(promise) {
  // could add to promise prototype, or have another wrapper obj for promises
  return promise
    .then(obj => console.log("succ: " + JSON.stringify(obj)))
    .catch(err => console.log("err: " + JSON.stringify(err)));
}

function updateMostRecentSeenPostIfFirst(fromFeed) {
  if (fromFeed.length > 0 && isFirstPost) {
    let data = parse(fs.readFileSync(envFilePath, UTF8));
    data.MOST_RECENT_SEEN_IG_POST_CODE = fromFeed[0].code;
    fs.writeFileSync(envFilePath, stringify(data));
    isFirstPost = false;
  }
}

app.set('port', port);
app.listen(port);

module.exports = app;
