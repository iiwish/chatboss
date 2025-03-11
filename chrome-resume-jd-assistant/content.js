// 创建弹窗样式
const style = document.createElement('style');
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

// 创建弹窗
function createModal() {
  const overlay = document.createElement('div');
  overlay.className = 'ai-greeting-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'ai-greeting-modal';

  const header = document.createElement('div');
  header.className = 'ai-greeting-modal-header';

  const title = document.createElement('h3');
  title.className = 'ai-greeting-modal-title';
  title.textContent = 'AI招呼语生成';

  const closeButton = document.createElement('button');
  closeButton.className = 'ai-greeting-modal-close';
  closeButton.textContent = '×';
  closeButton.onclick = () => {
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

  return { overlay, content };
}

// 显示加载中状态
function showLoading() {
  const { overlay, content } = createModal();
  content.className = 'ai-greeting-modal-loading';
}

// 显示结果
function showResult(result) {
  const { overlay, content } = createModal();
  content.textContent = result;

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
}

// 显示错误信息
function showError(message) {
  const { overlay, content } = createModal();
  content.style.color = '#e74c3c';
  content.textContent = message;
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 移除所有现有的弹窗
  document.querySelectorAll('.ai-greeting-modal-overlay').forEach(el => el.remove());

  switch (message.type) {
    case 'startGeneration':
      showLoading();
      break;
    case 'showResult':
      showResult(message.result);
      break;
    case 'showError':
      showError(message.message);
      break;
  }
});
