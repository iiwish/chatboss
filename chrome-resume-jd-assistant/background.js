// 存储默认配置
const defaultConfig = {
  apiEndpoint: '',
  apiKey: '',
  resumes: [],
  enabledDomains: [],
  enableAllDomains: true
};

// 初始化配置
chrome.runtime.onInstalled.addListener(async () => {
  const config = await chrome.storage.sync.get(defaultConfig);
  if (!config) {
    await chrome.storage.sync.set(defaultConfig);
  }
  
  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'generateGreeting',
    title: 'AI生成招呼语',
    contexts: ['selection']
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generateGreeting') {
    // 检查是否在允许的域名中
    chrome.storage.sync.get(['enabledDomains', 'enableAllDomains'], async (config) => {
      const url = new URL(tab.url);
      const domain = url.hostname;
      
      if (config.enableAllDomains || config.enabledDomains.includes(domain)) {
        // 获取配置和简历
        const { apiEndpoint, apiKey, resumes } = await chrome.storage.sync.get([
          'apiEndpoint',
          'apiKey',
          'resumes'
        ]);

        if (!apiEndpoint || !apiKey || resumes.length === 0) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'showError',
            message: '请先在插件选项中配置API信息和简历'
          });
          return;
        }

        // 发送消息到content script开始生成
        chrome.tabs.sendMessage(tab.id, {
          type: 'startGeneration',
          selectedText: info.selectionText
        });

        try {
          // 构建prompt
          const prompt = `我想要应聘以下职位：\n${info.selectionText}\n\n我的简历信息如下：\n${resumes[0].content}\n\n请根据职位描述和我的简历，生成一个合适的招呼语。要求：\n1. 有针对性地提到JD中的关键要求\n2. 突出我简历中相关的经验\n3. 语气要真诚友好\n4. 控制在150字以内`;

          // 调用API
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              messages: [
                {
                  role: "user",
                  content: prompt
                }
              ]
            })
          });

          if (!response.ok) {
            throw new Error('API请求失败');
          }

          const data = await response.json();
          const generatedText = data.choices[0].message.content;

          // 发送生成结果到content script
          chrome.tabs.sendMessage(tab.id, {
            type: 'showResult',
            result: generatedText
          });
        } catch (error) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'showError',
            message: '生成失败：' + error.message
          });
        }
      } else {
        chrome.tabs.sendMessage(tab.id, {
          type: 'showError',
          message: '当前网站未启用AI招呼语生成功能'
        });
      }
    });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getResumes') {
    chrome.storage.sync.get(['resumes'], (result) => {
      sendResponse({ resumes: result.resumes || [] });
    });
    return true;
  }
});
