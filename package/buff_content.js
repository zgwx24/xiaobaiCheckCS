
(function() {
    'use strict';
// 获取当前 URL 判断是什么页面
const currentUrl = window.location.href;
const isInventory = currentUrl.includes('steam_inventory');
const isBookmark = currentUrl.includes('bookmark');
// 市场页：包含 market 或 goods，且【不能】包含 steam_inventory
const isMarket = (currentUrl.includes('market') || currentUrl.includes('goods')) && !isInventory;

// 从存储中读取设置
chrome.storage.local.get(['siteSettings'], (result) => {
    // 读取 BUFF 的设置，如果没有则默认全部开启
    const settings = result.siteSettings?.buff || { market: true, inventory: true, bookmark: true };

    // 判断当前页面是否被用户关闭了注入
    if (isMarket && !settings.market) return; // 用户关了市场，直接退出
    if (isInventory && !settings.inventory) return; // 用户关了库存，直接退出
    if (isBookmark && !settings.bookmark) return; // 用户关了收藏，直接退出

 

    // 1. 自动重定向到价格排序 (仅限库存页)
    if (window.location.href.includes('steam_inventory') && !window.location.hash.includes('sort_by=price.desc')) {
        let h = window.location.hash || "#page_num=1&page_size=50";
        h = h.includes('sort_by=') ? h.replace(/sort_by=[^&]+/, 'sort_by=price.desc') : h + "&sort_by=price.desc";
        window.location.hash = h;
        window.location.reload();
    }
    function processItems() {
        const url = window.location.href;
        const isInventory = url.includes('steam_inventory');
        const isBookmark = url.includes('bookmark');

        // 扩展选择器以包含收藏页面的 tr.bookmark_order
        const selector = isInventory ? 'li[data-asset-info]:not([data-cmd-ok])' :
                         isBookmark ? 'tr.bookmark_order:not([data-cmd-ok])' :
                         'tr.selling:not([data-cmd-ok])';

        const items = document.querySelectorAll(selector);
        if (items.length === 0) return;

        items.forEach(el => {
            el.setAttribute('data-cmd-ok', '1');
            try {
                // 收藏页面的 asset-info 通常在购买按钮上
                const buyBtn = el.querySelector('a.i_Btn, a.btn-buy-no-pay, .btn-buy-order');
                const assetStr = el.getAttribute('data-asset-info') || (buyBtn ? buyBtn.getAttribute('data-asset-info') : null);
                const rawName = (buyBtn && buyBtn.getAttribute('data-goods-name')) || el.querySelector('h3, .name-cont h3')?.innerText.trim();

                if (!assetStr || !rawName) return;

                const asset = JSON.parse(assetStr);
                const info = asset.info || {};
                const float = parseFloat(asset.paintwear || "0.0001").toFixed(18);
                const paint = info.paintindex || 0;
                const seed = info.paintseed || 0;
                let cmd = "";

                const baseType = rawName.split('|')[0].replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, '');
                const cleanFullName = rawName.replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, '');

                if (typeof gloveMap !== 'undefined' && gloveMap[baseType]) {
                    cmd = `sm_glove ${gloveMap[baseType]} ${paint} ${float} ${seed}`;
                } else if (typeof weaponMap !== 'undefined' && weaponMap[baseType]) {
                    cmd = `sm_skin ${weaponMap[baseType]} ${paint} ${float} ${seed}`;
                    let stickerParams = [0, 0, 0, 0, 0, 0, 0, 0];
                    if (info.stickers && info.stickers.length > 0) {
                        const limitStickers = info.stickers.slice(0, 4).reverse();
                        limitStickers.forEach((s, index) => {
                            const sid = s.sticker_id || 0;
                            const wear = s.wear || 0;
                            stickerParams[index * 2] = sid;
                            stickerParams[index * 2 + 1] = wear.toFixed(2);
                        });
                    }
                    cmd += ` ${stickerParams.join(' ')}`;
                    cmd += "; regenerate_weapon_skins";
                } else if (typeof agentMap !== 'undefined') {
                    for (const [k, id] of Object.entries(agentMap)) {
                        if (cleanFullName.includes(k.replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, ''))) {
                            cmd = `sm_agent ${id}`;
                            break;
                        }
                    }
                }

                // ... (保留前面的 match 和其他逻辑)

                if (cmd) {
                    const btn = document.createElement('button');
                    btn.innerText = "📋 指令";

                    if (isInventory) {
                        if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
                        btn.style.cssText = `position: absolute; right: 5px; bottom: 5px; z-index: 100; padding: 2px 6px; background: rgba(227, 178, 56, 0.9); color: #1a1a1a; border: 1px solid rgba(0,0,0,0.1); border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold;`;
                        el.appendChild(btn);
                    } else if (isBookmark) {
                        // 针对收藏页：绝对定位到右下角，留出 2px 边距
                        const container = el.querySelector('.name-cont.wear');
                        if (container) {
                            container.style.position = 'relative'; // 确保父级是定位基准
                            btn.style.cssText = `position: absolute; right: 2px; bottom: 2px; z-index: 10; padding: 1px 4px; background: #e3b238; color: #1a1a1a; border: none; border-radius: 3px; cursor: pointer; font-size: 10px; font-weight: bold; white-space: nowrap; line-height: 1.2; box-shadow: 0 0 4px rgba(0,0,0,0.2);`;
                            container.appendChild(btn);
                        }
                    } else {
                        // 市场页逻辑保持不变
                        btn.style.cssText = `display: inline-block; vertical-align: middle; margin-left: 8px; padding: 2px 6px; background: #e3b238; color: #1a1a1a; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; font-weight: bold; white-space: nowrap;`;
                        const target = el.querySelector('.wear-value') || el.querySelector('h3') || el.querySelector('.name-cont');
                        if (target) { target.parentElement.appendChild(btn); } else { el.appendChild(btn); }
                    }

btn.onclick = (e) => {
                        e.preventDefault(); e.stopPropagation();

                        // 替换为 Chrome 原生剪贴板 API
                        navigator.clipboard.writeText(cmd).then(() => {
                            // 复制成功后执行：变绿 + 提示
                            btn.innerText = "✅ 已复制";
                            btn.style.background = "#4caf50";
                            btn.style.color = "#fff";

                            // 1秒后恢复原状
                            setTimeout(() => {
                                btn.innerText = "📋 指令";
                                btn.style.background = "#e3b238";
                                btn.style.color = "#1a1a1a";
                            }, 1000);
                        }).catch(err => {
                            // 复制失败处理
                            console.error("复制失败", err);
                            btn.innerText = "❌ 失败";
                            setTimeout(() => {
                                btn.innerText = "📋 指令";
                            }, 1000);
                        });
                    };
                }
            } catch (e) { console.error("解析失败", e); }
        });
    }

    // setInterval(processItems, 1500);
       // --- 下面放你原本的整个 processItems 和 setInterval 逻辑 ---
    // 也就是说，只有在开关允许的情况下，脚本才会往下执行。
    setInterval(processItems, 1500);
});

        // ==========================================
    // 静态映射数据区
    // ==========================================
 const weaponMap = {

    "M4A1消音型": "m4a1_silencer",
    "沙漠之鹰": "deagle",
    "双持贝瑞塔": "elite",
    "FN57": "fiveseven",
    "AUG": "aug",
    "AWP": "awp",
    "法玛斯": "famas",
    "G3SG1": "g3sg1",
    "加利尔AR": "galilar",
    "M249": "m249",
    "M4A4": "m4a1",
    "MAC-10": "mac10",
    "P90": "p90",
    "MP5-SD": "mp5sd",
    "UMP-45": "ump45",
    "XM1014": "xm1014",
    "PP-野牛": "bizon",
    "MAG-7": "mag7",
    "内格夫": "negev",
    "截短霰弹枪": "sawedoff",
    "Tec-9": "tec9",
    "宙斯x27电击枪": "taser",
    "P2000": "hkp2000",
    "MP7": "mp7",
    "MP9": "mp9",
    "新星": "nova",
    "P250": "p250",
    "SCAR-20": "scar20",
    "SG553": "sg556",
    "SSG08": "ssg08",
    "C4炸弹": "c4",
    "M4A1消音版": "m4a1_silencer",
    "USP消音版": "usp_silencer",
    "CZ75自动型": "cz75a",
    "R8左轮手枪": "revolver",
    "匕首": "knife_t",
    "刺刀": "bayonet",
    "海豹短刀": "knife_css",
    "折叠刀": "knife_flip",
    "穿肠刀": "knife_gut",
    "爪子刀": "knife_karambit",
    "M9刺刀": "knife_m9_bayonet",
    "猎杀者匕首": "knife_tactical",
    "弯刀": "knife_falchion",
    "鲍伊猎刀": "knife_survival_bowie",
    "蝴蝶刀": "knife_butterfly",
    "暗影双匕": "knife_push",
    "系绳匕首": "knife_cord",
    "求生匕首": "knife_canis",
    "熊刀": "knife_ursus",
    "折刀": "knife_gypsy_jackknife",
    "流浪者匕首": "knife_outdoor",
    "短剑": "knife_stiletto",
    "锯齿爪刀": "knife_widowmaker",
    "骷髅匕首": "knife_skeleton",
    "廓尔喀刀": "knife_kukri",
    "格洛克18型": "glock",
    "AK-47": "ak47"
};
const gloveMap = {
        "狂牙手套": "4725",
        "血猎手套": "5027",
        "默认T手套": "5028",
        "默认反恐精英手套": "5029",
        "运动手套": "5030",
        "驾驶手套": "5031",
        "裹手": "5032",
        "摩托手套": "5033",
        "专业手套": "5034",
        "九头蛇手套": "5035"
    };
const agentMap = {
    "残酷的达里尔（穷鬼）": "4613",
    "“蓝莓” 铅弹": "4619",
    "“两次”麦考伊": "4680",
    "指挥官 梅 “极寒” 贾米森": "4711",
    "第一中尉法洛": "4712",
    "约翰 “范·海伦” 卡斯克": "4713",
    "生物防害专家": "4714",
    "军士长炸弹森": "4715",
    "化学防害专家": "4716",
    "红衫列赞": "4718",
    "残酷的达里尔爵士（迈阿密）": "4726",
    "飞贼波兹曼": "4727",
    "小凯夫": "4728",
    "出逃的萨莉": "4730",
    "老K": "4732",
    "残酷的达里尔爵士（沉默）": "4733",
    "残酷的达里尔爵士（头盖骨）": "4734",
    "残酷的达里尔爵士（皇家）": "4735",
    "残酷的达里尔爵士（聒噪）": "4736",
    "军医少尉": "4749",
    "化学防害上尉": "4750",
    "中队长鲁沙尔·勒库托": "4751",
    "准尉": "4752",
    "军官雅克·贝尔特朗": "4753",
    "中尉法洛（抱树人）": "4756",
    "指挥官黛维达·费尔南德斯（护目镜）": "4757",
    "指挥官弗兰克·巴鲁德（湿袜）": "4771",
    "中尉雷克斯·克里奇": "4772",
    "精锐捕兽者索尔曼": "4773",
    "遗忘者克拉斯沃特": "4774",
    "亚诺（野草）": "4775",
    "上校曼戈斯·达比西": "4776",
    "薇帕姐（革新派）": "4777",
    "捕兽者（挑衅者）": "4778",
    "克拉斯沃特（三分熟）": "4780",
    "捕兽者": "4781",
    "地面叛军": "5105",
    "奥西瑞斯": "5106",
    "沙哈马特教授": "5107",
    "精英穆哈里克先生": "5108",
    "丛林反抗者": "5109",
    "枪手": "5205",
    "执行者": "5206",
    "弹弓": "5207",
    "街头士兵": "5208",
    "特种兵": "5305",
    "马尔库斯·戴劳": "5306",
    "迈克·赛弗斯": "5307",
    "爱娃特工": "5308",
    "第三特种兵连": "5400",
    "海豹突击队第六分队士兵": "5401",
    "铅弹": "5402",
    "海军上尉里克索尔": "5404",
    "陆军中尉普里米罗": "5405",
    "德拉戈米尔": "5500",
    "马克西姆斯": "5501",
    "准备就绪的列赞": "5502",
    "黑狼": "5503",
    "“医生”罗曼诺夫": "5504",
    "B 中队指挥官": "5601",
    "D 中队军官": "5602"
};
})();