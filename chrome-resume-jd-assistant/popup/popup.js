// 更新API状态
async function updateApiStatus() {
  const apiStatus = document.getElementById('apiStatus');
  const { apiEndpoint, apiKey, modelCode } = await chrome.storage.sync.get(['apiEndpoint', 'apiKey', 'modelCode']);
  
  if (!apiEndpoint || !apiKey || !modelCode) {
    apiStatus.textContent = '未配置';
    apiStatus.className = 'value error';
  } else {
    apiStatus.textContent = '已配置';
    apiStatus.className = 'value success';
  }
}

// 更新简历状态
async function updateResumeStatus() {
  const resumeStatus = document.getElementById('resumeStatus');
  const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
  
  if (resumes.length === 0) {
    resumeStatus.textContent = '未添加';
    resumeStatus.className = 'value error';
  } else {
    resumeStatus.textContent = `已添加 ${resumes.length} 份`;
    resumeStatus.className = 'value success';
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
    domainStatus.textContent = '所有网站';
    domainStatus.className = 'value success';
  } else {
    const count = enabledDomains.length;
    if (count === 0) {
      domainStatus.textContent = '未设置';
      domainStatus.className = 'value error';
    } else {
      domainStatus.textContent = `${count} 个网站`;
      domainStatus.className = 'value success';
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
    await updateApiStatus();
    await updateResumeStatus();
    await updateDomainStatus();
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

// 监听存储变化，实时更新状态
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiEndpoint || changes.apiKey || changes.modelCode) {
    updateApiStatus();
  }
  if (changes.resumes) {
    updateResumeStatus();
  }
  if (changes.enableAllDomains || changes.enabledDomains) {
    updateDomainStatus();
  }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);
