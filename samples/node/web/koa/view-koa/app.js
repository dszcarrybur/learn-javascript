const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const app = new Koa();

const isProduction = process.env.NODE_ENV === 'production';
//获取开始时间截止时间及url
// log request URL:打印开始时间
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

// static file support:将bootstrap的static文件导入
if (! isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// parse request body:解析post请求中的参数
app.use(bodyParser());

// add nunjucks as view:导入nunjunk，及添加render（view，model）函数
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

// add controller:添加controllers--middleware
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');

