const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');  // 添加这里

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/runcmd') {
        let body = '';
        
        // 接收POST请求的数据
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        // 数据接收完成后
        req.on('end', () => {
            // 解析JSON数据
            const requestData = JSON.parse(body);
            const command = requestData.command;

            // 执行命令
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    res.writeHead(500);
                    res.end(error.message);
                } else {
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Command executed successfully.');
                }
            });
        });
    } else if (req.method === 'GET' && req.url === '/filelist') {
        // 处理获取文件列表的请求
        const directory = './weights'; // 文件夹路径
        fs.readdir(directory, (err, files) => {
            if (err) {
                // 如果读取文件列表失败，返回500错误
                console.error('Error reading directory:', err);
                res.writeHead(500);
                res.end('Internal Server Error');
            } else {
                // 直接将文件列表发送到客户端
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(files));
            }
        });
    }else if (req.method === 'GET' && req.url.startsWith('/weights/')) {
        const filename = req.url.slice('/weights/'.length);  // 获取文件名
        const filePath = path.join('./weights', filename);  // 构造文件路径
    
        // 检查文件是否存在
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                console.error('File does not exist:', err);
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 设置响应头以触发文件下载
                res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': 'attachment; filename=' + encodeURIComponent(filename)
                });   
            // 创建一个读取流并将其管道到响应对象
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
          }
        });
    }else{
        // 读取静态文件
        let filePath = '.' + req.url; // 获取请求的URL路径

        // 如果请求的是根路径(/)，则默认加载index.html
        if (filePath === './') {
            filePath = './index.html';
        }

        // 读取文件
        fs.readFile(filePath, (err, content) => {
            if (err) {
                // 如果文件读取失败，返回404错误
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                // 设置响应头
                res.writeHead(200, { 'Content-Type': 'text/html' });
                // 发送文件内容作为响应
                res.end(content, 'utf-8');
            }
            if (filePath.endsWith('.css')) {
                contentType = 'text/css';
            } else if (filePath.endsWith('.js')) {
                contentType = 'application/javascript';
            }
        });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
