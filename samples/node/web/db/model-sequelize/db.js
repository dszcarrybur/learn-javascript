const Sequelize = require('sequelize');

const uuid = require('node-uuid');

const config = require('./config');

console.log('init sequelize...');
//UUID 的目的是让分布式系统中的所有元素，都能有唯一的辨识资讯，而不需要透过中央控制端来做辨识资讯的指定。
function generateId() {//如此一来，每个人都可以建立不与其它人冲突的 UUID。在这样的情况下，就不需考虑数据库建立时的名称重复问题。
    return uuid.v4();//v1 是基于时间戳生成uuid,v4是随机生成uuid
}//此处通过此种方式随机生成主键id值

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,//数据库服务名称
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {//针对类似email: {type: db.STRING(100),unique: true}的数据列
            value.allowNull = value.allowNull || false;//如上状态数据列将继承其allowNULL值，否则则直接设置为NULL，且避免为undefined
            attrs[key] = value;//前面添加完额外参数设置后，将其加入attrs参数list中，最后以attrs输出
        } else {
            attrs[key] = {//普通数据列直接设置为不允许为空
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {//所有数据列表统一添加数据列：主键id
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createdAt = {//所有数据列表统一添加数据列：createdAt
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updatedAt = {//所有数据列表统一添加数据列：updatedAt
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {//所有数据列表统一添加数据列：version
        type: Sequelize.BIGINT,
        allowNull: false
    };
    console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
        if (k === 'type') {
            for (let key in Sequelize) {
                if (key === 'ABSTRACT' || key === 'NUMBER') {
                    continue;
                }
                let dbType = Sequelize[key];
                if (typeof dbType === 'function') {
                    if (v instanceof dbType) {
                        if (v._length) {
                            return `${dbType.key}(${v._length})`;
                        }
                        return dbType.key;
                    }
                    if (v === dbType) {
                        return dbType.key;
                    }
                }
            }
        }
        return v;
    }, '  '));
    return sequelize.define(name, attrs, {//调用sequelize.define（数据表名，attrs之前处理过的各个参数，调用sequelize的参数设置）
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {//Sequelize在创建、修改Entity时会调用hook中指定的函数
                let now = Date.now();
                if (obj.isNewRecord) {//根据是否是isNewRecord设置主键（如果主键为null或undefined）、设置时间戳和版本号
                    console.log('will create entity...' + obj);
                    if (!obj.id) {//避免和数据库生成的ID冲突，假如是新数据生成主键id值，createdAt，updatedAt，version均赋值
                        obj.id = generateId();//随机生成UUID，并赋值为主键
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {///假如不是新增数据，则仅修改更新时间updatedAt为当前时间，并version加1
                    console.log('will update entity...');
                    obj.updatedAt = now;
                    obj.version++;
                }
            }
        }
    });
}
//指定的几种常见types类型
const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

var exp = {
    defineModel: defineModel,///即为module.exports.defineModel=defineModel，defineModel是一个函数
    sync: () => {///添加某同步函数，test环境中可能调用
        // only allow create ddl in non-production environment:仅在非生产环境中执行create dll操作，即是根据models新建数据库表
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true });//Sequelize提供的sync()方法，可以自动创建数据库，设置force为true，可能是指假如没有对应数据库，则强制生成一个合适的数据库表
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};
//TYPES在上面被定义，包括各种可能常用的Sequelize数据库存储类型，如其为范围之外可能出问题；且此处为models中name: db.STRING(100)这种用法的调用源头，将db.XX转化为Sequelize.XX
for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;//主键类型露出
exp.generateId = generateId;//将随机生成主键方法露出

module.exports = exp;

