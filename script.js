const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- 游戏参数 ---
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// 1. 玩家挡板 (Paddle)
const paddle = {
    height: 10,
    width: 75,
    x: (canvasWidth - 75) / 2, // 初始居中位置
    y: canvasHeight - 15,
    dx: 7, // 移动速度
    isMovingLeft: false,
    isMovingRight: false
};

// 2. 弹球 (Ball)
const ball = {
    radius: 5,
    x: canvasWidth / 2,
    y: canvasHeight - 25,
    dx: 2, // X 方向速度
    dy: -2 // Y 方向速度 (向上)
};

// 3. 砖块 (Bricks)
const brickInfo = {
    rowCount: 3,
    columnCount: 5,
    width: 70,
    height: 20,
    padding: 10,
    offsetTop: 30,
    offsetLeft: 30,
    visible: true
};

const bricks = [];
// 创建砖块矩阵
for (let c = 0; c < brickInfo.columnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickInfo.rowCount; r++) {
        const x = c * (brickInfo.width + brickInfo.padding) + brickInfo.offsetLeft;
        const y = r * (brickInfo.height + brickInfo.padding) + brickInfo.offsetTop;
        bricks[c][r] = { x, y, ...brickInfo };
    }
}

// --- 绘图函数 ---

// 绘制挡板
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.fillStyle = '#c0392b'; // 红色
    ctx.fill();
    ctx.closePath();
}

// 绘制弹球
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#2980b9'; // 蓝色
    ctx.fill();
    ctx.closePath();
}

// 绘制所有砖块
function drawBricks() {
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.width, brick.height);
                ctx.fillStyle = '#27ae60'; // 绿色
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// --- 游戏逻辑函数 ---

// 1. 移动挡板
function movePaddle() {
    if (paddle.isMovingRight && paddle.x + paddle.width < canvasWidth) {
        paddle.x += paddle.dx;
    } else if (paddle.isMovingLeft && paddle.x > 0) {
        paddle.x -= paddle.dx;
    }
}

// 2. 移动弹球并检测边界
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // 碰撞墙壁 (左右)
    if (ball.x + ball.dx > canvasWidth - ball.radius || ball.x + ball.dx < ball.radius) {
        ball.dx = -ball.dx;
    }

    // 碰撞墙壁 (顶部)
    if (ball.y + ball.dy < ball.radius) {
        ball.dy = -ball.dy;
    }

    // 碰撞底部 (游戏结束)
    if (ball.y + ball.dy > canvasHeight - ball.radius) {
        // 游戏结束逻辑：可以显示分数或重置游戏
        alert("游戏结束！");
        document.location.reload(); // 简单地刷新页面
    }

    // 碰撞挡板
    if (
        ball.y + ball.radius > paddle.y && // 球到达挡板高度
        ball.x > paddle.x && // 球在挡板左边界内
        ball.x < paddle.x + paddle.width // 球在挡板右边界内
    ) {
        ball.dy = -ball.dy; // 反转Y方向
    }
}

// 3. 弹球与砖块碰撞检测
function brickCollisionDetection() {
    for (let c = 0; c < brickInfo.columnCount; c++) {
        for (let r = 0; r < brickInfo.rowCount; r++) {
            const brick = bricks[c][r];
            if (brick.visible) {
                // AABB 碰撞检测 (Axis-Aligned Bounding Box)
                if (
                    ball.x + ball.radius > brick.x && // 球右侧 > 砖块左侧
                    ball.x - ball.radius < brick.x + brick.width && // 球左侧 < 砖块右侧
                    ball.y + ball.radius > brick.y && // 球底侧 > 砖块顶侧
                    ball.y - ball.radius < brick.y + brick.height // 球顶侧 < 砖块底侧
                ) {
                    ball.dy = -ball.dy; // 反转Y方向
                    brick.visible = false; // 砖块消失
                }
            }
        }
    }
}

// --- 事件监听 (键盘控制) ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.isMovingRight = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.isMovingLeft = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        paddle.isMovingRight = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        paddle.isMovingLeft = false;
    }
});


// --- 主游戏循环 ---
function draw() {
    // 1. 清除画布，准备下一帧
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 2. 绘制所有元素
    drawBricks();
    drawPaddle();
    drawBall();

    // 3. 更新游戏状态
    movePaddle();
    moveBall();
    brickCollisionDetection();

    // 请求浏览器在下一次重绘时调用 draw 函数 (实现循环动画)
    requestAnimationFrame(draw);
}

// 启动游戏
draw();
