const path = require('path');
const mime = require('mime');
const fs = require('mz/fs');

function staticFiles(url, dir) {
    return async (ctx, next) => {
        let rpath = ctx.request.path;
        if (rpath.startsWith(url)) {///如其url是以对应static文件路径开始则执行如下逻辑
            let fp = path.join(dir, rpath.substring(url.length));
            if (await fs.exists(fp)) {
                ctx.response.type = mime.lookup(rpath);
                ctx.response.body = await fs.readFile(fp);
            } else {
                ctx.response.status = 404;
            }
        } else {///如不满足，则直接执行后面的middleware，如此类型如不希望该url请求在此处停止的情况下，均需执行await next();
            await next();
        }
    };
}

module.exports = staticFiles;
