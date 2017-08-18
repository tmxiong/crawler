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


/* 获取所有关注者
* https://www.zhihu.com/api/v4/members/xxoo123-72/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=40&limit=20
* */

var offsetNum = 20; // 20为第一页, 40为第二页......
var limitNum = 20; // 默认每页20条数据;

var PEOPLE_URL = '';
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = '/explore#monthly-hot';

var eventproxy = require('eventproxy'); //控制并发
var superagent = require('superagent'); //发送请求
var cheerio = require('cheerio'); //获取html内容
var Eventproxy = require('eventproxy');
var asyc = require('async');
var request = require('request');
var https = require('https');

var count = 0;
module.exports = {

    ep() {
        return new Eventproxy();
    },

    // step 1 : 根据EXPLORE_URL,获取html
    getHtmlByUrl(url, callBack) {
        superagent.get(url)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }
                callBack(res);
            });
    },

    // step 2: 获取'发现'-->'今本月最热'显示的第一条话题的第一条评论的链接;
    // 初始状态显示10条话题
    getMonthlyLink(data) {
        var $ = cheerio.load(data.text);
        var tabPanel = $('.tab-panel').eq(1); // 0 为'今日最热', 1 为 '本月最热'
        var links = $(tabPanel).find('.author-link');
        var link = links.eq(count).attr('href');
        //console.log(link);
        //asyc.mapLimit()
        this.getHtmlByUrl(BASE_URL + link, (data)=>this.getDataByHtml(data));
    },

    // step 3 : 根据请求的html获取个人主页中的资料
    getDataByHtml(data) {
        var $ = cheerio.load(data.text);
        var homeLink =  BASE_URL + $(".Tabs-link").attr('href').split('/').splice(0,3).join('/');
        var flowersLink = 
        var sex = $(".Icon--male") == null ? '男' : '女';
        var flowers = $(".NumberBoard-value").eq(1).text();
        console.log('昵称:' + $('.ProfileHeader-title .ProfileHeader-name').text());
        console.log('性别:' + sex);
        console.log('签名:' + $('.ProfileHeader-title .ProfileHeader-headline').text());
        console.log('头像:' + $(".Avatar--large").prop('src'));

        var infoItems = $(".ProfileHeader-infoItem");
        if (infoItems.length) {
            for (var i = 0; i < infoItems.length; i++) {
                console.log(infoItems.eq(i).children().children().attr('class').split('--')[1] + ':' + infoItems.eq(i).text())
            }
        }

        console.log('关注人数:' + flowers);
        console.log('主页:' + homeLink);

        console.log('-----------------------------------------------------');
        console.log('-----------------------------------------------------');

        //if(parseInt(flowers) == 0) return;

        //var flowersLink = link + '/followers?page=2';

        //step 4 : 获取个人主页中所有'关注者'
        PEOPLE_URL = link;
        this.getDataByUrl();

    },

    getApiUrl() {
        return  BASE_URL + '/api/v4/members' + PEOPLE_URL + '/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset='+ offsetNum +'&limit=' + limitNum;
        // https://www.zhihu.com/api/v4/members/zhu-shu-shu-60/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=40&limit=20
    },

    //step 5 : 根据api获取个人主页中所有'关注者'
    getDataByUrl() {
       //  console.log(this.getApiUrl());
       // request(this.getApiUrl(),(err, res, body)=>{
       //     console.log(res.statusCode);
       //     console.log(body);
       // })
        var apiUrl = this.getApiUrl();
        var options = {
            hostname: apiUrl,
            port: 443, //端口号 https默认端口 443， http默认的端口号是80
            //path: path,
            method: 'GET',
            headers: {
                "Connection": "keep-alive",
                //"Content-Length": 111,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
            }//伪造请求头
        };
        var req = https.request(options, (res)=>{
            var json = '';
            console.log(res.statusCode);
            res.on('data', (chunk)=>{
                json += chunk;
            });
            res.on('end', ()=>{
                console.log(json);
            })
        });
        req.on('error',(err)=>{
            console.log(err)
        });
        req.end();
    },

    setData () {

    },
};




