// 工具函数：显示状态信息
function showStatus(elementId, message, isError = false) {
  const status = document.getElementById(elementId);
  status.textContent = message;
  status.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    status.className = 'status';
  }, 3000);
}

// API配置管理
document.getElementById('saveApi').addEventListener('click', async () => {
  const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
  const apiKey = document.getElementById('apiKey').value.trim();
  const modelCode = document.getElementById('modelCode').value.trim();
  const promptTemplate = document.getElementById('promptTemplate').value.trim();

  if (!apiEndpoint || !apiKey) {
    showStatus('apiStatus', '请填写完整的API配置信息', true);
    return;
  }

  try {
    await chrome.storage.sync.set({ apiEndpoint, apiKey, modelCode, promptTemplate });
    showStatus('apiStatus', 'API配置保存成功');
  } catch (error) {
    showStatus('apiStatus', '保存失败：' + error.message, true);
  }
});

// 简历管理
function createResumeElement(resume, index) {
  const div = document.createElement('div');
  div.className = 'resume-item';
  
  const title = document.createElement('span');
  title.className = 'resume-title';
  title.textContent = resume.title;
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'button delete';
  deleteButton.textContent = '删除';
  deleteButton.onclick = async () => {
    try {
      const { resumes } = await chrome.storage.sync.get(['resumes']);
      resumes.splice(index, 1);
      await chrome.storage.sync.set({ resumes });
      renderResumes();
      showStatus('resumeStatus', '简历删除成功');
    } catch (error) {
      showStatus('resumeStatus', '删除失败：' + error.message, true);
    }
  };
  
  div.appendChild(title);
  div.appendChild(deleteButton);
  return div;
}

async function renderResumes() {
  const resumeList = document.getElementById('resumeList');
  const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
  
  resumeList.innerHTML = '';
  resumes.forEach((resume, index) => {
    resumeList.appendChild(createResumeElement(resume, index));
  });
}

document.getElementById('addResume').addEventListener('click', async () => {
  const title = document.getElementById('resumeTitle').value.trim();
  const content = document.getElementById('resumeContent').value.trim();

  if (!title || !content) {
    showStatus('resumeStatus', '请填写完整的简历信息', true);
    return;
  }

  try {
    const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
    resumes.push({ title, content });
    await chrome.storage.sync.set({ resumes });
    
    document.getElementById('resumeTitle').value = '';
    document.getElementById('resumeContent').value = '';
    
    renderResumes();
    showStatus('resumeStatus', '简历添加成功');
  } catch (error) {
    showStatus('resumeStatus', '添加失败：' + error.message, true);
  }
});

// 域名设置管理
function createDomainElement(domain, index) {
  const div = document.createElement('div');
  div.className = 'domain-item';
  
  const text = document.createElement('span');
  text.textContent = domain;
  text.style.flexGrow = '1';
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'button delete';
  deleteButton.textContent = '删除';
  deleteButton.onclick = async () => {
    try {
      const { enabledDomains } = await chrome.storage.sync.get(['enabledDomains']);
      enabledDomains.splice(index, 1);
      await chrome.storage.sync.set({ enabledDomains });
      renderDomains();
      showStatus('domainStatus', '域名删除成功');
    } catch (error) {
      showStatus('domainStatus', '删除失败：' + error.message, true);
    }
  };
  
  div.appendChild(text);
  div.appendChild(deleteButton);
  return div;
}

async function renderDomains() {
  const domainList = document.getElementById('domainList');
  const { enabledDomains = [] } = await chrome.storage.sync.get(['enabledDomains']);
  
  domainList.innerHTML = '';
  enabledDomains.forEach((domain, index) => {
    domainList.appendChild(createDomainElement(domain, index));
  });
}

document.getElementById('enableAllDomains').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  try {
    await chrome.storage.sync.set({ enableAllDomains: enabled });
    document.getElementById('domainSettings').style.display = enabled ? 'none' : 'block';
    showStatus('domainStatus', `已${enabled ? '启用所有网站' : '切换为特定网站'}模式`);
  } catch (error) {
    showStatus('domainStatus', '设置失败：' + error.message, true);
  }
});

document.getElementById('addDomain').addEventListener('click', async () => {
  const domain = document.getElementById('domain').value.trim();
  
  if (!domain) {
    showStatus('domainStatus', '请输入域名', true);
    return;
  }

  try {
    const { enabledDomains = [] } = await chrome.storage.sync.get(['enabledDomains']);
    if (enabledDomains.includes(domain)) {
      showStatus('domainStatus', '该域名已存在', true);
      return;
    }
    
    enabledDomains.push(domain);
    await chrome.storage.sync.set({ enabledDomains });
    
    document.getElementById('domain').value = '';
    renderDomains();
    showStatus('domainStatus', '域名添加成功');
  } catch (error) {
    showStatus('domainStatus', '添加失败：' + error.message, true);
  }
});

// 初始化页面
async function initializePage() {
  try {
    const {
      apiEndpoint = '',
      apiKey = '',
      modelCode = '',
      promptTemplate = '我想要应聘以下职位：\n{jobDescription}\n\n我的简历信息如下：\n{resume}\n\n请根据职位描述和我的简历，生成一个合适的招呼语。要求：\n1. 有针对性地提到JD中的关键要求\n2. 突出我简历中相关的经验\n3. 语气要真诚友好\n4. 控制在150字以内',
      enableAllDomains = true
    } = await chrome.storage.sync.get(['apiEndpoint', 'apiKey', 'modelCode', 'promptTemplate', 'enableAllDomains']);
    
    document.getElementById('apiEndpoint').value = apiEndpoint;
    document.getElementById('apiKey').value = apiKey;
    document.getElementById('modelCode').value = modelCode;
    document.getElementById('promptTemplate').value = promptTemplate;
    document.getElementById('enableAllDomains').checked = enableAllDomains;
    document.getElementById('domainSettings').style.display = enableAllDomains ? 'none' : 'block';
    
    await renderResumes();
    await renderDomains();
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);
