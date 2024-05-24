const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
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
            if (path.extname(filePath) === '.html') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
            } else if (path.extname(filePath) === '.css') {
                res.writeHead(200, { 'Content-Type': 'text/css' });
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
            }
            // 发送文件内容作为响应
            res.end(content, 'utf-8');
        }
    });
});

// 调试日志记录，确保请求被正确处理
server.on('request', (req, res) => {
    console.log('Request URL:', req.url);
    if (req.url === './log.log') {
        console.log('Handling /log.log request...');
        // 读取 log.log 文件
        fs.readFile('./log.log', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(data, 'utf-8');
            }
        });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
