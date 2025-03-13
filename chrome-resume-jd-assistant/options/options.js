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
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'resume-buttons';
  
  const editButton = document.createElement('button');
  editButton.className = 'button';
  editButton.textContent = '编辑';
  editButton.onclick = () => {
    // 填充表单以便编辑
    document.getElementById('resumeTitle').value = resume.title;
    document.getElementById('resumeContent').value = resume.content;
    
    // 更改添加按钮为保存按钮
    const addButton = document.getElementById('addResume');
    addButton.textContent = '保存修改';
    addButton.dataset.editIndex = index;
  };
  
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
  
  buttonsContainer.appendChild(editButton);
  buttonsContainer.appendChild(deleteButton);
  
  div.appendChild(title);
  div.appendChild(buttonsContainer);
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
  const addButton = document.getElementById('addResume');
  const editIndex = addButton.dataset.editIndex;

  if (!title || !content) {
    showStatus('resumeStatus', '请填写完整的简历信息', true);
    return;
  }

  try {
    const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
    
    if (editIndex !== undefined) {
      // 编辑现有简历
      resumes[editIndex] = { title, content };
      addButton.textContent = '添加简历';
      delete addButton.dataset.editIndex;
      showStatus('resumeStatus', '简历修改成功');
    } else {
      // 添加新简历
      resumes.push({ title, content });
      showStatus('resumeStatus', '简历添加成功');
    }
    
    await chrome.storage.sync.set({ resumes });
    
    document.getElementById('resumeTitle').value = '';
    document.getElementById('resumeContent').value = '';
    
    renderResumes();
  } catch (error) {
    showStatus('resumeStatus', `${editIndex !== undefined ? '修改' : '添加'}失败：` + error.message, true);
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
      promptTemplate = `你是一位专业的求职顾问，擅长帮助求职者撰写个性化的招呼语。

【招聘信息】:
{jobDescription}

【我的简历信息】:
{resume}

请根据上述招聘信息和我的简历，帮我生成一封专业、个性化的招呼语。要求:

1. 开头简短自我介绍，点明应聘意向
2. 中间部分针对JD中的关键技能要求，从我的简历中提取最匹配的1-2个经验亮点进行展示
3. 结尾表达对职位的热情和期待进一步交流的意愿
4. 保持语气真诚友好、专业得体，避免过度吹嘘
5. 总字数控制在100-150字之间
6. 确保内容高度针对性，不要泛泛而谈
7. 如果JD和简历匹配度不高，找出可迁移的能力或经验进行强调

请直接给出招呼语文本，不要包含解释。`,
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
