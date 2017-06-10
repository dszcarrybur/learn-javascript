const assert = require('assert');

const hello = require('../hello');

describe('#async hello', () => {
    describe('#asyncCalculate()', () => {
        // function(done) {}
        it('#async with done', (done) => {//一般测试异步调用函数，需传入done参数，配合try-catch，如测试通过执行done（），测试不通过执行done（err）
            (async function () {///此处先是一个箭头函数，然后又包含一个匿名函数并同时立即执行该匿名函数，最后该匿名函数内还包含了一个async异步调用函数，并在其中使用try-catch
                try {
                    let r = await hello();
                    assert.strictEqual(r, 15);
                    done();
                } catch (err) {
                    done(err);
                }
            })();
        });

        it('#async function', async () => {//用同步函数测试方法来测试异步调用，用let r=await XX（），然后判断r
            let r = await hello();///此处先是一个async异步箭头函数，并同时在里面调用await；相比较一般同步函数测试方法，只在箭头函数前加了个async，在实际异步函数调用前加await
            assert.strictEqual(r, 15);
        });

        it('#sync function', () => {//一般同步函数调用方法
            assert(true);
        });
    });
});

