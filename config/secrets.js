/**
 * On Windows to set env variables:
 * set NODE_ENV=stuff
*/

module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || '\xfc\n\x14\xec\xc1\xa37W\xb4\xdc\x18\xc6,\xde\x02Fa\x05\xa7\xe7*"\xcaD',

  hashidSecret: process.env.HASHID_SECRET || '\x83D\xbe\xf1\xbfh=\x00PN\xcc\xccrfsR\xac\xd4`\xb0\x93q\xc1\xa0',

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || 'hspassword00'
  },

  banUsernames: ['signup', 'login', 'logout', 'settings', 'browse', 'community', 'about']

};
