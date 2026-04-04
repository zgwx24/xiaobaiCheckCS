(function() {
    'use strict';

    // ==========================================
    // 静态映射数据区
    // ==========================================
    const weaponMap = {
        "沙漠之鹰": "deagle", "双持贝瑞塔": "elite", "FN57": "fiveseven",
        "AUG": "aug", "AWP": "awp", "法玛斯": "famas", "G3SG1": "g3sg1", "加利尔AR": "galilar", "M249": "m249",
        "M4A4": "m4a1", "MAC-10": "mac10", "P90": "p90", "MP5-SD": "mp5sd", "UMP-45": "ump45", "XM1014": "xm1014",
        "PP-野牛": "bizon", "MAG-7": "mag7", "内格夫": "negev", "截短霰弹枪": "sawedoff", "Tec-9": "tec9",
        "宙斯x27电击枪": "taser", "P2000": "hkp2000", "MP7": "mp7", "MP9": "mp9", "新星": "nova", "P250": "p250",
        "SCAR-20": "scar20", "SG553": "sg556", "SSG08": "ssg08", "C4炸弹": "c4", "M4A1消音版": "m4a1_silencer",
        "USP消音版": "usp_silencer", "CZ75自动型": "cz75a", "R8左轮手枪": "revolver", "匕首": "knife_t",
        "刺刀": "bayonet", "海豹短刀": "knife_css", "折叠刀": "knife_flip", "穿肠刀": "knife_gut",
        "爪子刀": "knife_karambit", "M9刺刀": "knife_m9_bayonet", "猎杀者匕首": "knife_tactical",
        "弯刀": "knife_falchion", "鲍伊猎刀": "knife_survival_bowie", "蝴蝶刀": "knife_butterfly",
        "孤舟刀": "knife_bo","暗影双匕": "knife_push", "系绳匕首": "knife_cord", "求生匕首": "knife_canis",
        "熊刀": "knife_ursus",
        "折刀": "knife_gypsy_jackknife", "流浪者匕首": "knife_outdoor", "短剑": "knife_stiletto",
        "锯齿爪刀": "knife_widowmaker", "骷髅匕首": "knife_skeleton", "廓尔喀刀": "knife_kukri",
        "格洛克18型": "glock", "AK-47": "ak47"
    };

    const gloveMap = {
        "狂牙手套": "4725", "血猎手套": "5027", "默认T手套": "5028", "默认反恐精英手套": "5029",
        "运动手套": "5030", "驾驶手套": "5031", "裹手": "5032", "摩托手套": "5033",
        "专业手套": "5034", "九头蛇手套": "5035"
    };

    const agentMap = {
        "残酷的达里尔（穷鬼）": "4613", "“蓝莓” 铅弹": "4619", "“两次”麦考伊": "4680", "指挥官 梅 “极寒” 贾米森": "4711",
        "第一中尉法洛": "4712", "约翰 “范·海伦” 卡斯克": "4713", "生物防害专家": "4714", "军士长炸弹森": "4715",
        "化学防害专家": "4716", "红衫列赞": "4718", "残酷的达里尔爵士（迈阿密）": "4726", "飞贼波兹曼": "4727",
        "小凯夫": "4728", "出逃的萨莉": "4730", "老K": "4732", "残酷的达里尔爵士（沉默）": "4733",
        "残酷的达里尔爵士（头盖骨）": "4734", "残酷的达里尔爵士（皇家）": "4735", "残酷的达里尔爵士（聒噪）": "4736",
        "军医少尉": "4749", "化学防害上尉": "4750", "中队长鲁沙尔·勒库托": "4751", "准尉": "4752",
        "军官雅克·贝尔特朗": "4753", "中尉法洛（抱树人）": "4756", "指挥官黛维达·费尔南德斯（护目镜）": "4757",
        "指挥官弗兰克·巴鲁德（湿袜）": "4771", "中尉雷克斯·克里奇": "4772", "精锐捕兽者索尔曼": "4773",
        "遗忘者克拉斯沃特": "4774", "亚诺（野草）": "4775", "上校曼戈斯·达比西": "4776", "薇帕姐（革新派）": "4777",
        "捕兽者（挑衅者）": "4778", "克拉斯沃特（三分熟）": "4780", "捕兽者": "4781", "地面叛军": "5105",
        "奥西瑞斯": "5106", "沙哈马特教授": "5107", "精英穆哈里克先生": "5108", "丛林反抗者": "5109",
        "枪手": "5205", "执行者": "5206", "弹弓": "5207", "街头士兵": "5208", "特种兵": "5305",
        "马尔库斯·戴劳": "5306", "迈克·赛弗斯": "5307", "爱娃特工": "5308", "第三特种兵连": "5400",
        "海豹突击队第六分队士兵": "5401", "铅弹": "5402", "海军上尉里克索尔": "5404", "陆军中尉普里米罗": "5405",
        "德拉戈米尔": "5500", "马克西姆斯": "5501", "准备就绪的列赞": "5502", "黑狼": "5503",
        "“医生”罗曼诺夫": "5504", "B 中队指挥官": "5601", "D 中队军官": "5602"
    };
    const stickerMap = window.stickerMap || {};

    function injectC5Command() {
        const popups = document.querySelectorAll('.pl15.pr15');

        popups.forEach(popup => {
            if (popup.offsetParent === null) return;

            const nameEl = popup.querySelector('.f16.ellipsis.text-primary');
            let rawName = nameEl ? nameEl.innerText.trim() : "";
            if (!rawName) return;

            // 1. 提取基础信息
            let seed = "0", paintId = "0", float = "0.0001";
            const tips = popup.querySelectorAll('.l-tips');
            tips.forEach(tip => {
                const text = tip.innerText;
                if (text.includes('图案模板')) seed = text.match(/\d+/)?.[0] || "0";
                else if (text.includes('皮肤编号')) paintId = text.match(/\d+/)?.[0] || "0";
                else if (text.includes('磨损')) float = text.match(/[\d.]+/)?.[0] || "0.0001";
            });

            // 2. 🚀 贴纸数据提取 (加装防崩溃装甲)
            let stickerPart = "";
            let stickerKeyPart = "";
            let actualStickerCount = 0;

            try {
                // 兼容多套 C5 的结构，把能找到的印花图片全抓出来
                const stickerImgs = popup.querySelectorAll('.sticker-item img, .sticker-list img, img[src*="sticker"]');
                const imgArray = Array.from(stickerImgs);

                for (let i = 0; i < 5; i++) {
                    let stickerId = "0";
                    let abrasionVal = "0.00";
                    const img = imgArray[i];

                    if (img) {
                        // A: URL 正则解析 ID
                        if (img.src) {
                            const urlMatch = img.src.match(/\/(\d+)\.(png|jpg|webp)/i);
                            if (urlMatch) {
                                stickerId = urlMatch[1];
                            } else {
                                // B: URL 失败则回退查字典
                                let rawStickerName = img.alt || img.title || (img.nextElementSibling ? img.nextElementSibling.innerText : "");
                                if (rawStickerName) {
                                    rawStickerName = rawStickerName.replace(/^印花\s*\|\s*/, '').trim();
                                    if (stickerMap[rawStickerName]) stickerId = stickerMap[rawStickerName];
                                }
                            }
                        }

                        // C: 寻找磨损度 (向上找父级里的 f12 或者旁边带有 % 的文本)
                        if (stickerId !== "0") {
                            actualStickerCount++;
                            let parentBox = img.closest('.sticker-item') || img.parentElement;
                            let wearText = parentBox ? parentBox.innerText.match(/(\d+(\.\d+)?)%/) : null;
                            if (wearText) {
                                // 网页显示 100% (完好) -> 引擎需要 0.00 (无刮擦)
                                let wearValue = 1 - (parseFloat(wearText[1]) / 100);
                                abrasionVal = Math.max(0, wearValue).toFixed(2);
                            }
                        }
                    }

                    // 强制补齐 5 位参数
                    stickerPart += ` ${stickerId} ${abrasionVal}`;
                    stickerKeyPart += `-${stickerId}-${abrasionVal}`;
                }
            } catch (e) {
                // 就算贴纸解析炸了，也不影响基础皮肤指令的生成
                stickerPart = " 0 0.00 0 0.00 0 0.00 0 0.00 0 0.00";
                stickerKeyPart = "-error";
            }

            // 3. 防幽灵按钮
            const currentItemKey = `c5-${rawName}-${paintId}-${float}-${seed}${stickerKeyPart}`;
            const existingBtn = popup.querySelector('.custom-cmd-btn-c5');

            if (existingBtn) {
                if (existingBtn.dataset.itemKey === currentItemKey) return;
                existingBtn.remove();
            }

            // 4. 生成指令
            const baseType = rawName.split('|')[0].replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, '');
            const cleanFullName = rawName.replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, '');
            let cmd = "";
            let debugMsg = "";

            if (gloveMap[baseType]) {
                cmd = `sm_glove ${gloveMap[baseType]} ${paintId} ${float} ${seed}`;
            } else if (weaponMap[baseType]) {
                cmd = `sm_skin ${weaponMap[baseType]} ${paintId} ${float} ${seed}${stickerPart}; regenerate_weapon_skins`;
            } else {
                let isAgent = false;
                for (const [k, id] of Object.entries(agentMap)) {
                    const agentCleanKey = k.replace(/\(|\)|（|）|★|StatTrak™|纪念品|\s+/g, '');
                    if (cleanFullName.includes(agentCleanKey) || baseType.includes(agentCleanKey)) {
                        cmd = `sm_agent ${id}`;
                        isAgent = true;
                        break;
                    }
                }
                // // ⚠️ 如果三大字典都找不到，记录错误信息！
                // if (!isAgent) {
                //     debugMsg = `⚠️ 缺少字典映射: [${baseType}]`;
                // }
            }

            // 5. 注入 UI (不管有没有生成成功，都必须渲染点什么让我们看到)
            const btn = document.createElement('div');
            btn.className = 'custom-cmd-btn-c5';
            btn.dataset.itemKey = currentItemKey;

            if (debugMsg) {
                // 渲染红色报错按钮
                btn.innerHTML = debugMsg;
                btn.style.cssText = `
                    background: #ff4d4d !important; color: white !important;
                    padding: 8px !important; text-align: center !important;
                    border-radius: 4px !important; margin: 10px 0 !important;
                    font-size: 13px !important; z-index: 9999 !important; font-weight: bold !important;
                `;
            } else {
                // 渲染正常的黄色复制按钮
                const isWeaponOrGlove = gloveMap[baseType] || weaponMap[baseType];
                const floatHint = isWeaponOrGlove ? ` (磨损:${parseFloat(float).toFixed(4)})` : "";
                const stickerHint = actualStickerCount > 0 ? ` [${actualStickerCount}印花]` : "";

                btn.innerHTML = `📋 复制指令${floatHint}${stickerHint}`;
                btn.style.cssText = `
                    background: #e3b238 !important; color: #1a1a1a !important;
                    padding: 8px !important; text-align: center !important;
                    border-radius: 4px !important; cursor: pointer !important;
                    font-weight: bold !important; margin: 10px 0 !important;
                    font-size: 13px !important; z-index: 9999 !important;
                `;

                btn.onclick = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(cmd).then(() => {
                        const oldText = btn.innerHTML;
                        btn.innerHTML = "✅ 指令已复制";
                        btn.style.background = "#52c41a";
                        btn.style.color = "#fff";
                        setTimeout(() => {
                            btn.innerHTML = oldText;
                            btn.style.background = "#e3b238";
                            btn.style.color = "#1a1a1a";
                        }, 1500);
                    });
                };
            }

            // 插入节点
            const head = popup.querySelector('.pt15.fixed-head');
            if (head) {
                head.appendChild(btn);
            } else {
                popup.prepend(btn);
            }
        });
    }
    // ==========================================
    // 功能 2：自动价格降序 (极速双击版)
    // ==========================================

    const CONFIG = {
        initWait: 150,// 刚进页面时的反应时间
        doubleTapWait: 50,// 🚀 连击间隔：50毫秒极速双击，瞬间跨越“升序”
        verifyWait: 1000// 双击完成后，等待服务器回包的时间（用于最终校验）
    };

    let lastInventoryFingerprint = "";
    let sortProcessId = 0;

    function isInventoryPage() {
        const url = location.href;
        return url.includes('/user/inventory/steam') || url.includes('/my-stock');
    }

    function getInventoryFingerprint() {
        const nameNodes = document.querySelectorAll('.f16.ellipsis.text-primary, .sell-item-name, [class*="name"]');
        if (nameNodes.length === 0) return null;
        const names = Array.from(nameNodes).map(node => node.innerText.trim());
        return names.sort().join('|');
    }

    function getVisiblePriceBtn() {
        return Array.from(document.querySelectorAll('.sort-item'))
            .find(el => el.innerText.includes('价格') && el.offsetWidth > 0 && window.getComputedStyle(el).display !== 'none');
    }

    function triggerAutoSort() {
        const currentFingerprint = getInventoryFingerprint();
        if (!currentFingerprint) return;

        if (currentFingerprint === lastInventoryFingerprint) return;
        lastInventoryFingerprint = currentFingerprint;

        sortProcessId++;
        const currentProcessId = sortProcessId;
        let retryCount = 0;

        function attemptSort() {
            if (currentProcessId !== sortProcessId || !isInventoryPage()) return;
            if (retryCount > 5) return;

            const btn = getVisiblePriceBtn();
            if (!btn) return;

            const isActive = btn.classList.contains('active');
            const isDesc = btn.classList.contains('desc');

            if (isActive && isDesc) return; // 已经是降序，完美收工

            retryCount++;

            if (!isActive) {
                // 🚀 核心逻辑：完全没被激活时，直接执行极速双击！
                btn.click(); // 第 1 下：变升序

                setTimeout(() => {
                    const freshBtn = getVisiblePriceBtn();
                    // 确认它变成升序后，立刻补第 2 下
                    if (freshBtn && freshBtn.classList.contains('active') && !freshBtn.classList.contains('desc')) {
                        freshBtn.click(); // 第 2 下：变降序
                    }

                    // 双击打完收工，等 1 秒后再来看看结果
                    setTimeout(attemptSort, CONFIG.verifyWait);
                }, CONFIG.doubleTapWait);

            } else if (!isDesc) {
                // 如果恰好卡在了升序，只需要补一枪
                btn.click();
                setTimeout(attemptSort, CONFIG.verifyWait);
            }
        }

        setTimeout(attemptSort, CONFIG.initWait);
    }

    const mainContainer = document.querySelector('#__nuxt') || document.body;
    const observer = new MutationObserver(() => {
        if (isInventoryPage()) {
            triggerAutoSort();
        }
    });

    observer.observe(mainContainer, { childList: true, subtree: true });

    if (isInventoryPage()) {
        triggerAutoSort();
    }
    setInterval(injectC5Command, 300);
})();