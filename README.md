# InstaLike

A service that automatically likes posts on Instagram from friends.

## Project Description:
Built this after I got lazy of scrolling Instagram for long periods. Uses Express.js. The following values can be configured:

In app.js:
- MAX_LIKE_THRESHOLD
- DAYS_AGO_THRESHOLD

(I believe Instagram has a 200 requests/hour limit before they start throttling, so the two values are important)

In files:
* `lists/regular.txt`
  * Contains line-separated usernames of friends whose post you want to like
* `.env`
  * Contains your Instagram username and password, and the last post seen while running this service (so you don't like posts back this service's last run

## TODOs
* Containerize service
  * Docker, AWS Lambda, can be run as cron job
  * Feature to schedule run frequency
* UI
  * For adding friends' usernames
  * Configure max like and days ago threshold 
* Generate comments from post contents using image recognition and text analysis

## To run
1. Add usernames of friends you want to auto like posts to `lists/regular.txt`, one username per line. For example: 
```
user_1
user_2
```
2. Add your Instagram username and password to `.env`:

```
IG_USERNAME=username
IG_PASSWORD=password
```

3. From repository root
* `npm install`
* `npm start`
* `curl http://localhost:3000/likePosts`
  * (You can access the above endpoint via browser)