module.exports = {
    APIError: function (code, message) {///统一报错规范，所有均调用new APIError(code, message)；来表明报错信息
        this.code = code || 'internal:unknown_error';///所有报错码使用英文，且使用（父类型：子类型）的格式表达
        this.message = message || '';
    },
    restify: (pathPrefix) => {
        pathPrefix = pathPrefix || '/api/';//防止pathPrefix为空
        return async (ctx, next) => {////此处return async（），即为类似于在app.js中添加app.use（async (ctx, next)），这样一个url处理函数
            if (ctx.request.path.startsWith(pathPrefix)) {////保证获取的url以/api/开头
                console.log(`Process API ${ctx.request.method} ${ctx.request.url}...`);
                ctx.rest = (data) => {///给ctx附给方法rest（data），所以的data数据反馈均会同时赋值type为'application/json'的
                    ctx.response.type = 'application/json';
                    ctx.response.body = data;
                }
                try {
                    await next();///执行后续其他controllers，如果执行出错及报错信息一层层上报此此处，然后在catch中统一填写报错信息
                } catch (e) {
                    console.log('Process API error...');
                    ctx.response.status = 400;///表示客户端请求的语法错误，服务器无法理解
                    ctx.response.type = 'application/json';
                    ctx.response.body = {
                        code: e.code || 'internal:unknown_error',///返回APIError（）中赋给的错误类型编码code及相关具体报错信息
                        message: e.message || ''
                    };
                }
            } else {
                await next();///如果url不是以pathPrefix为开头，即不是api请求，则跳过执行后续middleware
            }
        };
    }
};
