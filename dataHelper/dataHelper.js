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


var BASE_URL = 'https://www.zhihu.com';
var EXPLORE_URL = '/explore#monthly-hot';

var eventproxy = require('eventproxy'); //控制并发
var superagent = require('superagent'); //发送请求
var cheerio = require('cheerio'); //获取html内容
var Eventproxy = require('eventproxy');

var count = 0;
module.exports = {

    ep() {
        return new Eventproxy();
    },

    // step 1 : 根据EXPLORE_URL,获取html
    getHtml(url,fn) {
        superagent.get(url)
            .end((err, res)=> {
                if (err) {
                    return console.log(err);
                }
                $ = cheerio.load(res.text);
                fn($);
            });
    },

    // step 2: 获取'发现'-->'今本月最热'显示的第一条话题的第一条评论的链接;
    // 初始状态显示10条话题
    getMonthlyLink($) {
        var tabPanel = $('.tab-panel').eq(1); // 0 为'今日最热', 1 为 '本月最热'
        var links = $(tabPanel).find('.author-link');
        var link = links.eq(count).attr('href');
        //console.log(link);
        this.getHtml(BASE_URL + link, ($)=>this.getData($));

    },

    // step 3 : 获取个人主页中的资料
    getData($) {
        var link = BASE_URL + $(".Tabs-link").attr('href').split('/').splice(0,3).join('/');
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
        console.log('主页:' + link);

        console.log('-----------------------------------------------------');
        console.log('-----------------------------------------------------');

        if(parseInt(flowers) == 0) return;

        var flowersLink = link + '/followers';
        console.log(flowersLink);
        //step 4 : 获取个人主页中'关注者' 的页面
        this.getHtml(flowersLink,($)=>this.getUserLink($));
    },

    //step 5 : 获取个人主页中'关注者' 中的第一位关注者的链接
    getUserLink($) {
        var links = $('.UserLink-link');
        console.log(links.length);
        //var link = links.eq(0).attr('href');
        // step 6: 回到第一步;
        //this.getHtml(BASE_URL + link, ($)=>this.getData($));
    },

    setData () {

    },
};




