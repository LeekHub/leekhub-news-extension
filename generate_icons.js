const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// 定义图标尺寸
const sizes = [16, 48, 128];

// 创建图标的函数
async function generateIcon(sourceImage, size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // 绘制图像并保持宽高比
    ctx.drawImage(sourceImage, 0, 0, size, size);

    return canvas;
}

// 确保 images 目录存在
if (!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
}

// 生成所有尺寸的图标
async function generateAllIcons() {
    try {
        const sourceImage = await loadImage('./images/LeekHub.png');

        for (const size of sizes) {
            const canvas = await generateIcon(sourceImage, size);
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(`./images/icon${size}.png`, buffer);
            console.log(`Generated icon${size}.png`);
        }
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

// 执行生成
generateAllIcons(); 