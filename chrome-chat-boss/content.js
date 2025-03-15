// 创建弹窗样式
// 使用立即执行的函数表达式(IIFE)来避免变量泄露到全局作用域
(function() {
  // 检查是否已经存在样式元素，避免重复声明
  if (!document.querySelector('style#ai-greeting-modal-style')) {
    const style = document.createElement('style');
    style.id = 'ai-greeting-modal-style';
    style.textContent = `
:root {
  --primary-color: #4a6cf7;
  --primary-hover: #3a5ce5;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --error-color: #dc3545;
  --text-primary: #212529;
  --text-secondary: #495057;
  --bg-color: #ffffff;
  --border-color: #dee2e6;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --border-radius-sm: 4px;
  --border-radius-md: 6px;
  --border-radius-lg: 8px;
}

.ai-greeting-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-color);
  padding: 24px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 10000;
  width: 450px;
  max-width: 90vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  animation: modal-fade-in 0.3s ease-out;
}

.ai-greeting-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.ai-greeting-modal-title-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-greeting-modal-logo {
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.ai-greeting-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.ai-greeting-modal-status {
  display: inline-block;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  margin-left: 10px;
  font-weight: 500;
}

.ai-greeting-modal-status.connecting {
  background-color: var(--warning-color);
  color: #212529;
}

.ai-greeting-modal-status.answering {
  background-color: var(--info-color);
  color: white;
}

.ai-greeting-modal-status.completed {
  background-color: var(--success-color);
  color: white;
}

.ai-greeting-modal-close {
  background: none;
  border: none;
  font-size: 22px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.ai-greeting-modal-close:hover {
  color: var(--text-primary);
}

.ai-greeting-modal-content {
  margin-bottom: 16px;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 15px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.ai-greeting-modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  gap: 15px;
}

.ai-greeting-modal-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(74, 108, 247, 0.2);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ai-greeting-modal-loading-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.ai-greeting-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
}

.ai-greeting-modal-button {
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.ai-greeting-modal-copy {
  background-color: var(--primary-color);
  color: white;
}

.ai-greeting-modal-copy:hover {
  background-color: var(--primary-hover);
}

.ai-greeting-modal-cancel {
  background-color: #f8f9fa;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.ai-greeting-modal-cancel:hover {
  background-color: #e9ecef;
}

.ai-greeting-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  animation: overlay-fade-in 0.2s ease-out;
}

.ai-greeting-modal-tip {
  margin-top: 12px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  color: var(--text-secondary);
  border-left: 3px solid var(--info-color);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes overlay-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
`;
    document.head.appendChild(style);
  }
})();

// 创建弹窗
function createModal(status = 'connecting') {
  const overlay = document.createElement('div');
  overlay.className = 'ai-greeting-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'ai-greeting-modal';

  const header = document.createElement('div');
  header.className = 'ai-greeting-modal-header';

  const titleContainer = document.createElement('div');
  titleContainer.className = 'ai-greeting-modal-title-container';
  
  const logo = document.createElement('div');
  logo.className = 'ai-greeting-modal-logo';
  logo.textContent = 'AI';
  
  const title = document.createElement('h3');
  title.className = 'ai-greeting-modal-title';
  title.textContent = 'AI招呼语生成';
  
  titleContainer.appendChild(logo);
  titleContainer.appendChild(title);
  
  // 添加状态指示器
  const statusIndicator = document.createElement('span');
  statusIndicator.className = `ai-greeting-modal-status ${status}`;
  
  // 根据状态设置文本
  if (status === 'connecting') {
    statusIndicator.textContent = '思考中';
  } else if (status === 'answering') {
    statusIndicator.textContent = '回答中';
  } else if (status === 'completed') {
    statusIndicator.textContent = '完成';
  }
  titleContainer.appendChild(statusIndicator);

  const closeButton = document.createElement('button');
  closeButton.className = 'ai-greeting-modal-close';
  closeButton.textContent = '×';
  closeButton.title = '关闭窗口';
  closeButton.onclick = () => {
    // 向background发送取消请求的消息
    chrome.runtime.sendMessage({ type: 'cancelGeneration' });
    // 移除弹窗
    overlay.remove();
  };

  header.appendChild(titleContainer);
  header.appendChild(closeButton);

  const content = document.createElement('div');
  content.className = 'ai-greeting-modal-content';

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return { overlay, modal, content, statusIndicator };
}

// 显示思考中状态
function showLoading() {
  const { overlay, content } = createModal('connecting');
  content.className = 'ai-greeting-modal-loading';
  
  const spinner = document.createElement('div');
  spinner.className = 'ai-greeting-modal-spinner';
  
  const loadingText = document.createElement('div');
  loadingText.className = 'ai-greeting-modal-loading-text';
  loadingText.textContent = '正在分析JD和简历，生成个性化招呼语...';
  
  content.appendChild(spinner);
  content.appendChild(loadingText);
  
  // 添加提示信息
  const tip = document.createElement('div');
  tip.className = 'ai-greeting-modal-tip';
  tip.textContent = '提示：生成的招呼语会根据您的简历和所选JD进行个性化定制，突出您的匹配优势。';
  
  content.parentElement.appendChild(tip);
}

// 显示结果
function showResult(result, isFinalResult = false) {
  // 检查是否已有弹窗，如果有则更新状态，如果没有则创建新弹窗
  let overlay = document.querySelector('.ai-greeting-modal-overlay');
  let modal;
  let statusIndicator;
  let content;
  
  if (overlay) {
    modal = overlay.querySelector('.ai-greeting-modal');
    statusIndicator = overlay.querySelector('.ai-greeting-modal-status');
    
    // 如果是第一次收到结果，状态从思考中变为回答中
    if (statusIndicator.textContent === '思考中') {
      statusIndicator.className = 'ai-greeting-modal-status answering';
      statusIndicator.textContent = '回答中';
    }
    
    // 检查是否是加载状态
    const loadingContent = overlay.querySelector('.ai-greeting-modal-loading');
    if (loadingContent) {
      // 创建新的内容区域替换加载区域
      content = document.createElement('div');
      content.className = 'ai-greeting-modal-content';
      content.textContent = result;
      
      // 替换加载区域
      loadingContent.parentNode.replaceChild(content, loadingContent);
      
      // 移除提示信息
      const tip = overlay.querySelector('.ai-greeting-modal-tip');
      if (tip) tip.remove();
    } else {
      // 如果不是加载状态，获取正常的内容区域
      content = overlay.querySelector('.ai-greeting-modal-content');
      content.textContent = result;
    }
  } else {
    // 如果没有弹窗，创建一个新的
    const modalObj = createModal('answering');
    overlay = modalObj.overlay;
    modal = modalObj.modal;
    content = modalObj.content;
    statusIndicator = modalObj.statusIndicator;
    content.textContent = result;
  }
  
  // 如果是最终结果
  if (isFinalResult) {
    // 更新状态为完成
    statusIndicator.className = 'ai-greeting-modal-status completed';
    statusIndicator.textContent = '完成';
    
    // 只有在没有添加过操作按钮时才添加
    if (!overlay.querySelector('.ai-greeting-modal-actions')) {
      const actions = document.createElement('div');
      actions.className = 'ai-greeting-modal-actions';

      const copyButton = document.createElement('button');
      copyButton.className = 'ai-greeting-modal-button ai-greeting-modal-copy';
      copyButton.textContent = '复制招呼语';
      copyButton.onclick = () => {
        navigator.clipboard.writeText(result).then(() => {
          copyButton.textContent = '✓ 已复制';
          setTimeout(() => {
            copyButton.textContent = '复制招呼语';
          }, 2000);
        });
      };
      
      const cancelButton = document.createElement('button');
      cancelButton.className = 'ai-greeting-modal-button ai-greeting-modal-cancel';
      cancelButton.textContent = '关闭';
      cancelButton.onclick = () => {
        overlay.remove();
      };

      actions.appendChild(cancelButton);
      actions.appendChild(copyButton);
      modal.appendChild(actions);
      
      // 添加使用提示
      const tip = document.createElement('div');
      tip.className = 'ai-greeting-modal-tip';
      tip.textContent = '提示：您可以在设置中添加多份简历，系统会自动选择最匹配的内容生成招呼语。';
      modal.appendChild(tip);
    }
  }
}


// 显示错误信息
function showError(message) {
  const { overlay, modal, content } = createModal('completed');
  content.style.color = 'var(--error-color)';
  content.textContent = message;
  
  // 添加关闭按钮
  const actions = document.createElement('div');
  actions.className = 'ai-greeting-modal-actions';
  
  const closeButton = document.createElement('button');
  closeButton.className = 'ai-greeting-modal-button ai-greeting-modal-cancel';
  closeButton.textContent = '关闭';
  closeButton.onclick = () => {
    overlay.remove();
  };
  
  actions.appendChild(closeButton);
  modal.appendChild(actions);
  
  // 添加帮助提示
  const tip = document.createElement('div');
  tip.className = 'ai-greeting-modal-tip';
  tip.innerHTML = '如需帮助，请点击扩展图标，然后点击"打开设置"检查您的配置。';
  modal.appendChild(tip);
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 响应ping请求，确认content script已加载
  if (message.type === 'ping') {
    sendResponse({ pong: true });
    return true;
  }

  // 只有在开始新生成或显示错误时才移除现有弹窗
  // 对于流式更新的结果，不应该移除弹窗
  if (message.type === 'startGeneration' || message.type === 'showError') {
    document.querySelectorAll('.ai-greeting-modal-overlay').forEach(el => el.remove());
  }

  switch (message.type) {
    case 'startGeneration':
      showLoading();
      break;
    case 'showResult':
      // 检查是否是最终结果
      const isFinalResult = message.isFinalResult === true;
      // 确保在调用showResult前，消息已经被正确处理
      console.log('收到结果更新，是否为最终结果:', isFinalResult);
      showResult(message.result, isFinalResult);
      break;
    case 'showError':
      showError(message.message);
      break;
  }
  
  // 发送响应以避免"消息端口关闭"错误
  sendResponse({success: true});
  return true; // 表示会异步发送响应
});
