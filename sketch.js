let objs = [];
let colors = ['#cdb4db', '#ffafcc', '#a2d2ff', '#edede9'];
let menu; // 宣告 Menu 物件
let iframeOverlay = null; // 新增：iframe overlay 管理變數

function setup() {
    // 全螢幕設定
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    objs.push(new DynamicShape());
    
    // 設定中央文字的字體大小
    textSize(width * 0.04); // 中央文字放大為 4%
    textAlign(CENTER, CENTER); 
    
    // 初始化 Menu 物件
    menu = new Menu(0.08); // 傳入選單寬度比例 (8%)
}

// 處理視窗大小改變，確保全螢幕
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // 調整中央文字的字體大小以適應新的畫布尺寸
    textSize(width * 0.04);
    
    // 更新選單大小
    menu.resize(0.08);

    // 如果 iframe overlay 存在，確保它仍維持 70% / 85% 的視窗大小與置中
    if (iframeOverlay) {
        // 使用百分比樣式，所以瀏覽器會自動處理大小；若要精確設定像素可改寫下列程式碼
        iframeOverlay.style.left = '15%';
        iframeOverlay.style.top = '7.5%';
        iframeOverlay.style.width = '70%';
        iframeOverlay.style.height = '85%';
    }
}

function draw() {
    background('#fefae0');
    
    // 檢查滑鼠是否在畫布的左半邊
    if (mouseX < width / 2) {
        menu.show = true;
    } else {
        menu.show = false;
    }

    // 運行動畫物件 (這一部分獨立於選單狀態，確保動畫連續)
    for (let i of objs) {
        i.run();
    }

    if (frameCount % int(random([15, 30])) == 0) {
        let addNum = int(random(1, 30));
        for (let i = 0; i < addNum; i++) {
            objs.push(new DynamicShape());
        }
    }
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }
    
    // 繪製螢幕中間的字幕，固定在 width / 2 (絕對中央)
    fill('#52796f'); 
    text("您好我是教科一B 119180洪千涵", width / 2, height / 2);

    // 繪製選單 (必須在最後繪製，才會在最上層)
    menu.run();
}

// --- UPDATED FUNCTION: 處理滑鼠點擊 (符合新的 4 個選項) ---
function mousePressed() {
    // 只有當選單可見時才檢查點擊
    if (menu.show) {
        
        if (menu.isHovering(1)) {
            // 第一單元作品
            createIframeOverlay("https://hungyun3866-code.github.io/202511101/");
        } else if (menu.isHovering(2)) {
            // 第一單元講義（HackMD）
            createIframeOverlay("https://hackmd.io/@UGU0h5ZNRIeUfO-h9Y3q1Q/rkMFw7Ailx");
        } else if (menu.isHovering(3)) {
            // 測驗系統 (已更新為新的網址)
            createIframeOverlay("https://hungyun3866-code.github.io/20251117/");
        } else if (menu.isHovering(4)) {
            // 回到首頁：關閉 iframe 並回到全螢幕視窗
            removeIframeOverlay();
            goFullscreen();
            menu.show = false;
        }
    }
}
// --- END UPDATED FUNCTION ---


function easeInOutExpo(x) {
    return x === 0 ? 0 :
        x === 1 ?
        1 :
        x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 :
        (2 - Math.pow(2, -20 * x + 10)) / 2;
}

class DynamicShape {
    constructor() {
        // 確保初始位置不在中央區域
        const centerMargin = 0.3; // 30% 邊緣區
        const availableRangesX = [
            { min: 0, max: centerMargin },          // 左側 0% - 30%
            { min: 1 - centerMargin, max: 1 }      // 右側 70% - 100%
        ];
        const availableRangesY = [
            { min: 0, max: centerMargin },          // 上側 0% - 30%
            { min: 1 - centerMargin, max: 1 }      // 下側 70% - 100%
        ];

        let rangeX = random(availableRangesX);
        let rangeY = random(availableRangesY);

        this.x = random(rangeX.min, rangeX.max) * width;
        this.y = random(rangeY.min, rangeY.max) * height;

        
        this.reductionRatio = 1;
        this.shapeType = int(random(4));
        this.animationType = 0;
        this.maxActionPoints = int(random(2, 5));
        this.actionPoints = this.maxActionPoints;
        this.elapsedT = 0;
        this.size = 0;
        this.sizeMax = (width + height) / 2 * random(0.01, 0.035); 
        this.fromSize = 0;
        this.init();
        this.isDead = false;
        this.clr = random(colors);
        this.changeShape = true;
        this.ang = int(random(2)) * PI * 0.25;
        this.lineSW = 0;

        this.isCircle = this.shapeType < 2; 
        if (this.isCircle) {
            this.floatAngle = random(TWO_PI); 
            this.floatSpeed = this.sizeMax * random(0.01, 0.05); 
            this.driftOffsetX = random(1000); 
            this.driftOffsetY = random(1000); 
        }
    }

    show() {
        push();
        translate(this.x, this.y);
        if (this.animationType == 1) scale(1, this.reductionRatio);
        if (this.animationType == 2) scale(this.reductionRatio, 1);
        fill(this.clr);
        stroke(this.clr);
        strokeWeight(this.size * 0.05);
        
        if (this.shapeType == 0) {
            noStroke();
            circle(0, 0, this.size);
        } else if (this.shapeType == 1) {
            noFill();
            circle(0, 0, this.size);
        } 
        else if (this.shapeType == 2) {
            noStroke();
            rect(0, 0, this.size, this.size);
        } else if (this.shapeType == 3) {
            noFill();
            rect(0, 0, this.size * 0.9, this.size * 0.9);
        } else if (this.shapeType == 4) {
            line(0, -this.size * 0.45, 0, this.size * 0.45);
            line(-this.size * 0.45, 0, this.size * 0.45, 0);
        }
        pop();
        strokeWeight(this.lineSW);
        stroke(this.clr);
        line(this.x, this.y, this.fromX, this.fromY);
    }

    move() {
        if (this.isCircle) {
            this.x += cos(this.floatAngle) * this.floatSpeed * noise(this.driftOffsetX) * 0.5;
            this.y += sin(this.floatAngle) * this.floatSpeed * noise(this.driftOffsetY) * 0.5;
            
            this.floatAngle += map(noise(this.driftOffsetX + frameCount * 0.005), 0, 1, -0.1, 0.1);

            this.size = this.sizeMax * (0.8 + 0.2 * sin(frameCount * 0.05));

            this.driftOffsetX += 0.001;
            this.driftOffsetY += 0.001;

            if (this.x < -this.sizeMax || this.x > width + this.sizeMax || 
                this.y < -this.sizeMax || this.y > height + this.sizeMax) {
                this.isDead = true; 
            }
            
            this.elapsedT++;
            if (this.elapsedT > this.duration * 4) {
                this.isDead = true;
            }
            return; 
        }

        let n = easeInOutExpo(norm(this.elapsedT, 0, this.duration));
        if (0 < this.elapsedT && this.elapsedT < this.duration) {
            if (this.actionPoints == this.maxActionPoints) {
                this.size = lerp(0, this.sizeMax, n);
            } else if (this.actionPoints > 0) {
                if (this.animationType == 0) {
                    this.size = lerp(this.fromSize, this.toSize, n);
                } 
                else if (this.animationType == 1) {
                    this.x = lerp(this.fromX, this.toX, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } else if (this.animationType == 2) {
                    this.y = lerp(this.fromY, this.toY, n);
                    this.lineSW = lerp(0, this.size / 5, sin(n * PI));
                } 
                else if (this.animationType == 3) {
                    if (this.changeShape == true) {
                        this.shapeType = int(random(5));
                        this.changeShape = false;
                    }
                }
                this.reductionRatio = lerp(1, 0.3, sin(n * PI));
            } else {
                this.size = lerp(this.fromSize, 0, n);
            }
        }

        this.elapsedT++;
        if (this.elapsedT > this.duration) {
            this.actionPoints--;
            this.init();
        }
        if (this.actionPoints < 0) {
            this.isDead = true;
        }
    }

    run() {
        this.show();
        this.move();
    }

    init() {
        this.elapsedT = 0;
        this.fromSize = this.size;
        this.toSize = this.sizeMax * random(0.5, 1.5);
        this.fromX = this.x;
        this.toX = this.fromX + (width / 10) * random([-1, 1]) * int(random(1, 4));
        this.fromY = this.y;
        this.toY = this.fromY + (height / 10) * random([-1, 1]) * int(random(1, 4));
        this.animationType = int(random(3));
        
        if (this.isCircle) {
            this.duration = random(50, 100); 
        } else {
            this.duration = random(60, 100); 
        }
    }
}

// --- MODIFIED CLASS: Menu ---
class Menu {
    constructor(widthRatio) {
        this.show = false; 
        this.w = width * widthRatio; // 選單寬度 (8% 畫布寬度)
        this.h = height * 0.9; // 選單高度 (90% 畫布高度)
        this.padding = 10; 
        this.targetX = 0; // 顯示時的 X 座標 (緊貼左邊緣)
        this.hiddenX = -this.w; // 隱藏時的 X 座標
        this.currentX = this.hiddenX; 
        this.y = height * 0.05; // 讓選單垂直置中 (100% - 90%) / 2 = 5%
        this.easing = 0.1; 
    }
    
    // 處理視窗大小改變
    resize(widthRatio) {
        this.w = width * widthRatio;
        this.h = height * 0.9;
        this.hiddenX = -this.w;
        this.y = height * 0.05;
        // 如果選單是收起來的，需更新收起來的位置
        if (!this.show) {
            this.currentX = this.hiddenX;
        }
    }

    // 檢查滑鼠是否懸停在指定的選項上 (itemIndex: 1, 2, 3, or 4)
    isHovering(itemIndex) {
        if (!this.show || this.currentX < this.hiddenX + 1) return false; 

        let startX = this.currentX;
        let endX = this.currentX + this.w;
        
        let lineHeight = this.h / (Menu.getLabels().length + 2);
        
        // 1 for 第一單元作品, 2 for 第一單元講義, 3 for 測驗系統, 4 for 回到首頁
        let startY = this.y + this.padding * 4 + (itemIndex - 1) * lineHeight;
        let endY = startY + lineHeight;
        
        // 調整結束位置，讓點擊區域略大於文字（更使用者友善）
        if (itemIndex === Menu.getLabels().length) {
            endY = this.y + this.h - this.padding * 2; 
        }
        
        return mouseX > startX && mouseX < endX && mouseY > startY && mouseY < endY;
    }
    
    // 靜態方法來獲取選單標籤 (避免重複定義)
    static getLabels() {
        return ["第一單元作品", "第一單元講義", "測驗系統", "回到首頁"];
    }

    run() {
        let desiredX = this.show ? this.targetX : this.hiddenX;
        
        // FIX: 修正 lerp 卡住問題
        if (abs(this.currentX - desiredX) < 0.1) { 
            this.currentX = desiredX;
        } else {
            this.currentX = lerp(this.currentX, desiredX, this.easing);
        }

        this.drawBackground();
        // 只有當選單展開時才繪製選項 
        if (this.currentX > this.hiddenX + 1) { 
            this.drawItems();
        }
    }

    drawBackground() {
        push();
        // 選單顏色為 f9f7f3，半透明 (alpha 設為 200/255)
        fill(249, 247, 243, 200); 
        noStroke();
        
        // 繪製選單背景矩形
        rectMode(CORNER); 
        rect(this.currentX, this.y, this.w, this.h, 5); // 圓角 5

        pop();
    }

    drawItems() {
        push();
        let labels = Menu.getLabels();

        // 使用一般灰色
        fill(100);
        textAlign(CENTER, TOP);
        textStyle(NORMAL); // 確保文字不是粗體

        // 可用寬度（左右保留 padding）
        let maxTextWidth = this.w - this.padding * 2;

        // 從一個合理的字體大小開始，逐步減小直到所有文字都能放入 maxTextWidth 或達到最小字體
        let ts = int(this.w * 0.12); // 初始字體大小
        let minTs = 8;
        let fits = false;
        while (!fits && ts >= minTs) {
            textSize(ts);
            fits = true;
            for (let t of labels) {
                if (textWidth(t) > maxTextWidth) {
                    fits = false;
                    break;
                }
            }
            if (!fits) ts--;
        }
        textSize(max(ts, minTs));

        // 置中繪製，並計算垂直間距
        let startX = this.currentX + this.w / 2;
        let startY = this.y + this.padding * 4;
        let lineHeight = this.h / (labels.length + 2); // 4個選項 + 2個額外間距

        for (let i = 0; i < labels.length; i++) {
            // 每次都確保文字樣式為正常（不粗體）
            textStyle(NORMAL);
            fill(100); // 一般灰色
            
            // 繪製文字
            text(labels[i], startX, startY + i * lineHeight);
            
            // 檢查滑鼠是否懸停在這個選項上
            let isHovering = this.isHovering(i + 1);
            
            // 如果滑鼠懸停，繪製底線
            if (isHovering) {
                stroke(100); // 灰色底線
                strokeWeight(2);
                let textW = textWidth(labels[i]);
                let underlineY = startY + i * lineHeight + textSize() + 5;
                line(startX - textW / 2, underlineY, startX + textW / 2, underlineY);
            }
        }
        pop();
    }
}
// --- END MODIFIED CLASS ---

// 新增：建立 iframe overlay 的函式與關閉函式
function createIframeOverlay(url) {
    if (iframeOverlay) {
        const existingIframe = iframeOverlay.querySelector('iframe');
        if (existingIframe) existingIframe.src = url;
        return;
    }

    iframeOverlay = document.createElement('div');
    iframeOverlay.id = 'iframeOverlay';
    Object.assign(iframeOverlay.style, {
        position: 'fixed',
        left: '15%',
        top: '7.5%',
        width: '70%',
        height: '85%',
        zIndex: 10000,
        background: '#ffffff',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch'
    });

    const msgPanel = document.createElement('div');
    msgPanel.style.position = 'absolute';
    msgPanel.style.left = '0';
    msgPanel.style.top = '0';
    msgPanel.style.width = '100%';
    msgPanel.style.height = '100%';
    msgPanel.style.display = 'flex';
    msgPanel.style.flexDirection = 'column';
    msgPanel.style.alignItems = 'center';
    msgPanel.style.justifyContent = 'center';
    msgPanel.style.background = 'rgba(255,255,255,0.95)';
    msgPanel.style.zIndex = '10002';

    const loader = document.createElement('div');
    loader.textContent = '載入中，請稍候...';
    loader.style.marginBottom = '12px';
    loader.style.color = '#333';
    msgPanel.appendChild(loader);

    const openBtn = document.createElement('button');
    openBtn.textContent = '在新分頁開啟此頁面';
    Object.assign(openBtn.style, {
        display: 'none',
        padding: '8px 12px',
        borderRadius: '4px',
        border: 'none',
        background: '#1f6feb',
        color: '#fff',
        cursor: 'pointer'
    });
    openBtn.onclick = () => window.open(url, '_blank');
    msgPanel.appendChild(openBtn);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = '0';
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('referrerpolicy', 'no-referrer');

    // 嘗試載入 iframe；若在 3 秒內沒有載入，視為被阻擋，直接在新分頁開啟（可改為顯示按鈕）
    let loaded = false;
    const t = setTimeout(() => {
        if (!loaded) {
            // 若你想自動開新分頁，取消下行註解：
            // window.open(url, '_blank'); removeIframeOverlay(); return;

            // 目前採用顯示提示與按鈕的方式（不自動導走使用者）
            loader.textContent = '此頁面可能不允許被嵌入（iframe 被阻擋）。';
            openBtn.style.display = 'inline-block';
        }
    }, 3000);
    iframe.onload = () => {
        loaded = true;
        clearTimeout(t);
        msgPanel.style.display = 'none';
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '關閉';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        right: '10px',
        top: '10px',
        zIndex: 10003,
        padding: '6px 10px',
        background: '#333',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        opacity: '0.9'
    });
    closeBtn.onclick = removeIframeOverlay;

    iframeOverlay.appendChild(iframe);
    iframeOverlay.appendChild(msgPanel);
    iframeOverlay.appendChild(closeBtn);
    document.body.appendChild(iframeOverlay);
}

function removeIframeOverlay() {
    if (!iframeOverlay) return;
    iframeOverlay.remove();
    iframeOverlay = null;
}

// 新增：在使用者點擊時進入全螢幕（支援 vendor 前綴）
function goFullscreen() {
    const el = document.querySelector('canvas') || document.documentElement;
    if (!el) return;
    if (el.requestFullscreen) {
        el.requestFullscreen().catch(()=>{});
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }
}