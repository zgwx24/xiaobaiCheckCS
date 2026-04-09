const formatSwitch = document.getElementById('format-switch');

// 1. 每次打开菜单，从 storage 中读取之前的状态并恢复
chrome.storage.local.get(['useNewCmdFormat'], (result) => {
  formatSwitch.checked = result.useNewCmdFormat || false;
});

// 2. 监听开关变化，保存到 storage
formatSwitch.addEventListener('change', (e) => {
  chrome.storage.local.set({ useNewCmdFormat: e.target.checked }, () => {
    console.log('格式开关状态已保存:', e.target.checked);
  });
});