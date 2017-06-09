const products = require('../products');///此处作为service服务存在

const APIError = require('../rest').APIError;

module.exports = {
    'GET /api/products': async (ctx, next) => {
        ctx.rest({///rest为反馈数据的方法，其输入参数只为要给客户端的数据
            products: products.getProducts()
        });
    },

    'POST /api/products': async (ctx, next) => {
        var p = products.createProduct(ctx.request.body.name, ctx.request.body.manufacturer, parseFloat(ctx.request.body.price));
        ctx.rest(p);
    },

    'DELETE /api/products/:id': async (ctx, next) => {///其中/api/products/:id的id变量值，获取形式为“:id”，获取通过ctx.params.id，一个url中可以有多个类似“:id”的存在
        console.log(`delete product ${ctx.params.id}...`);
        var p = products.deleteProduct(ctx.params.id);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('product:not_found', 'product not found by id.');///错误时主动报错错误及提供错误类型和代码
        }
    }
};
