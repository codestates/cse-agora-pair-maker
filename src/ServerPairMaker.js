const { createEventAdapter } = require('@slack/events-api');
const { createServer } = require('http');
const { WebClient, ErrorCode } = require('@slack/web-api');
const express = require('express');
const { scheduleJob } = require('node-schedule');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const schedule = require('node-schedule')

const conversationId = 'C026MQ2GV2T';
const slackEvents = createEventAdapter(process.env.SLACK_SECRET);
const token = process.env.SLACK_BOT_TOKEN
const channel = 'C026MQ2GV2T'
const web = new WebClient(token);
//users.list teams.list

(async () => {
  try {
    // See: https://api.slack.com/methods/chat.postMessage
    //  1. 월요일 아침 9시에 페어 매칭하기  => done
    //* 1-1. 일단 현재 채널에 있는 구성원 목록 가져오기 
    //* 1-2. 가져온 사람이 홀수면 한 조는 3인으로 짝을 짓고, 짝수면 2인씩 짝짓는다.
    //* 1-3. 매주 월요일 아침 9시에 공지한다
    // todo: 2. 명령어 '/페어' 입력 시 페어 목록 출력하기  
    // 2-1. 명령어 '/페어ㅇㅇㅇ제외' 입력 시 특정 유저 페어 목록에서 제거하기
    // 2-2. 제거한 상태에서 페어 재매칭해서 공지
    // todo: 3 배포

    const noticePair = () => {
      web.conversations.members({channel: conversationId, token: token})
        .then(async res => {

            const userIds = res.members;
            let usernames = [];
  
            for(i = 0; i < userIds.length; i++) {
             const username = await web.users.info({token: token, user: userIds[i]});
             if (username.user.tz.includes('Asia')) {
             usernames.push(username.user.real_name);
             }
            }
              
            //명령어 입력 시 제거
            
  
            const shuffle = (usernames) => {
              const copyUsernames = usernames.slice();
              return copyUsernames.sort(() => Math.random() - 0.5);
            }
            const shuffledUsernames = shuffle(usernames);
  
            let pairs = [];
            for(let i = 0; i < shuffledUsernames.length; i += 2) {
              let pair = shuffledUsernames.slice(i, i + 2);
  
              if(i === shuffledUsernames.length - 3) {
                  pair = shuffledUsernames.slice(-3);
                  pairs.push(pair);
                  break;
              }
              pairs.push(pair);
            }
  
            const pairsToJSON = JSON.stringify(pairs);
            console.log(pairsToJSON);
            // const result = await web.chat.postMessage({ 
            //   channel: conversationId, text: `이번 주 아고라 페어 명단은 ${pairsToJSON}입니다`
            // });

            
          })
          .catch(err => console.log(err));
    };


    
     
    
    //advanced 매주 빠지는 사람을 채팅을 통해 받을 수 있다.
    //advanced 
  
    // console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
    schedule.scheduleJob('00 11 * * mon', noticePair);

  } catch (error) {
    if(error.code === ErrorCode.PlatformError) {
      console.log(error.data, conversationId);
    } else {
      console.log(error);
    }
  }
})();

