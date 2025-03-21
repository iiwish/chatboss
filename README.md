# ChatBoss - AI招呼语生成器

<div align="center">
  <img src="chrome-chat-boss/icons/icon128.png" alt="ChatBoss Logo" width="32">
</div>

## 📋 项目概述

ChatBoss是一款强大的Chrome浏览器扩展，专为求职者设计。它利用先进的AI技术，根据招聘岗位描述和您的个人简历，自动生成高度个性化、专业有力的求职打招呼语句。无论您是在LinkedIn、Indeed、BOSS直聘还是智联招聘等平台求职，ChatBoss都能帮助您以最佳方式展现自己，提高求职效率和成功率。

<div align="center">
  <img src="docs\img\result.png" alt="生成效果" width="780">
</div>

### 核心价值

- **节省时间**：无需反复撰写不同职位的自我介绍，一键生成专业招呼语
- **提高针对性**：根据职位JD自动匹配您简历中的相关技能和经验
- **增强竞争力**：生成的招呼语专业、个性化，能有效提高HR回复率
- **简单易用**：右键菜单集成，在任何招聘网站上直接使用

## 🚀 安装步骤

ChatBoss 目前提供两种安装方式，您可以根据自己的需求选择合适的方法：

### 方案一：直接安装 .crx 文件（推荐）

1. 访问项目的 [GitHub Releases](https://github.com/iiwish/chatboss/releases) 页面
2. 下载最新版本的 `chatboss.crx` 文件
3. 打开Chrome浏览器，进入扩展管理页面：`chrome://extensions/`
4. 将下载的 .crx 文件直接拖拽到浏览器的扩展管理页面中
5. 在弹出的安装确认对话框中点击"添加扩展程序"
6. ChatBoss图标将出现在浏览器工具栏中，表示安装成功

### 方案二：开发者模式安装（源码安装）

1. 下载本项目代码并解压
2. 打开Chrome浏览器，进入扩展管理页面：`chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择解压后的`chrome-chat-boss`目录
6. ChatBoss图标将出现在浏览器工具栏中，表示安装成功

<div align="center">
    <img src="docs\img\installed.png" alt="安装成功" width="780">
</div>

## ⚙️ 使用前配置

初次使用前，需要进行以下配置：

<div align="center">
    <img src="docs\img\config0.png" alt="配置介绍" width="780">
</div>

### 1. API配置设置

ChatBoss需要使用大语言模型API来生成招呼语。您可以使用DeepSeek等多种类似OpenAI的API服务。

1. 点击浏览器工具栏中的ChatBoss图标，然后点击"选项"
2. 在"API配置"部分，点击"添加新配置"
3. 填写以下信息：
   - 配置名称：为您的API配置起一个名称（如"DeepSeek R1"）
   - API接口地址：输入API的基础URL（如`https://api.deepseek.com`）
   - API密钥：您的API访问密钥
   - 模型代码：指定要使用的模型（如`deepseek-reasoner`）
   - 提示模板：已预设优化模板，您也可以自定义

> **注意**：如果您没有API密钥，可以在[DeepSeek官网](https://www.deepseek.com/)申请，或使用其他兼容的API服务。


<div align="center">
    <img src="docs\img\config1.png" alt="API配置" width="780">
</div>

### 2. 简历导入

您需要添加至少一份简历才能使用招呼语生成功能：

1. 在ChatBoss选项页面，滚动到"简历管理"部分
2. 为您的简历输入一个标题（如"产品经理简历"或"前端开发简历"）
3. 在文本框中粘贴您的简历内容
4. 点击"添加简历"按钮保存

> **重要**：为保护您的隐私，请不要在简历中包含真实姓名、电话号码等敏感个人信息！

您可以添加多份针对不同职位的简历版本，系统会智能匹配最适合当前岗位的内容。

<div align="center">
    <img src="docs\img\config2.png" alt="添加简历" width="780">
</div>

### 3. 网站设置（可选）

默认情况下，ChatBoss在所有网站上启用。您可以选择仅在特定招聘网站上启用此功能：

1. 在"网站设置"部分，取消勾选"在所有网站上启用"
2. 在输入框中添加您常用的招聘网站域名（如`zhipin.com`）
3. 点击"添加"按钮


<div align="center">
    <img src="docs\img\config3.png" alt="网站设置" width="780">
</div>

## 💡 使用流程

配置完成后，ChatBoss使用非常简单：

1. 访问任何招聘网站，找到感兴趣的职位描述
2. 选中包含职位要求的文本内容（JD部分）
3. 右键点击，从菜单中选择"ChatBoss：生成招呼语"
4. 系统将分析JD和您的简历，在页面上显示生成的个性化招呼语
5. 您可以直接复制生成的内容，用于求职沟通


<div align="center">
    <img src="docs\img\use.png" alt="使用" width="780">
</div>

## 🌟 主要功能

### 智能招呼语生成

- **高度个性化**：根据特定职位JD和您的简历自动匹配相关技能和经验
- **专业表达**：生成的招呼语简洁专业，突出您的核心竞争力
- **实时生成**：流式响应技术，快速展示生成结果

### 多API支持

- 支持DeepSeek等多种类似OpenAI的API服务
- 可添加多个API配置并随时切换
- 自定义提示模板，控制生成内容的风格和结构

### 简历管理

- 支持添加多份针对不同职位的简历版本
- 智能匹配最适合当前岗位的简历内容
- 本地存储，保护个人隐私

### 网站集成

- 右键菜单集成，在任何招聘网站上直接使用
- 可配置启用的网站域名，提高性能和安全性

## 🔧 技术架构

ChatBoss基于Chrome Extension Manifest V3开发，主要包含以下组件：

- **后台脚本**（background.js）：处理API请求和上下文菜单管理
- **内容脚本**（content.js）：处理页面交互和结果展示
- **选项页面**：管理用户配置和简历
- **弹出窗口**：提供快速访问和控制

数据存储使用Chrome Storage API，确保配置和简历安全存储在本地。

## 🔒 隐私声明

ChatBoss高度重视用户隐私：

- 所有数据（包括API密钥、简历内容）仅存储在本地，不会上传到任何服务器
- 生成招呼语时，会将选中的JD和您的简历发送到您配置的API服务
- 强烈建议不要在简历中包含敏感个人信息（如真实姓名、电话号码等）
- 您可以随时删除存储的简历和API配置
- 可限制特定网站使用，进一步提高安全性

## ❓ 常见问题

### 为什么我看不到右键菜单选项？

确保您已：
1. 选中了页面上的文本（职位描述）
2. 当前网站在允许的域名列表中（如果您限制了特定网站）
3. 扩展已正确安装并启用

### 生成的招呼语质量不高怎么办？

您可以：
1. 选中更完整的职位描述信息
2. 优化您的简历内容，确保包含关键技能和经验
3. 在API配置中调整提示模板，增加更具体的生成指导
4. 更换更智能的LLM模型

### 如何更换API服务？

1. 在选项页面添加新的API配置
2. 在右上角扩展项中点击ChatBoss图标，选择需要指定的API名称

### 是否支持多语言？

是的，ChatBoss可以根据您的需求生成多语言招呼语，这取决于您使用的API模型和提示模板设置。

## 🔮 未来更新计划

我们计划在未来版本中添加以下功能：

- **更多API服务预设**：预设更多大语言模型API服务
- **更高维度的浏览器Chat插件**：更强大的LLMs助手chrome插件。

---

## 📄 开源协议

本项目采用 [MIT 许可证](https://github.com/iiwish/chatboss/blob/main/LICENSE) 进行开源。您可以自由地使用、修改和分发本项目，但需要保留原始版权声明和许可证文本。

---

## 📱 联系与支持

如遇到任何问题或有功能建议，请通过以下方式联系我们：

- 提交Issues：[GitHub Issues链接](https://github.com/iiwish/chatboss/issues)
- 电子邮件：[v123vip@163.com](mailto:v123vip@163.com)

---

<div align="center">
  <p>© 2025 ChatBoss Team. All Rights Reserved.</p>
</div>