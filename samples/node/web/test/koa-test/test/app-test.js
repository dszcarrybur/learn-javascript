const
    request = require('supertest'),///调用supertest库，用于验证返回的http数据是否符合需求
    app = require('../app');///用于导入koa请求处理函数

describe('#test koa app', () => {

    let server = app.listen(9900);///让服务运行在9900端口，并在该端口执行服务器返回逻辑测试

    describe('#test server', () => {

        it('#test GET /', async () => {
            let res = await request(server)///异步给server发出请求，等待返回结果并验证返回结果是否符合预期,此处后面函数均为链式调用，即要求如下几个条件需同时满足
                .get('/')///发出get请求，url为‘/’
                .expect('Content-Type', /text\/html/)///使用expect判断断言，使用正则表达式判断返回的Content-Type参数值是否符合预期
                .expect(200, '<h1>Hello, world!</h1>');//判断返回值是否成功为200，及返回的body内容。
        });

        it('#test GET /path?name=Bob', async () => {
            let res = await request(server)
                .get('/path?name=Bob')
                .expect('Content-Type', /text\/html/)
                .expect(200, '<h1>Hello, Bob!</h1>');
        });
    });
});

