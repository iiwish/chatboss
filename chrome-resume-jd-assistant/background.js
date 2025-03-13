// 存储默认配置
const defaultConfig = {
  apiEndpoint: '',
  apiKey: '',
  modelCode: '',
  promptTemplate: '我想要应聘以下职位：\n{{JD}}\n\n我的简历信息如下：\n{{RESUME}}\n\n请根据职位描述和我的简历，生成一个合适的招呼语。要求：\n1. 有针对性地提到JD中的关键要求\n2. 突出我简历中相关的经验\n3. 语气要真诚友好\n4. 控制在150字以内',
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
    // 检查URL是否为允许的协议（排除chrome://、chrome-extension://等特殊协议）
    const url = new URL(tab.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      console.log('不支持在此类型的页面上使用此功能:', url.protocol);
      return;
    }
    
    // 首先检查content script是否已准备好接收消息
    checkContentScriptReady(tab.id).then(ready => {
      if (!ready) {
        // 减少不必要的日志输出
        // console.log('Content script未准备好，尝试注入...');
        return injectContentScript(tab.id);
      }
      return true;
    }).then(success => {
      if (!success) {
        console.error('无法注入content script');
        return;
      }
      
      // 继续处理域名检查和API调用
      handleGreetingGeneration(info, tab);
    }).catch(error => {
      console.error('准备content script失败:', error);
    });
  }
});

// 检查content script是否准备好接收消息
function checkContentScriptReady(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: 'ping' }, response => {
      if (chrome.runtime.lastError) {
        // 只在开发环境显示此消息
        // console.log('Content script未准备好:', chrome.runtime.lastError.message);
        resolve(false);
      } else if (response && response.pong) {
        // console.log('Content script已准备好');
        resolve(true);
      } else {
        // console.log('Content script响应异常');
        resolve(false);
      }
    });
  });
}

// 注入content script
function injectContentScript(tabId) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    }).then(() => {
      // 等待content script初始化
      setTimeout(() => {
        // 再次检查是否准备好
        checkContentScriptReady(tabId).then(ready => {
          resolve(ready);
        }).catch(() => resolve(false));
      }, 500);
    }).catch(error => {
      console.error('注入content script失败:', error);
      resolve(false);
    });
  });
}

// 处理招呼语生成的主要逻辑
function handleGreetingGeneration(info, tab) {
  // 检查是否在允许的域名中
  chrome.storage.sync.get(['enabledDomains', 'enableAllDomains'], async (config) => {
    const url = new URL(tab.url);
    const domain = url.hostname;
    
    if (config.enableAllDomains || config.enabledDomains.includes(domain)) {
      // 获取配置和简历
      const { apiEndpoint, apiKey, modelCode, promptTemplate, resumes } = await chrome.storage.sync.get([
        'apiEndpoint',
        'apiKey',
        'modelCode',
        'promptTemplate',
        'resumes'
      ]);

      if (!apiEndpoint || !apiKey || resumes.length === 0) {
        sendMessageToTab(tab.id, {
          type: 'showError',
          message: '请先在插件选项中配置API信息和简历'
        });
        return;
      }

      // 发送消息到content script开始生成
      sendMessageToTab(tab.id, {
        type: 'startGeneration',
        selectedText: info.selectionText
      });

      try {
        // 构建prompt
        const actualPrompt = (promptTemplate || defaultConfig.promptTemplate)
          .replace(/{{JD}}/g, info.selectionText)
          .replace(/{{RESUME}}/g, resumes[0].content);

        // 调用API
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: modelCode,
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant."
              },
              {
                role: "user",
                content: actualPrompt
              }
            ],
            stream: true
          })
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let generatedText = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // 解码获取的数据块
            const chunk = decoder.decode(value, { stream: true });
            
            // 处理SSE格式的数据
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.substring(6));
                  if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                    generatedText += data.choices[0].delta.content;
                    
                    // 发送部分结果到content script
                    try {
                      chrome.tabs.sendMessage(tab.id, {
                        type: 'showResult',
                        result: generatedText
                      }).catch(error => {
                        console.log('发送部分结果失败:', error);
                      });
                    } catch (error) {
                      console.error('发送部分结果失败:', error);
                    }
                  }
                } catch (e) {
                  console.error('解析SSE数据失败:', e, line);
                }
              }
            }
          }
          
          // 发送最终结果到content script，并标记为最终结果
          try {
            chrome.tabs.sendMessage(tab.id, {
              type: 'showResult',
              result: generatedText,
              isFinalResult: true  // 标记这是最终结果
            }).catch(error => {
              console.log('发送最终结果失败:', error);
            });
          } catch (error) {
            console.error('发送最终结果失败:', error);
          }
        } catch (error) {
          console.error('处理流式响应失败:', error);
          throw error;
        }
      } catch (error) {
        sendMessageToTab(tab.id, {
          type: 'showError',
          message: '生成失败：' + error.message
        });
      }
    } else {
      sendMessageToTab(tab.id, {
        type: 'showError',
        message: '当前网站未启用AI招呼语生成功能'
      });
    }
  });
}

// 安全地发送消息到标签页
function sendMessageToTab(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    // 这里也可以减少日志输出，只保留关键错误信息
    // console.log(`发送消息${message.type}失败:`, error);
    // 这里我们只记录错误，不中断流程
  });
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ping') {
    // 用于检测content script是否已加载
    sendResponse({ pong: true });
    return true;
  } else if (message.type === 'getResumes') {
    chrome.storage.sync.get(['resumes'], (result) => {
      sendResponse({ resumes: result.resumes || [] });
    });
    return true;
  }
});
