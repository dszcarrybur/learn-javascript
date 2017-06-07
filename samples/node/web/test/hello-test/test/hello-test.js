const assert = require('assert');

const sum = require('../hello');

describe('#hello.js', () => {//describe即为mocha的函数，此次默认导入了mocha模块，所有test脚步均默认放在test文件目录下，其会默认执行该目录的测试脚本
// 其describe的第一个参数是为了将各个用例以树的形式组织起来
    describe('#sum()', () => {
        before(function () {
            console.log('before:');///标注执行顺序father-before>son-describe>son-before>father-beforeEach>son-beforeEach,即同类型标注父节点描述包围子节点的，即before更早，after更晚
        });

        after(function () {
            console.log('after.');
        });

        beforeEach(function () {
            console.log('  beforeEach:');
        });

        afterEach(function () {
            console.log('  afterEach.');
        });

        it('sum() should return 0', () => {
            assert.strictEqual(sum(), 0);//直接调用node自带的判断库assert模块
        });

        it('sum(1) should return 1', () => {
            assert.strictEqual(sum(1), 1);
        });

        it('sum(1, 2) should return 3', () => {
            assert.strictEqual(sum(1, 2), 3);
        });

        it('sum(1, 2, 3) should return 6', () => {
            assert.strictEqual(sum(1, 2, 3), 6);
        });
    });
});
