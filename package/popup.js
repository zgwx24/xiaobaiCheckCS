// 等待整个 HTML DOM 加载完毕后再执行 JS
document.addEventListener('DOMContentLoaded', () => {
  // 默认设置：全开
  const defaultSettings = {
    buff: { market: true, inventory: true, bookmark: true },
    uu: { market: true, inventory: true },
    c5: { market: true, inventory: true }
  };

  let currentSettings = {};
  let currentPlatform = ''; 

  function cloneDefaultSettings() {
    return JSON.parse(JSON.stringify(defaultSettings));
  }

  // DOM 元素 (加上防空判断)
  const mainView = document.getElementById('main-view');
  const settingsView = document.getElementById('settings-view');
  const backBtn = document.getElementById('back-btn');
  const settingsTitle = document.getElementById('settings-title');
  const rowBookmark = document.getElementById('row-bookmark');

  const toggles = {
    market: document.getElementById('toggle-market'),
    inventory: document.getElementById('toggle-inventory'),
    bookmark: document.getElementById('toggle-bookmark')
  };

  // 1. 初始化读取设置
  if (chrome.storage) {
    chrome.storage.local.get(['siteSettings'], (result) => {
      currentSettings = result.siteSettings || defaultSettings;
    });
  }

 // 2. 绑定“⚙️”设置按钮点击事件
  document.querySelectorAll('.btn-setting').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // 【关键修改】使用 currentTarget 确保准确拿到绑定事件的 div，防止点到 svg 标签上拿不到属性
      const targetBtn = e.currentTarget; 
      currentPlatform = targetBtn.getAttribute('data-target');
      
      const titles = { 'buff': 'BUFF 设置', 'uu': '悠悠有品 设置', 'c5': 'C5GAME 设置' };
      if (settingsTitle) settingsTitle.innerText = titles[currentPlatform];

      if (rowBookmark) {
        rowBookmark.style.display = (currentPlatform === 'buff') ? 'flex' : 'none';
      }

      const platformSettings = currentSettings[currentPlatform] || defaultSettings[currentPlatform];
      
      // 安全赋值，防止 DOM 元素缺失报错
      if (toggles.market) toggles.market.checked = platformSettings.market ?? true;
      if (toggles.inventory) toggles.inventory.checked = platformSettings.inventory ?? true;
      if (currentPlatform === 'buff' && toggles.bookmark) {
        toggles.bookmark.checked = platformSettings.bookmark ?? true;
      }

      if (mainView && settingsView) {
        mainView.style.display = 'none';
        settingsView.style.display = 'block';
      }
    });
  });

  // 3. 返回按钮逻辑
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (settingsView && mainView) {
        settingsView.style.display = 'none';
        mainView.style.display = 'block';
      }
    });
  }

  // 4. 监听开关变化并保存
  ['market', 'inventory', 'bookmark'].forEach(key => {
    if (toggles[key]) {
      toggles[key].addEventListener('change', (e) => {
        if (!currentSettings[currentPlatform]) currentSettings[currentPlatform] = {};
        
        currentSettings[currentPlatform][key] = e.target.checked;
        
        if (chrome.storage) {
          chrome.storage.local.set({ siteSettings: currentSettings }, () => {
            console.log(`${currentPlatform}的 ${key} 设置已保存:`, e.target.checked);
          });
        }
      });
    }
  });

  // 5. 恢复默认设置逻辑
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // 当前平台恢复全开
      currentSettings[currentPlatform] = { market: true, inventory: true, bookmark: true };
      
      // 更新 UI 开关显示
      if (toggles.market) toggles.market.checked = true;
      if (toggles.inventory) toggles.inventory.checked = true;
      if (toggles.bookmark) toggles.bookmark.checked = true;
      
      // 保存至 Storage
      if (chrome.storage) {
        chrome.storage.local.set({ siteSettings: currentSettings }, () => {
          console.log(`${currentPlatform} 已恢复默认设置`);
        });
      }
    });
  }

  // 6. 主界面一键恢复所有平台默认设置
  const resetAllBtn = document.getElementById('reset-all-btn');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', () => {
      currentSettings = cloneDefaultSettings();

      if (chrome.storage) {
        chrome.storage.local.set({ siteSettings: currentSettings }, () => {
          console.log('全部平台已恢复默认设置');
        });
      }
    });
  }
});