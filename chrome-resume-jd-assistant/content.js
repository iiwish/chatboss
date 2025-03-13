// 创建弹窗样式
// 使用立即执行的函数表达式(IIFE)来避免变量泄露到全局作用域
(function() {
  // 检查是否已经存在样式元素，避免重复声明
  if (!document.querySelector('style#ai-greeting-modal-style')) {
    const style = document.createElement('style');
    style.id = 'ai-greeting-modal-style';
    style.textContent = `
.ai-greeting-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10000;
  width: 400px;
  max-width: 90vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}

.ai-greeting-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.ai-greeting-modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.ai-greeting-modal-status {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
  font-weight: normal;
}

.ai-greeting-modal-status.connecting {
  background-color: #f39c12;
  color: white;
}

.ai-greeting-modal-status.answering {
  background-color: #3498db;
  color: white;
}

.ai-greeting-modal-status.completed {
  background-color: #2ecc71;
  color: white;
}

.ai-greeting-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.ai-greeting-modal-content {
  margin-bottom: 15px;
  color: #333;
  line-height: 1.5;
}

.ai-greeting-modal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.ai-greeting-modal-loading::after {
  content: '';
  width: 30px;
  height: 30px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.ai-greeting-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.ai-greeting-modal-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.ai-greeting-modal-copy {
  background-color: #3498db;
  color: white;
}

.ai-greeting-modal-copy:hover {
  background-color: #2980b9;
}

.ai-greeting-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

  const title = document.createElement('h3');
  title.className = 'ai-greeting-modal-title';
  title.textContent = 'AI招呼语生成';
  
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
  title.appendChild(statusIndicator);

  const closeButton = document.createElement('button');
  closeButton.className = 'ai-greeting-modal-close';
  closeButton.textContent = '×';
  closeButton.onclick = () => {
    // 向background发送取消请求的消息
    chrome.runtime.sendMessage({ type: 'cancelGeneration' });
    // 移除弹窗
    overlay.remove();
  };

  header.appendChild(title);
  header.appendChild(closeButton);

  const content = document.createElement('div');
  content.className = 'ai-greeting-modal-content';

  modal.appendChild(header);
  modal.appendChild(content);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  return { overlay, content, statusIndicator };
}

// 显示思考中状态
function showLoading() {
  const { overlay, content } = createModal('connecting');
  content.className = 'ai-greeting-modal-loading';
}

// 显示结果
function showResult(result, isFinalResult = false) {
  // 检查是否已有弹窗，如果有则更新状态，如果没有则创建新弹窗
  let overlay = document.querySelector('.ai-greeting-modal-overlay');
  let statusIndicator;
  let content;
  
  if (overlay) {
    statusIndicator = overlay.querySelector('.ai-greeting-modal-status');
    content = overlay.querySelector('.ai-greeting-modal-content');
    
    // 如果是第一次收到结果，状态从思考中变为回答中
    if (statusIndicator.textContent === '思考中') {
      statusIndicator.className = 'ai-greeting-modal-status answering';
      statusIndicator.textContent = '回答中';
    }
    
    // 如果内容区域是加载动画，改为文本内容
    if (content.className === 'ai-greeting-modal-loading') {
      content.className = 'ai-greeting-modal-content';
    }
    
    // 更新内容
    content.textContent = result;
  } else {
    // 如果没有弹窗，创建一个新的
    const modal = createModal('answering');
    overlay = modal.overlay;
    content = modal.content;
    statusIndicator = modal.statusIndicator;
    content.textContent = result;
  }
  
  // 只有在最终结果时才添加复制按钮并更新状态为完成
  if (isFinalResult && !overlay.querySelector('.ai-greeting-modal-actions')) {

  const actions = document.createElement('div');
  actions.className = 'ai-greeting-modal-actions';

  const copyButton = document.createElement('button');
  copyButton.className = 'ai-greeting-modal-button ai-greeting-modal-copy';
  copyButton.textContent = '复制';
  copyButton.onclick = () => {
    navigator.clipboard.writeText(result).then(() => {
      copyButton.textContent = '已复制';
      setTimeout(() => {
        copyButton.textContent = '复制';
      }, 2000);
    });
  };

  actions.appendChild(copyButton);
  content.parentElement.appendChild(actions);
    
    // 更新状态为完成
    statusIndicator.className = 'ai-greeting-modal-status completed';
    statusIndicator.textContent = '完成';
  }
}

// 显示错误信息
function showError(message) {
  const { overlay, content } = createModal('completed');
  content.style.color = '#e74c3c';
  content.textContent = message;
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 响应ping请求，确认content script已加载
  if (message.type === 'ping') {
    sendResponse({ pong: true });
    return true;
  }

  // 移除所有现有的弹窗
  document.querySelectorAll('.ai-greeting-modal-overlay').forEach(el => el.remove());

  switch (message.type) {
    case 'startGeneration':
      showLoading();
      break;
    case 'showResult':
      // 检查是否是最终结果
      const isFinalResult = message.isFinalResult === true;
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
