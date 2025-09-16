/**
 * 密码管理器内容脚本 - 增强版本
 * 专门处理CSDN等复杂网站的登录表单
 */

console.log('🔧 增强版本内容脚本已加载');

// ==================== 增强的表单检测函数 ====================

/**
 * 查找用户名输入框 - 增强版本
 * @returns {HTMLInputElement|null} 找到的用户名输入框
 */
function findUsernameField() {
    console.log('🔍 开始查找用户名输入框...');
    
    const selectors = [
        // 标准选择器
        'input[name="username"]',
        'input[name="user"]',
        'input[name="email"]',
        'input[name="login"]',
        'input[name="account"]',
        'input[type="email"]',
        
        // 扩展选择器（支持CSDN等复杂网站）
        'input[name="userName"]',
        'input[name="user_name"]',
        'input[name="loginName"]',
        'input[name="accountName"]',
        'input[name="phone"]',
        'input[name="mobile"]',
        'input[name="tel"]',
        'input[name="phoneNumber"]',
        'input[name="mobileNumber"]',
        
        // 中文占位符选择器
        'input[placeholder*="用户名"]',
        'input[placeholder*="用户"]',
        'input[placeholder*="邮箱"]',
        'input[placeholder*="手机号"]',
        'input[placeholder*="账号"]',
        'input[placeholder*="电话"]',
        'input[placeholder*="手机"]',
        'input[placeholder*="请输入用户名"]',
        'input[placeholder*="请输入邮箱"]',
        'input[placeholder*="请输入手机号"]',
        
        // 英文占位符选择器
        'input[placeholder*="email"]',
        'input[placeholder*="Email"]',
        'input[placeholder*="username"]',
        'input[placeholder*="user"]',
        'input[placeholder*="phone"]',
        'input[placeholder*="mobile"]',
        'input[placeholder*="account"]',
        'input[placeholder*="Enter email"]',
        'input[placeholder*="Enter username"]',
        'input[placeholder*="Enter phone"]',
        
        // ID选择器
        'input[id*="username"]',
        'input[id*="user"]',
        'input[id*="email"]',
        'input[id*="login"]',
        'input[id*="account"]',
        'input[id*="phone"]',
        'input[id*="mobile"]',
        'input[id*="tel"]',
        
        // 更宽泛的选择器
        'input[autocomplete="username"]',
        'input[autocomplete="email"]',
        'input[autocomplete="tel"]',
        'input[type="text"]:not([name*="password"]):not([name*="pass"]):not([name*="pwd"])',
        'input[type="email"]'
    ];
    
    for (const selector of selectors) {
        const fields = document.querySelectorAll(selector);
        for (const field of fields) {
            if (field.type !== 'password' && field.offsetParent !== null) {
                console.log('✅ 找到用户名输入框:', selector);
                console.log('📝 字段信息:', {
                    type: field.type,
                    name: field.name,
                    id: field.id,
                    placeholder: field.placeholder,
                    autocomplete: field.autocomplete,
                    className: field.className
                });
                return field;
            }
        }
    }
    
    console.log('❌ 未找到用户名输入框');
    return null;
}

/**
 * 查找密码输入框 - 增强版本
 * @returns {HTMLInputElement|null} 找到的密码输入框
 */
function findPasswordField() {
    console.log('🔍 开始查找密码输入框...');
    
    const selectors = [
        // 标准选择器
        'input[name="password"]',
        'input[name="pass"]',
        'input[name="pwd"]',
        'input[type="password"]',
        
        // 扩展选择器（支持CSDN等复杂网站）
        'input[name="userPassword"]',
        'input[name="user_password"]',
        'input[name="loginPassword"]',
        'input[name="accountPassword"]',
        'input[name="pwd"]',
        'input[name="passwd"]',
        'input[name="userPwd"]',
        'input[name="loginPwd"]',
        
        // 中文占位符选择器
        'input[placeholder*="密码"]',
        'input[placeholder*="password"]',
        'input[placeholder*="请输入密码"]',
        'input[placeholder*="输入密码"]',
        'input[placeholder*="登录密码"]',
        
        // 英文占位符选择器
        'input[placeholder*="Password"]',
        'input[placeholder*="pass"]',
        'input[placeholder*="Enter password"]',
        'input[placeholder*="Password"]',
        
        // ID选择器
        'input[id*="password"]',
        'input[id*="pass"]',
        'input[id*="pwd"]',
        'input[id*="userPassword"]',
        'input[id*="loginPassword"]',
        'input[id*="userPwd"]',
        'input[id*="loginPwd"]',
        
        // 更宽泛的选择器
        'input[type="password"]',
        'input[autocomplete="current-password"]',
        'input[autocomplete="new-password"]'
    ];
    
    for (const selector of selectors) {
        const fields = document.querySelectorAll(selector);
        for (const field of fields) {
            if (field.offsetParent !== null) {
                console.log('✅ 找到密码输入框:', selector);
                console.log('📝 字段信息:', {
                    type: field.type,
                    name: field.name,
                    id: field.id,
                    placeholder: field.placeholder,
                    autocomplete: field.autocomplete,
                    className: field.className
                });
                return field;
            }
        }
    }
    
    console.log('❌ 未找到密码输入框');
    return null;
}

// ==================== 增强的表单提交检测 ====================

/**
 * 检测表单提交事件 - 增强版本
 * 支持多种提交方式
 */
function setupEnhancedFormDetection() {
    console.log('🔍 设置增强的表单检测...');
    
    // 监听标准表单提交
    document.addEventListener('submit', (event) => {
        console.log('📝 检测到标准表单提交事件');
        handleFormSubmission(event);
    });
    
    // 监听按钮点击事件（处理JavaScript提交）
    document.addEventListener('click', (event) => {
        const target = event.target;
        
        // 检查是否是登录按钮
        if (isLoginButton(target)) {
            console.log('🔘 检测到登录按钮点击');
            setTimeout(() => {
                handleFormSubmission(null);
            }, 100); // 延迟处理，确保表单数据已更新
        }
    });
    
    // 监听键盘事件（处理回车提交）
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                console.log('⌨️ 检测到回车键提交');
                setTimeout(() => {
                    handleFormSubmission(null);
                }, 100);
            }
        }
    });
}

/**
 * 判断是否是登录按钮
 * @param {HTMLElement} element - 要检查的元素
 * @returns {boolean} 是否是登录按钮
 */
function isLoginButton(element) {
    if (!element) return false;
    
    const text = element.textContent?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    
    // 检查文本内容
    const loginTexts = ['登录', 'login', 'sign in', 'signin', 'submit', '提交', '确认'];
    if (loginTexts.some(loginText => text.includes(loginText))) {
        return true;
    }
    
    // 检查类名和ID
    const loginPatterns = ['login', 'signin', 'submit', 'btn-login', 'login-btn'];
    if (loginPatterns.some(pattern => className.includes(pattern) || id.includes(pattern))) {
        return true;
    }
    
    // 检查按钮类型
    if (element.type === 'submit') {
        return true;
    }
    
    return false;
}

/**
 * 处理表单提交
 * @param {Event|null} event - 表单提交事件
 */
function handleFormSubmission(event) {
    console.log('💾 处理表单提交...');
    
    const usernameField = findUsernameField();
    const passwordField = findPasswordField();
    
    if (usernameField && passwordField) {
        const username = usernameField.value.trim();
        const password = passwordField.value;
        
        console.log('📊 表单数据:', {
            username: username,
            passwordLength: password.length,
            domain: window.location.hostname
        });
        
        if (username && password) {
            console.log('💾 准备保存密码...');
            
            // 兼容Chrome和Firefox的API
            const api = typeof browser !== 'undefined' ? browser : chrome;
            api.runtime.sendMessage({
                action: 'savePassword',
                domain: window.location.hostname,
                username: username,
                password: password
            }).then(response => {
                if (response && response.success) {
                    console.log('✅ 密码保存成功');
                    showNotification('密码已自动保存');
                } else {
                    console.error('❌ 密码保存失败:', response);
                }
            }).catch(error => {
                console.error('❌ 发送保存密码消息时出错:', error);
            });
        } else {
            console.log('⚠️ 用户名或密码为空，跳过保存');
        }
    } else {
        console.log('⚠️ 未找到用户名或密码字段，跳过保存');
    }
}

// ==================== 增强的自动填充功能 ====================

/**
 * 自动填充已保存的密码 - 增强版本
 */
async function autoFillCredentials() {
    try {
        const domain = window.location.hostname;
        console.log('🌐 当前域名:', domain);
        
        // 兼容Chrome和Firefox的API
        const api = typeof browser !== 'undefined' ? browser : chrome;
        const settings = await api.storage.local.get(['autoFillEnabled', 'passwords']);
        const autoFillEnabled = settings.autoFillEnabled !== false;
        const passwords = settings.passwords || {};
        
        console.log('📊 自动填充设置:', { autoFillEnabled, passwordCount: Object.keys(passwords).length });
        
        if (!autoFillEnabled) {
            console.log('⏸️ 自动填充已禁用');
            return;
        }
        
        if (passwords[domain]) {
            const passwordData = passwords[domain];
            console.log('🔐 找到已保存的密码:', domain);
            
            const usernameField = findUsernameField();
            const passwordField = findPasswordField();
            
            if (usernameField && passwordField) {
                if (usernameField.value === passwordData.username && passwordField.value === passwordData.password) {
                    console.log('⏭️ 表单已包含相同的凭据，跳过自动填充');
                    return;
                }
                
                if (window.hasAutoFilled) {
                    console.log('⏭️ 已经自动填充过，跳过');
                    return;
                }
                
                setTimeout(() => {
                    fillCredentials(passwordData.username, passwordData.password);
                    showNotification(`已自动填充 ${domain} 的登录信息`);
                    window.hasAutoFilled = true;
                }, 300);
            } else {
                console.log('⚠️ 未找到用户名或密码输入框');
            }
        } else {
            console.log('ℹ️ 未找到已保存的密码:', domain);
        }
    } catch (error) {
        console.error('❌ 自动填充时出错:', error);
    }
}

/**
 * 填充凭据到表单
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
function fillCredentials(username, password) {
    const usernameField = findUsernameField();
    const passwordField = findPasswordField();
    
    let filledCount = 0;
    
    if (usernameField) {
        usernameField.value = username;
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ 已填充用户名:', username);
        filledCount++;
    }
    
    if (passwordField) {
        passwordField.value = password;
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ 已填充密码');
        filledCount++;
    }
    
    if (filledCount > 0) {
        showNotification('凭据已填充到表单中');
    }
}

/**
 * 显示通知
 * @param {string} message - 消息内容
 */
function showNotification(message) {
    const existingNotification = document.querySelector('.password-manager-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'password-manager-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// ==================== 消息监听处理 ====================

/**
 * 监听来自弹出窗口的消息
 */
const api = typeof browser !== 'undefined' ? browser : chrome;
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 收到消息:', request.action);
    
    switch (request.action) {
        case 'fillCredentials':
            fillCredentials(request.username, request.password);
            sendResponse({ success: true });
            break;
            
        case 'resetAutoFill':
            window.hasAutoFilled = false;
            console.log('🔄 已重置自动填充状态');
            sendResponse({ success: true });
            break;
            
        default:
            console.warn('⚠️ 未知的消息类型:', request.action);
            sendResponse({ success: false, error: '未知操作' });
    }
});

// ==================== 页面加载监听 ====================

let hasInitialCheck = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded 事件触发');
    if (!hasInitialCheck) {
        hasInitialCheck = true;
        setTimeout(() => {
            checkAndFillForm();
        }, 800);
    }
});

window.addEventListener('load', () => {
    console.log('📄 load 事件触发');
    if (!hasInitialCheck || !window.hasAutoFilled) {
        setTimeout(() => {
            checkAndFillForm();
        }, 1200);
    }
});

// ==================== 动态表单监听 ====================

let observer = null;
let observerTimeout = null;

function setupFormObserver() {
    if (observer) {
        observer.disconnect();
    }
    
    observer = new MutationObserver((mutations) => {
        if (observerTimeout) {
            clearTimeout(observerTimeout);
        }
        
        observerTimeout = setTimeout(() => {
            if (!window.hasAutoFilled) {
                const usernameField = findUsernameField();
                const passwordField = findPasswordField();
                
                if (usernameField && passwordField) {
                    console.log('🔍 检测到动态加载的登录表单');
                    autoFillCredentials();
                }
            }
        }, 1000);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

window.addEventListener('load', () => {
    setupFormObserver();
});

// ==================== 统一的表单检测和填充函数 ====================

function checkAndFillForm() {
    console.log('🔍 开始检测登录表单...');
    
    const usernameField = findUsernameField();
    const passwordField = findPasswordField();
    
    if (usernameField && passwordField) {
        console.log('✅ 检测到登录表单，尝试自动填充');
        console.log('📝 表单信息:', {
            usernameField: {
                type: usernameField.type,
                name: usernameField.name,
                id: usernameField.id,
                placeholder: usernameField.placeholder
            },
            passwordField: {
                type: passwordField.type,
                name: passwordField.name,
                id: passwordField.id,
                placeholder: passwordField.placeholder
            }
        });
        autoFillCredentials();
        return true;
    } else {
        console.log('ℹ️ 未检测到登录表单');
        return false;
    }
}

// ==================== 初始化 ====================

// 设置增强的表单检测
setupEnhancedFormDetection();

console.log('✅ 增强版本密码管理器内容脚本已加载');
console.log('🌐 当前页面:', window.location.href);
console.log('🔧 浏览器API:', typeof browser !== 'undefined' ? 'Firefox' : 'Chrome'); 