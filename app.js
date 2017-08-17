/**
 * dependencies:
 * superagent, eventproxy, cheerio
 */


/* 头像: $(".Avatar--large").src
*  性别: 男: $(".Icon--male"); 女: $(".Icon--female")
*  昵称: $('.ProfileHeader-title').eq(0).text()
*  签名: $('.ProfileHeader-title').eq(1).text()
*  关注人数: $(".NumberBoard-value").eq(1).text()
*  主页:
*
*  --- 选填 ----
*  职业/教育
*  $(".ProfileHeader-info").eq(i)
* */

var dataHelper = require('./dataHelper/dataHelper');
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = BASE_URL + '/explore#monthly-hot';

dataHelper.getHtml(EXPLORE_URL,(link)=>dataHelper.getMonthlyLink(link));


