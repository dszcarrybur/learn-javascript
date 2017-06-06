const Sequelize = require('sequelize');

const config = require('./config');

console.log('init sequelize...');
//连接数据库，创建一个sequelize对象实例，并设置连接pool
var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});
//新建可操作module对象：Pet，将其与数据库表pet相连，并指出映射方式;
var Pet = sequelize.define('pet', {//define第一个参数为数据库表名，第二参数为pet对应列的定义及设定，其中参数名需与数据库列名保持一致，第三列为sequelize配置参数
    id: {
        type: Sequelize.STRING(50),
        primaryKey: true//id设为主键
    },
    name: Sequelize.STRING(100),
    gender: Sequelize.BOOLEAN,
    birth: Sequelize.STRING(10),
    createdAt: Sequelize.BIGINT,
    updatedAt: Sequelize.BIGINT,
    version: Sequelize.BIGINT
}, {
        timestamps: false//关闭Sequelize的自动添加timestamp的功能
    });

var now = Date.now();

Pet.create({//使用promise函数的方式添加pet数据，通过create新建数据列
    id: 'g-' + now,
    name: 'Gaffey',
    gender: false,
    birth: '2007-07-07',
    createdAt: now,
    updatedAt: now,
    version: 0
}).then(function (p) {
    console.log('created.' + JSON.stringify(p));//JSON.stringify是将一个JavaScript值转换为一个JSON字符串,
}).catch(function (err) {
    console.log('failed: ' + err);
});
//使用最新异步调用的方式async及await，来实现异步存储及新建数据列
(async () => {
    var dog = await Pet.create({
        id: 'd-' + now,
        name: 'Odie',
        gender: false,
        birth: '2008-08-08',
        createdAt: now,
        updatedAt: now,
        version: 0
    });
    console.log('created: ' + JSON.stringify(dog));//新建成功则进行该输出
})();
//异步查询name='Gaffey'的数据列表并存入Pets
(async () => {
    var pets = await Pet.findAll({
        where: {
            name: 'Gaffey'
        }
    });
    console.log(`find ${pets.length} pets:`);
    for (let p of pets) {
        console.log(JSON.stringify(p));
        console.log('update pet...');
        p.gender = true;
        p.updatedAt = Date.now();
        p.version ++;
        await p.save();//存储，对pets中数据列分别改值并异步存储至数据库
        if (p.version === 3) {
            await p.destroy();//删除，version===3时删除该数据列
            console.log(`${p.name} was destroyed.`);
        }
    }
})();
