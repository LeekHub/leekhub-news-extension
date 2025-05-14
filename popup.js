// 存储开关状态
let isImportantOnly = false;
let countdownInterval;
let secondsLeft = 30;

// 获取DOM元素
const importantOnlyToggle = document.getElementById('importantOnly');
const newsContainer = document.getElementById('newsContainer');
const countdownElement = document.getElementById('countdown');
const refreshButton = document.querySelector('.refresh-button');

// 更新倒计时
function updateCountdown() {
  secondsLeft--;
  if (secondsLeft <= 0) {
    secondsLeft = 30;
    updateNewsList();
  }
  countdownElement.textContent = secondsLeft;
}

// 重置倒计时
function resetCountdown() {
  clearInterval(countdownInterval);
  secondsLeft = 30;
  countdownElement.textContent = secondsLeft;
  countdownInterval = setInterval(updateCountdown, 1000);
}

// 从金十数据获取新闻
async function fetchNews() {
  try {
    const response = await fetch('https://www.jin10.com/flash_newest.js');
    const data = await response.text();
    // 解析JSONP数据
    const jsonData = JSON.parse(data.replace('var flash_newest = ', '').replace('var newest =', '').replace(';', ''));
    return jsonData.filter(item => item.type === 0 && (item.data.content || item.content));
  } catch (error) {
    console.error('获取新闻失败:', error);
    return [];
  }
}

// 复制文本到剪贴板
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制');
  } catch (err) {
    console.error('复制失败:', err);
    showToast('复制失败');
  }
}

// 显示提示信息
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 1500);
}

// 创建新闻项目元素
function createNewsItem(news) {
  const newsItem = document.createElement('div');
  newsItem.className = `news-item ${news.important ? 'important' : ''}`;

  const timeElement = document.createElement('div');
  timeElement.className = 'news-time';
  timeElement.textContent = news.time;

  const contentElement = document.createElement('div');
  contentElement.className = 'news-content';
  contentElement.innerHTML = news.data.content || news.content;

  const footerElement = document.createElement('div');
  footerElement.className = 'news-footer';

  // 添加来源和操作到同一行
  footerElement.innerHTML = `
    <span class="news-source">${news.data.source ? '来源: ' + news.data.source : ''}</span>
    <span class="news-actions">
      <a href="#" class="action-link copy-link">复制</a>
      <span class="separator">·</span>
      <a href="https://www.jin10.com" target="_blank" class="action-link detail-link">查看详情</a>
    </span>
  `;

  // 复制功能
  footerElement.querySelector('.copy-link').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyToClipboard(news.data.content || news.content);
  };

  newsItem.appendChild(timeElement);
  newsItem.appendChild(contentElement);
  newsItem.appendChild(footerElement);

  // 点击整个新闻项复制内容
  newsItem.onclick = () => {
    copyToClipboard(news.data.content || news.content);
  };

  return newsItem;
}

// 更新新闻列表
async function updateNewsList() {
  try {
    const news = await fetchNews();
    newsContainer.innerHTML = '';

    const filteredNews = isImportantOnly
      ? news.filter(item => item.important)
      : news;

    filteredNews.forEach(item => {
      const newsElement = createNewsItem(item);
      newsContainer.appendChild(newsElement);
    });

    // 重置倒计时
    resetCountdown();
  } catch (error) {
    console.error('更新新闻失败:', error);
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 从存储中获取开关状态
  chrome.storage.sync.get(['importantOnly'], (result) => {
    isImportantOnly = result.importantOnly || false;
    importantOnlyToggle.checked = isImportantOnly;
    updateNewsList();
  });

  // 监听开关变化
  importantOnlyToggle.addEventListener('change', (e) => {
    isImportantOnly = e.target.checked;
    chrome.storage.sync.set({ importantOnly: isImportantOnly });
    updateNewsList();
  });

  // 监听刷新按钮点击
  refreshButton.addEventListener('click', () => {
    updateNewsList();
  });

  // 启动倒计时
  countdownInterval = setInterval(updateCountdown, 1000);
});

// 处理点击新闻项目
newsContainer.addEventListener('click', (e) => {
  /*   const newsItem = e.target.closest('.news-item');
    if (newsItem) {
      // 在新标签页中打开金十数据网站
      chrome.tabs.create({ url: 'https://www.jin10.com' });
    } */
}); 