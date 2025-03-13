// 更新API配置列表
async function updateApiConfigSelect() {
  const select = document.getElementById('apiConfigSelect');
  const { apiConfigs = [], currentApiConfigIndex = 0 } = await chrome.storage.sync.get([
    'apiConfigs',
    'currentApiConfigIndex'
  ]);
  
  select.innerHTML = '';
  
  if (apiConfigs.length === 0) {
    select.innerHTML = '<option value="">未配置</option>';
    select.disabled = true;
    return;
  }
  
  apiConfigs.forEach((config, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = config.name;
    option.selected = index === currentApiConfigIndex;
    select.appendChild(option);
  });
  
  select.disabled = false;
}

// 更新API状态
async function updateApiStatus() {
  const apiStatus = document.getElementById('apiStatus');
  const { apiConfigs = [], currentApiConfigIndex = 0 } = await chrome.storage.sync.get([
    'apiConfigs',
    'currentApiConfigIndex'
  ]);
  
  if (apiConfigs.length === 0) {
    apiStatus.textContent = '未配置';
    apiStatus.className = 'value error';
    apiStatus.innerHTML = '<span class="badge badge-danger">未配置</span>';
  } else {
    const currentConfig = apiConfigs[currentApiConfigIndex];
    if (currentConfig && currentConfig.apiEndpoint && currentConfig.apiKey) {
      apiStatus.innerHTML = '<span class="badge badge-success">已配置</span>';
    } else {
      apiStatus.innerHTML = '<span class="badge badge-danger">配置不完整</span>';
    }
  }
}

// 处理API配置切换
document.getElementById('apiConfigSelect').addEventListener('change', async (e) => {
  const newIndex = parseInt(e.target.value);
  if (!isNaN(newIndex)) {
    await chrome.storage.sync.set({ currentApiConfigIndex: newIndex });
    updateApiStatus();
  }
});

// 更新简历状态
async function updateResumeStatus() {
  const resumeStatus = document.getElementById('resumeStatus');
  const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
  
  if (resumes.length === 0) {
    resumeStatus.innerHTML = '<span class="badge badge-danger">未添加</span>';
  } else {
    resumeStatus.innerHTML = `<span class="badge badge-success">已添加 ${resumes.length} 份</span>`;
  }
}

// 更新域名设置状态
async function updateDomainStatus() {
  const domainStatus = document.getElementById('domainStatus');
  const { enableAllDomains, enabledDomains = [] } = await chrome.storage.sync.get([
    'enableAllDomains',
    'enabledDomains'
  ]);
  
  if (enableAllDomains) {
    domainStatus.innerHTML = '<span class="badge badge-success">所有网站</span>';
  } else {
    const count = enabledDomains.length;
    if (count === 0) {
      domainStatus.innerHTML = '<span class="badge badge-danger">未设置</span>';
    } else {
      domainStatus.innerHTML = `<span class="badge badge-success">${count} 个网站</span>`;
    }
  }
}

// 打开选项页面
document.getElementById('openOptions').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 初始化页面
async function initializePage() {
  try {
    await updateApiConfigSelect();
    await updateApiStatus();
    await updateResumeStatus();
    await updateDomainStatus();
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

// 监听存储变化，实时更新状态
chrome.storage.onChanged.addListener((changes) => {
  // 监听API配置相关变化
  if (changes.apiConfigs || changes.currentApiConfigIndex) {
    updateApiConfigSelect();
    updateApiStatus();
  }
  // 监听简历变化
  if (changes.resumes) {
    updateResumeStatus();
  }
  // 监听域名设置变化
  if (changes.enableAllDomains || changes.enabledDomains) {
    updateDomainStatus();
  }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);
