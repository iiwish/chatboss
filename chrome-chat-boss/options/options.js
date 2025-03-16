// 工具函数：显示状态信息
function showStatus(elementId, message, isError = false) {
  const status = document.getElementById(elementId);
  status.textContent = message;
  status.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// API配置管理相关变量
let currentEditIndex = -1; // -1表示新建，>=0表示编辑现有配置
const defaultTemplate = `你是一位专业的求职顾问，擅长帮助求职者撰写个性化的招呼语。

【招聘信息】:
{{JD}}

【我的简历信息】:
{{RESUME}}

请根据上述招聘信息和我的简历，帮我生成一封专业、个性化的招呼语。要求:

1. 开头点明应聘意向
2. 中间部分针对JD中的关键技能要求，从我的简历中提取最匹配的1-2个经验亮点进行展示
3. 结尾表达对职位的热情和期待进一步交流的意愿
4. 保持语气真诚友好、专业得体，避免过度吹嘘
5. 总字数控制在80-110字之间
6. 确保内容高度针对性，不要泛泛而谈
7. 如果JD和简历匹配度不高，找出可迁移的能力或经验进行强调

请直接给出招呼语文本，不要包含解释。`;

// 渲染API配置列表
async function renderApiConfigs() {
  const configList = document.getElementById('apiConfigList');
  const { apiConfigs = [], currentApiConfigIndex = 0 } = await chrome.storage.sync.get(['apiConfigs', 'currentApiConfigIndex']);
  
  configList.innerHTML = '';
  
  if (apiConfigs.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'help-tip';
    emptyMessage.innerHTML = '您还没有添加任何API配置。点击下方的"添加新配置"按钮开始设置。';
    configList.appendChild(emptyMessage);
    return;
  }
  
  apiConfigs.forEach((config, index) => {
    const div = document.createElement('div');
    div.className = `api-config-item ${index === currentApiConfigIndex ? 'current-api' : ''}`;
    
    const info = document.createElement('div');
    info.className = 'api-config-info';
    
    const name = document.createElement('div');
    name.className = 'api-config-name';
    name.textContent = config.name;
    
    const url = document.createElement('div');
    url.className = 'api-config-url';
    url.textContent = config.apiEndpoint;
    
    info.appendChild(name);
    info.appendChild(url);
    
    const actions = document.createElement('div');
    actions.className = 'api-config-actions';
    
    // 使用此配置按钮
    const useButton = document.createElement('button');
    useButton.className = 'btn' + (index === currentApiConfigIndex ? ' btn-secondary' : ' btn-success btn-sm');
    useButton.textContent = index === currentApiConfigIndex ? '当前使用中' : '使用此配置';
    useButton.disabled = index === currentApiConfigIndex;
    useButton.onclick = async () => {
      await chrome.storage.sync.set({ currentApiConfigIndex: index });
      renderApiConfigs();
      showStatus('apiStatus', `已切换到配置：${config.name}`);
    };
    
    // 编辑按钮
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-primary btn-sm';
    editButton.textContent = '编辑';
    editButton.onclick = () => {
      currentEditIndex = index;
      showApiForm(config);
    };
    
    // 删除按钮
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = '删除';
    deleteButton.onclick = async () => {
      if (confirm('确定要删除这个API配置吗？')) {
        try {
          apiConfigs.splice(index, 1);
          // 如果删除的是当前使用的配置，切换到第一个配置
          let newCurrentIndex = currentApiConfigIndex;
          if (index === currentApiConfigIndex) {
            newCurrentIndex = apiConfigs.length > 0 ? 0 : -1;
          } else if (index < currentApiConfigIndex) {
            newCurrentIndex = currentApiConfigIndex - 1;
          }
          await chrome.storage.sync.set({ 
            apiConfigs,
            currentApiConfigIndex: newCurrentIndex
          });
          renderApiConfigs();
          showStatus('apiStatus', '配置删除成功');
        } catch (error) {
          showStatus('apiStatus', '删除失败：' + error.message, true);
        }
      }
    };
    
    actions.appendChild(useButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    
    div.appendChild(info);
    div.appendChild(actions);
    configList.appendChild(div);
  });
}

// 显示API配置表单
function showApiForm(config = null) {
  const form = document.querySelector('.api-config-form');
  form.style.display = 'block';
  document.getElementById('addNewConfig').style.display = 'none';
  
  // 填充表单数据
  document.getElementById('configName').value = config?.name || '';
  document.getElementById('apiEndpoint').value = config?.apiEndpoint || '';
  document.getElementById('apiKey').value = config?.apiKey || '';
  document.getElementById('modelCode').value = config?.modelCode || '';
  document.getElementById('promptTemplate').value = config?.promptTemplate || defaultTemplate;
}

// 隐藏API配置表单
function hideApiForm() {
  const form = document.querySelector('.api-config-form');
  form.style.display = 'none';
  document.getElementById('addNewConfig').style.display = 'block';
  currentEditIndex = -1;
  
  // 清空表单
  document.getElementById('configName').value = '';
  document.getElementById('apiEndpoint').value = '';
  document.getElementById('apiKey').value = '';
  document.getElementById('modelCode').value = '';
  document.getElementById('promptTemplate').value = defaultTemplate;
}

// 添加新配置按钮事件
document.getElementById('addNewConfig').addEventListener('click', () => {
  currentEditIndex = -1;
  showApiForm();
});

// 取消按钮事件
document.getElementById('cancelEdit').addEventListener('click', hideApiForm);

// 保存API配置
document.getElementById('saveApi').addEventListener('click', async () => {
    const name = document.getElementById('configName').value.trim();
    const apiEndpoint = document.getElementById('apiEndpoint').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const modelCode = document.getElementById('modelCode').value.trim();
    const promptTemplate = document.getElementById('promptTemplate').value.trim();

    if (!name || !apiEndpoint || !apiKey || !modelCode) {
      showStatus('apiStatus', '请填写完整的API配置信息', true);
      return;
    }

    try {
      const { apiConfigs = [], currentApiConfigIndex = 0 } = await chrome.storage.sync.get(['apiConfigs', 'currentApiConfigIndex']);
      const newConfig = { name, apiEndpoint, apiKey, modelCode, promptTemplate };
    
    if (currentEditIndex === -1) {
      // 添加新配置
      apiConfigs.push(newConfig);
    } else {
      // 更新现有配置
      apiConfigs[currentEditIndex] = newConfig;
    }
    
    await chrome.storage.sync.set({ 
      apiConfigs,
      // 如果是第一个配置，自动设置为当前使用的配置
      currentApiConfigIndex: apiConfigs.length === 1 ? 0 : currentApiConfigIndex
    });
    
    hideApiForm();
    renderApiConfigs();
    showStatus('apiStatus', `API配置${currentEditIndex === -1 ? '添加' : '更新'}成功`);
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
  
  // 添加简历内容预览
  const preview = document.createElement('div');
  preview.className = 'text-muted';
  preview.style.fontSize = '0.8rem';
  preview.style.marginTop = '4px';
  preview.textContent = resume.content.length > 100 
    ? resume.content.substring(0, 100) + '...' 
    : resume.content;
  
  const infoContainer = document.createElement('div');
  infoContainer.appendChild(title);
  infoContainer.appendChild(preview);
  
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'resume-buttons';
  
  const editButton = document.createElement('button');
  editButton.className = 'btn btn-primary btn-sm';
  editButton.textContent = '编辑';
  editButton.onclick = () => {
    // 填充表单以便编辑
    document.getElementById('resumeTitle').value = resume.title;
    document.getElementById('resumeContent').value = resume.content;
    
    // 更改添加按钮为保存按钮
    const addButton = document.getElementById('addResume');
    addButton.textContent = '保存修改';
    addButton.dataset.editIndex = index;
    
    // 滚动到表单位置
    document.getElementById('resumeTitle').scrollIntoView({ behavior: 'smooth' });
  };
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'btn btn-danger btn-sm';
  deleteButton.textContent = '删除';
  deleteButton.onclick = async () => {
    if (confirm('确定要删除这份简历吗？')) {
      try {
        const { resumes } = await chrome.storage.sync.get(['resumes']);
        resumes.splice(index, 1);
        await chrome.storage.sync.set({ resumes });
        renderResumes();
        showStatus('resumeStatus', '简历删除成功');
      } catch (error) {
        showStatus('resumeStatus', '删除失败：' + error.message, true);
      }
    }
  };
  
  buttonsContainer.appendChild(editButton);
  buttonsContainer.appendChild(deleteButton);
  
  div.appendChild(infoContainer);
  div.appendChild(buttonsContainer);
  return div;
}

async function renderResumes() {
  const resumeList = document.getElementById('resumeList');
  const { resumes = [] } = await chrome.storage.sync.get(['resumes']);
  
  resumeList.innerHTML = '';
  
  if (resumes.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'help-tip';
    emptyMessage.innerHTML = '您还没有添加任何简历。添加至少一份简历才能使用招呼语生成功能。';
    resumeList.appendChild(emptyMessage);
    return;
  }
  
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

// 域名设置管理 - 禁用相关功能
function renderDomains() {
  const domainList = document.getElementById('domainList');
  
  domainList.innerHTML = '';
  
  const noticeElement = document.createElement('div');
  noticeElement.className = 'help-tip';
  noticeElement.innerHTML = '此功能已被禁用。ChatBoss仅在特定招聘网站上启用，无法自定义添加网站。';
  
  domainList.appendChild(noticeElement);
  
  // 禁用相关控件
  document.getElementById('enableAllDomains').disabled = true;
  document.getElementById('domain').disabled = true;
  document.getElementById('addDomain').disabled = true;
}

// 禁用域名相关事件监听器
document.getElementById('enableAllDomains').addEventListener('change', () => {
  // 已禁用，不执行任何操作
});

document.getElementById('addDomain').addEventListener('click', () => {
  // 已禁用，不执行任何操作
  showStatus('domainStatus', '此功能已被禁用。ChatBoss仅在特定招聘网站上启用。', true);
});

// 数据迁移：从旧格式迁移到新格式
async function migrateData() {
  try {
    const {
      apiEndpoint,
      apiKey,
      modelCode,
      promptTemplate,
      apiConfigs
    } = await chrome.storage.sync.get([
      'apiEndpoint',
      'apiKey',
      'modelCode',
      'promptTemplate',
      'apiConfigs'
    ]);

    // 如果已经有apiConfigs，说明已经迁移过了
    if (apiConfigs) {
      return;
    }

    // 如果有旧的API配置，迁移到新格式
    if (apiEndpoint && apiKey) {
      const newApiConfigs = [{
        name: 'DepSeek配置',  // 默认名称
        apiEndpoint,
        apiKey,
        modelCode: modelCode || 'deepseek-reasoner',
        promptTemplate: promptTemplate || defaultTemplate
      }];

      await chrome.storage.sync.set({
        apiConfigs: newApiConfigs,
        currentApiConfigIndex: 0
      });

      // 清理旧的配置
      await chrome.storage.sync.remove([
        'apiEndpoint',
        'apiKey',
        'modelCode',
        'promptTemplate'
      ]);

      console.log('数据迁移完成');
    }
  } catch (error) {
    console.error('数据迁移失败：', error);
  }
}

// 初始化页面
async function initializePage() {
  try {
    // 首先进行数据迁移
    await migrateData();
    
    const { 
      apiConfigs = [],
      currentApiConfigIndex = 0
    } = await chrome.storage.sync.get([
      'apiConfigs',
      'currentApiConfigIndex'
    ]);

    // 渲染API配置列表
    await renderApiConfigs();
    
    // 渲染简历
    await renderResumes();
    
    // 渲染域名设置（已禁用）
    renderDomains();
    
    // 禁用域名设置相关控件
    document.getElementById('enableAllDomains').checked = false;
    document.getElementById('enableAllDomains').disabled = true;
    document.getElementById('domain').disabled = true;
    document.getElementById('addDomain').disabled = true;
    
  } catch (error) {
    console.error('初始化失败：', error);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);
