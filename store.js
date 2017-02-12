var fs = require('fs');
var db = 'scraps.json';
var userTokens = {};
var userInfos = {};

exports.getUserToken = function (userId) {
    return userTokens[userId];
}

exports.getUserInfo = function (userId) {
    return userInfos[userId];
}

exports.getUserInfos = function (userId) {
    return userInfos;
}

exports.getConnectionWithUserId = function (userId) {
    return getUserInfo(userId).wsconnection;
}

exports.saveUserToken = function (userId, token) {
    userTokens[userId] = token;
}

exports.saveUserInfo = function (params, connection) {
  var userId = params.userId;
  var userInfo = {userName: params.userName, wsconnection: connection };
  console.log(userInfo);

  userInfos[userId] = userInfo;
}

var chats = {};

var conversationId = function (userId, chat) {
    if (chat.startsWith('u:') || chat.startsWith('b:')) {
        return [userId, chat].sort().join('|');
    } else {
        return chat;
    }
}

exports.saveScrap = function (userId, chat, text) {
    var cid = conversationId(userId, chat);
    if (!chats[cid]) {
        chats[cid] = [text];
    } else {
        chats[cid].push(text);
    }
};

exports.listScraps = function (userId, chat) {
    return chats[conversationId(userId, chat)];
};

var readDatabase = function () {
    try {
        var stringContent = fs.readFileSync(db);
        var content = JSON.parse(stringContent);

        userTokens = content.userTokens;
        chats = content.chats;
        userInfos = contents.userInfos;
    } catch (e) {
        console.log('Couldn\'t read db, starting empty.\nError:', e);
    }
};

var saveDatabase = function () {
    console.log('Saving db');
    var stringContent = JSON.stringify({ userTokens: userTokens, chats: chats, userInfos: userInfos });
    fs.writeFileSync(db, stringContent);
};

readDatabase();
process.on('SIGINT', function () { console.log('SIGINT'); process.exit(); });
process.on('SIGTERM', function () { console.log('SIGTERM'); process.exit(); });
process.on('exit', saveDatabase);
