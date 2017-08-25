/*
 *
 * answer_count:87
 articles_count:2
 avatar_url:"https://pic2.zhimg.com/v2-e1fc98e0a36c88d81c4dbec95a3ff989_is.jpg"
 avatar_url_template: "https://pic2.zhimg.com/v2-e1fc98e0a36c88d81c4dbec95a3ff989_{size}.jpg"
 badge : []
 follower_count : 175
 gender : 1
 headline : "规矩太多，往往会让人忘了真正想做的事"
 id : "02a9c4e851ebcfdd124d579c0c24b678"
 is_advertiser : false
 is_followed : false
 is_following : false
 is_org : false
 name : "风间残照"
 type : "people"
 url : "http://www.zhihu.com/api/v4/people/02a9c4e851ebcfdd124d579c0c24b678"
 url_token : "shu-ying-po-suo-49"
 user_type : "people"
 *
 *
 * */


/* 获取所有关注者
 * https://www.zhihu.com/api/v4/members/xxoo123-72/followers
 * */

var dbHelper = require('./dbHelper');

var offsetNum = 20; // 20为第一页, 40为第二页......
var limitNum = 20; // 默认每页20条数据;
var page = 0; // 页数

var PEOPLE_URL = '';
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = BASE_URL + '/node/ExploreAnswerListV2?params={"offset":' + page + ',"type":"month"}';
var LOGIN_URL = BASE_URL + '/login/email';
var CAPTCHA_URL = BASE_URL + '/captcha.gif?r=1503281572879&type=login&lang=cn';

var headers_base = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'Connection': 'keep-alive',
    //'Content-Length': '95',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    //'Cookie':null,
    //'Host': 'www.zhihu.com',
    //'Origin': 'https://www.zhihu.com',
    //'Referer': 'https://www.zhihu.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    //'X-Requested-With': 'XMLHttpRequest',
    //'X-Xsrftoken': null
    "authorization": 'Bearer Mi4xVzBTOUFBQUFBQUFBSUlMUENQUkFEQmNBQUFCaEFsVk5tRHpDV1FBWGhpRjNkME1JbTNFV2dvang5Q1RucHZ5Njl3|1503309720|429ec65864fb0946f465ab251e75c7b0ab94ed81'
};

var login_msg = {
    _xsrf: null,
    password: 'xxxx',
    captcha_type: 'cn',
    email: '990895247@qq.com',
};

var cookie = 'z_c0 = Mi4xVzBTOUFBQUFBQUFBSUlMUENQUkFEQmNBQUFCaEFsVk5tRHpDV1FBWGhpRjNkME1JbTNFV2dvang5Q1RucHZ5Njl3|1503309720|429ec65864fb0946f465ab251e75c7b0ab94ed81; Domain=zhihu.com; expires=2017-09-20T10:00:51.896Z; Path=/ '

var eventproxy = require('eventproxy'); //控制并发
var superagent = require('superagent'); //发送请求
var cheerio = require('cheerio'); //获取html内容
var Eventproxy = require('eventproxy');
var asyc = require('async');
var request = require('request');
var https = require('https');
var fs = require('fs');
var querystring = require('querystring');


var count = 0;



var user_info = {
    // 头像
    url:'',
    // 昵称
    name: '',
    // 性别
    gender: '',
    // 签名
    headline: '',
    // 回答问题数量
    answer_count: 0,
    // 文章数量
    articles_count: 0,
    // 关注者数量
    follower_count: 0,
    // 教育/职业/...

};



module.exports = {

    ep() {
        return new Eventproxy();
    },

    // 通过url获取整个网页
    getHtmlByUrl(url, callback) {

        superagent.get(url)
            .set(headers_base)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }
                callback(res);
            });

    },

    // 通过网页获取所要网址
    // 每个话题中的第1个评论
    // 一页有5个话题
    getPersonLink(data) {
        var $ = cheerio.load(data);
        var link = $('body').find('.author-link');
        var links = [];
        for (var i = 0; i < link.length; i++) {
            links[i] = link.eq(i).attr('href');
        }
        return links;
        //this.getHtmlByUrl(BASE_URL + link, (data)=>this.getDataByHtml(data));
    },


    // step 3 : 根据请求的html获取个人主页中的资料
    getUserInfoByHtml(data) {
        var $ = cheerio.load(data);

        user_info.name = $('.ProfileHeader-name').text();
        user_info.headline = $('.ProfileHeader-headline').text();

        user_info.url = $('meta[itemprop = url]').attr('content');
        user_info.gender  = $('meta[itemprop = gender]').attr('content');
        user_info.image = $('meta[itemprop = "image"]').prop('content');
        // 赞同
        user_info.voteup_count = $('meta[itemprop = "zhihu:voteupCount"]').attr('content');
        // 感谢
        user_info.thanked_count = $('meta[itemprop = "zhihu:thankedCount"]').attr('content');
        //
        user_info.follower_count = $('meta[itemprop = "zhihu:followerCount"]').attr('content');
        user_info.answer_count = $('meta[itemprop = "zhihu:answerCount"]').attr('content');
        user_info.articles_count = $('meta[itemprop = "zhihu:articlesCount"]').attr('content');



        var infoItems = $(".ProfileHeader-infoItem");
        if (infoItems.length) {
            for (var i = 0; i < infoItems.length; i++) {
                var key = infoItems.eq(i).children().children().attr('class').split('--')[1];
                var val = infoItems.eq(i).text();

                if (key == 'male' || key == 'female') continue;
                user_info[key] = val;
            }
        }
        //console.log(user_info);
        return user_info;


    },

    getApiUrl() {
        return BASE_URL + '/api/v4/members' + PEOPLE_URL + '/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=' + offsetNum + '&limit=' + limitNum;
        //return 'https://www.zhihu.com/api/v4/members/zhu-shu-shu-60/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=40&limit=20'
    },

    //step 5 : 根据api获取个人主页中所有'关注者'
    getDataByUrl(url,callback) {
        //  console.log(this.getApiUrl());
        // request(this.getApiUrl(),(err, res, body)=>{
        //     console.log(res.statusCode);
        //     console.log(body);
        // })
        superagent
            .get(url)
            .set(headers_base)
            .set('Cookies', cookie)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }

                callback(res.body);
                //console.log(res.body);
                // dbHelper.insertOne("people", res.body, (err, res)=> {
                //     if (err) return console.log(err);
                //     console.log(res.ops);
                // });
            })
    },

    setData () {

    },

    // 写入文件
    setFile(data, fileName) {
        fs.writeFile(__dirname + fileName, data, (err)=> {
            if (err) {
                return console.log(err);
            }
            console.log('写入成功!!')
        })
    },
    // 读取文件
    getFile() {

    },

    // 登录
    login() {


    },

    getXsrf() {
        this.getHtmlByUrl(LOGIN_URL, (html)=> {
            var $ = cheerio.load(html.text);
            login_msg._xsrf = $('input[name=_xsrf]').val();
            headers_base['X-Xsrftoken'] = $('input[name=_xsrf]').val();

            console.log($('script[data-name = ga_vars]'));
            console.log(login_msg._xsrf);
            // superagent
            //     .post(LOGIN_URL)
            //     .set(headers_base)
            //     .send(login_msg)
            //     .redirects(0)
            //     .end((err, res)=> {
            //         if (err) {
            //             return console.log(err);
            //         }
            //         var cookie = res.headers['set-cookie'];
            //         this.setFile(cookie, '/cookie.txt');
            //         //console.dir(cookie);
            //         console.log(res.body);
            //     })
        });
    },

    getLoginCookie() {

        this.getXsrf()

    },

    // 获取验证码
    getCaptcha() {
        https.get(CAPTCHA_URL, (res)=> {
            var imgData = '';
            res.setEncoding('binary');
            res.on('data', (chunk)=> {
                imgData += chunk;
            });
            res.on('end', ()=> {
                fs.writeFile(__dirname + '/captcha.gif', imgData, 'binary', (err)=> {
                    if (err) {
                        return console.log(err);
                    }
                    console.log('验证码下载成功!');
                })
            })
        });
    }
};




