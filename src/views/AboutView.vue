<template>
  <div class="about-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">关于 armory</h1>
        <p class="page-subtitle">一站式在线工具集合</p>
      </div>

      <div class="about-content">
        <div class="about-card">
          <h2>项目简介</h2>
          <p>Armory 是一款功能丰富的纯 Web 工具库，为开发者和普通用户提供各种实用工具，包括编码解码、加密解密、格式转换、开发辅助等功能。</p>
          <p>我们的目标是创建一个简洁、高效、易用的工具库，让您的日常工作与开发任务更加便捷。</p>
        </div>

        <div class="about-card">
          <h2>主要功能</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🔐</div>
              <h3>加密解密</h3>
              <p>提供多种加密算法，包括AES、RSA等</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔄</div>
              <h3>编码解码</h3>
              <p>支持Base64、URL、HTML等多种编码格式</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📝</div>
              <h3>格式转换</h3>
              <p>JSON、XML、SQL等多种格式转换工具</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛠️</div>
              <h3>生成器</h3>
              <p>UUID、密码、二维码等生成工具</p>
            </div>
          </div>
        </div>

        <div class="about-card">
          <h2>技术栈</h2>
          <div class="tech-stack">
            <div class="tech-item">Vue 3</div>
            <div class="tech-item">Vite</div>
            <div class="tech-item">Element Plus</div>
            <div class="tech-item">JavaScript</div>
            <div class="tech-item">CSS3</div>
          </div>
        </div>

        <div class="about-card">
          <h2>版本信息</h2>
          <div class="version-info">
            <div class="version-item">
              <span class="label">当前版本：</span>
              <span class="value">v1.0.0</span>
            </div>
            <div class="version-item">
              <span class="label">更新时间：</span>
              <span class="value">2025-12-01</span>
            </div>
            <div class="version-item">
              <span class="label">开发团队：</span>
              <span class="value">armory Team</span>
            </div>
          </div>
        </div>

        <div class="about-card">
          <h2>联系我们</h2>
          <div class="contact-info">
            <p>如果您有任何问题或建议，欢迎联系我们：</p>
            <div class="contact-item">
              <span class="contact-label">GitHub：</span>
              <a href="https://github.com/nonex-code/armory" target="_blank" class="contact-value">https://github.com/nonex-code/armory</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 页面元数据
document.title = '关于 - armory';
</script>

<style scoped>
.about-page {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-title {
  font-size: 2.5rem;
  color: #303133;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #606266;
}

.about-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.about-card {
  background: #fff;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.about-card h2 {
  font-size: 1.5rem;
  color: #303133;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 15px;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature-item h3 {
  font-size: 1.1rem;
  color: #303133;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 0.9rem;
  color: #606266;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-item {
  background-color: #f0f2f5;
  color: #409eff;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.version-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.version-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.version-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #606266;
}

.value {
  color: #303133;
}

.contact-info {
  line-height: 1.6;
}

.contact-item {
  margin: 10px 0;
}

.contact-label {
  font-weight: 500;
  color: #606266;
}

.contact-value {
  color: #409eff;
  text-decoration: none;
}

.contact-value:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .version-item {
    flex-direction: column;
    gap: 5px;
  }
}
</style>