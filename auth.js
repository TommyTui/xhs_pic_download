const crypto = require('crypto');

// 从 Docker 环境变量里读取 Token
// 如果没设置，默认为 null (这将导致所有请求都被拒绝，是一种安全失效保护)
const SERVER_TOKEN = process.env.API_TOKEN; 

const authMiddleware = (req, res, next) => {
    // 1. 获取 Header
    const authHeader = req.headers['authorization']; // Express 会自动转为小写

    if (!SERVER_TOKEN) {
        return res.status(500).json({ error: 'Server token misconfiguration' });
    }

    // 2. 检查格式是否为 "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed header' });
    }

    // 3. 提取 Token
    const clientToken = authHeader.split(' ')[1];

    // 4. 安全比较 (Constant-Time Comparison)
    // 简单的字符串比较 (===) 会因为比较长度不同而耗时不同，黑客可以据此猜解密码。
    // 使用 Buffer 比较是工程上的标准做法。
    try {
        const clientBuffer = Buffer.from(clientToken);
        const serverBuffer = Buffer.from(SERVER_TOKEN);

        // 只有长度相同且内容相同时才通过
        if (clientBuffer.length === serverBuffer.length && 
            crypto.timingSafeEqual(clientBuffer, serverBuffer)) {
            return next(); // 验证通过，放行！
        }
    } catch (e) {
        // Buffer 生成失败通常意味着输入非法，忽略即可
    }

    // 5. 验证失败
    console.log(`Authentication failed, IP: ${req.ip}`);
    return res.status(403).json({ error: 'Forbidden: Invalid Token' });
};

module.exports = authMiddleware;