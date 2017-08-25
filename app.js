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
var page = 1;

var superagent = require('superagent'); //发送请求
var dataHelper = require('./helper/dataHelper');
var dbHelper = require('./helper/dbHelper');
var async = require('async');
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = BASE_URL + '/node/ExploreAnswerListV2?params={"offset":' + page + ',"type":"day"}';
var userInfo_url = 'https://www.zhihu.com/api/v4/members/tan-zheng-ying'
var follower_url = 'https://www.zhihu.com/api/v4/members/'+ '' +'/followers'

var links = [];
var allLinks = [];



/***********************************第一步start*********************************************/
// 根据url获取页面
function promiseGetHtml(url) {
    return new Promise((resolve, reject)=> {
        dataHelper.getHtmlByUrl(url, (data)=> {
            resolve(data.text);
        });
    })
}

function resolveData(data) {
    // 获取到了每页的4或5个链接;
    page ++;
    EXPLORE_URL = BASE_URL + '/node/ExploreAnswerListV2?params={"offset":' + page + ',"type":"month"}';
    links = dataHelper.getPersonLink(data);
    // 数组去重
    for(var i = 0; i < allLinks.length; i ++) {
        for(var j = 0; j < links.length; j++) {
            if(allLinks[i] == links[j]) {
                links.splice(j,1);
            }
        }
    }

    allLinks = allLinks.concat(links);
    console.log(links);
    console.log(page);
    if(page > 100) return;
    promiseGetHtml(EXPLORE_URL)
        .then((data)=>{
            resolveData(data);
        })
}

// promiseGetHtml(EXPLORE_URL)
//     .then((data)=> {
//         resolveData(data);
//     });

/***********************************第一步end*********************************************/








/***********************************第二步start*********************************************/
// 关注者的分页json数据
function getFollowersLink(link,type) {
    var follower_url = 'https://www.zhihu.com/api/v4/members/'+ link +'/followers?limit=20';
    if(type == 'more') follower_url = link;
    dataHelper.getDataByUrl(follower_url,(data)=>{
        var paging = data.paging;
        var isEnd = paging.is_end;
        var next = paging.next;

        data = data.data;
        var url_tokens = data.map((item,idx)=>{
            return item.url_token;
        });
        if(!isEnd) {
            getFollowersInfo(url_tokens, next);
        } else{
            // 没有数据了!!
            console.log('没有数据了!')
            return;
        }

    });

}

function getFollowersInfo(linkArr, next) {

    // 并发连接数的计数器
    var concurrencyCount = 0;

    var urls = linkArr;

    async.mapLimit(urls, 3, (url, callback)=> {
        concurrencyCount++;
        dataHelper.getHtmlByUrl(BASE_URL + '/people/' + url,(data)=>{
            var user_Info = dataHelper.getUserInfoByHtml(data.text);
            console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
            concurrencyCount--;
            console.log(user_Info);
            callback(null, url);
        });
        // superagent
        //     .get(BASE_URL + '/people/' + url)
        //     .end((err,res)=>{
        //         if(err) return console.log(err);
        //         console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
        //         concurrencyCount--;
        //
        //         callback(null, url);
        //     })
    },(err, result)=> {
        page++;
        console.log('-----------现在是第' + page + '页--------------');
        getFollowersLink(next,'more');
    });

}

getFollowersLink('temmozhang','one');









/***********************************第二步end*********************************************/

