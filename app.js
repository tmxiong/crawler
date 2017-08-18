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
var async = require('async');
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = BASE_URL + '/explore#monthly-hot';

dataHelper.getHtmlByUrl(EXPLORE_URL,(link)=>dataHelper.getMonthlyLink(link));

// 并发连接数的计数器
// var concurrencyCount = 0;
// var fetchUrl = function (url, callback) {
//     // delay 的值在 2000 以内，是个随机的整数
//     var delay = parseInt((Math.random() * 10000000) % 2000, 10);
//     concurrencyCount++;
//     console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
//     setTimeout(function () {
//         concurrencyCount--;
//         callback(null, url + ' html content');
//     }, delay);
// };
// var urls = [];
// for(var i = 0; i < 30; i++) {
//     urls.push('http://datasource_' + i);
// }
// async.mapLimit(urls, 5, function (url, callback) {
//     fetchUrl(url, callback);
// }, function (err, result) {
//     console.log('final:');
//     console.log(result);
// });