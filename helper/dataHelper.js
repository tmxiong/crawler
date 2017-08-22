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
var page = 0; // 页数

var PEOPLE_URL = '';
var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = BASE_URL + '/node/ExploreAnswerListV2?params={offset:' + page + ',type:month}';
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
    'Host': 'www.zhihu.com',
    //'Origin': 'https://www.zhihu.com',
    //'Referer': 'https://www.zhihu.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    //'X-Requested-With': 'XMLHttpRequest',
    //'X-Xsrftoken': null
    "authorization":'Bearer Mi4xVzBTOUFBQUFBQUFBSUlMUENQUkFEQmNBQUFCaEFsVk5tRHpDV1FBWGhpRjNkME1JbTNFV2dvang5Q1RucHZ5Njl3|1503309720|429ec65864fb0946f465ab251e75c7b0ab94ed81'
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
module.exports = {

    ep() {
        return new Eventproxy();
    },

    // step 1 : 根据EXPLORE_URL,获取html
    getHtmlByUrl(url, callBack) {
        superagent.get(url)
            .set(headers_base)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }
                callBack(res);
            });
    },

    // step 2: 获取'发现'-->'今本月最热'显示的第一条话题的第一条评论的链接;
    // 初始状态显示10条话题
    getPersonLink(data) {
        var $ = cheerio.load(data.text);
        var link = $('.author-link').attr('href');
        this.getHtmlByUrl(BASE_URL + link, (data)=>this.getDataByHtml(data));
    },

    // step 3 : 根据请求的html获取个人主页中的资料
    getDataByHtml(data) {
        var $ = cheerio.load(data.text);
        var homeLink = $('meta[itemprop=url]').attr('content');
        var flowersLink = homeLink + '/flowers';
        PEOPLE_URL = homeLink.split('/people')[1];
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


        //step 4 : 获取个人主页中所有'关注者'
        this.getDataByUrl();

    },

    getApiUrl() {
        return BASE_URL + '/api/v4/members' + PEOPLE_URL + '/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=' + offsetNum + '&limit=' + limitNum;
        //return 'https://www.zhihu.com/api/v4/members/zhu-shu-shu-60/followers?include=data%5B*%5D.answer_count%2Carticles_count%2Cgender%2Cfollower_count%2Cis_followed%2Cis_following%2Cbadge%5B%3F(type%3Dbest_answerer)%5D.topics&offset=40&limit=20'
    },

    //step 5 : 根据api获取个人主页中所有'关注者'
    getDataByUrl() {
        //  console.log(this.getApiUrl());
        // request(this.getApiUrl(),(err, res, body)=>{
        //     console.log(res.statusCode);
        //     console.log(body);
        // })
        var apiUrl = this.getApiUrl();

        superagent
            .get(apiUrl)
            .set(headers_base)
            .set('Cookies', cookie)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }

                console.log(res.body);
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




