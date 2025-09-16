/**
 * 密码管理器弹出窗口脚本
 * 负责管理用户界面交互、密码存储、导出功能等
 */

// ==================== 浏览器兼容性检测 ====================

/**
 * 检测当前浏览器类型
 * @returns {string} 浏览器类型 ('chrome', 'firefox', 'edge', 'safari', 'unknown')
 */
function detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('firefox')) {
        return 'firefox';
    } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
        return 'chrome';
    } else if (userAgent.includes('edg')) {
        return 'edge';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        return 'safari';
    } else {
        return 'unknown';
    }
}

/**
 * 获取浏览器兼容的API对象
 * @returns {Object} 浏览器API对象
 */
function getBrowserAPI() {
    const browserType = detectBrowser();
    
    // Firefox使用browser API，其他使用chrome API
    if (browserType === 'firefox' && typeof browser !== 'undefined') {
        return browser;
    } else if (typeof chrome !== 'undefined') {
        return chrome;
    } else {
        throw new Error('不支持的浏览器：缺少必要的扩展API');
    }
}

/**
 * 检查浏览器功能支持
 * @returns {Object} 支持的功能列表
 */
function checkBrowserSupport() {
    const support = {
        webCrypto: typeof crypto !== 'undefined' && crypto.subtle,
        webExtensions: typeof chrome !== 'undefined' || typeof browser !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        webStorage: typeof Storage !== 'undefined'
    };
    
    console.log('🔍 浏览器功能支持检测:', support);
    return support;
}

// ==================== 工具函数 ====================

/**
 * 获取当前活动标签页
 * @returns {Promise<browser.tabs.Tab>} 当前标签页对象
 */
async function getCurrentTab() {
    const api = getBrowserAPI();
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    return tab;
}

/**
 * 从URL中提取域名
 * @param {string} url - 完整的URL
 * @returns {string} 域名
 */
function getDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        console.error('❌ 解析URL时出错:', e);
        return '';
    }
}

/**
 * 显示通知消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        info: '#2196F3'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${colors[type]};
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== 密码存储管理 ====================

/**
 * 保存密码到本地存储
 * @param {string} domain - 网站域名
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
async function savePassword(domain, username, password) {
    try {
        const passwords = await getPasswords();
        passwords[domain] = {
            username,
            password,
            timestamp: Date.now()
        };
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        await api.storage.local.set({ passwords });
        console.log('✅ 密码保存成功:', domain);
    } catch (error) {
        console.error('❌ 保存密码时出错:', error);
        throw error;
    }
}

/**
 * 从本地存储获取所有密码
 * @returns {Promise<Object>} 密码对象
 */
async function getPasswords() {
    try {
        const api = getBrowserAPI();
        const result = await api.storage.local.get('passwords');
        return result.passwords || {};
    } catch (error) {
        console.error('❌ 获取密码时出错:', error);
        return {};
    }
}

/**
 * 删除指定域名的密码
 * @param {string} domain - 要删除的域名
 */
async function deletePassword(domain) {
    try {
        const passwords = await getPasswords();
        delete passwords[domain];
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        await api.storage.local.set({ passwords });
        await displayPasswords();
        console.log(`✅ 已删除 ${domain} 的密码`);
        showNotification(`已删除 ${domain} 的密码`, 'success');
    } catch (error) {
        console.error('❌ 删除密码时出错:', error);
        showNotification('删除失败', 'error');
    }
}

// ==================== 密码列表显示 ====================

/**
 * 显示已保存的密码列表
 */
async function displayPasswords() {
    try {
        const passwords = await getPasswords();
        const passwordList = document.getElementById('passwordList');
        
        if (Object.keys(passwords).length === 0) {
            passwordList.innerHTML = '<div class="no-passwords">暂无保存的密码</div>';
            return;
        }
        
        passwordList.innerHTML = '';
        
        // 按时间戳排序，最新的在前面
        const sortedEntries = Object.entries(passwords).sort((a, b) => {
            return (b[1].timestamp || 0) - (a[1].timestamp || 0);
        });
        
        sortedEntries.forEach(([domain, data]) => {
            const item = document.createElement('div');
            item.className = 'password-item';
            
            const siteDiv = document.createElement('div');
            siteDiv.className = 'site';
            siteDiv.textContent = domain;
            
            const usernameDiv = document.createElement('div');
            usernameDiv.className = 'username';
            usernameDiv.textContent = `用户名: ${data.username}`;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'actions';
            
            const fillBtn = document.createElement('button');
            fillBtn.className = 'btn btn-small';
            fillBtn.textContent = '填充';
            fillBtn.addEventListener('click', () => fillPassword(domain));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-small';
            deleteBtn.textContent = '删除';
            deleteBtn.addEventListener('click', () => deletePassword(domain));
            
            actionsDiv.appendChild(fillBtn);
            actionsDiv.appendChild(deleteBtn);
            
            item.appendChild(siteDiv);
            item.appendChild(usernameDiv);
            item.appendChild(actionsDiv);
            
            passwordList.appendChild(item);
        });
        
        console.log(`📋 显示 ${Object.keys(passwords).length} 个已保存的密码`);
    } catch (error) {
        console.error('❌ 显示密码列表时出错:', error);
    }
}

// ==================== 密码填充功能 ====================

/**
 * 填充密码到当前页面
 * @param {string} domain - 要填充的域名
 */
async function fillPassword(domain) {
    try {
        const passwords = await getPasswords();
        const passwordData = passwords[domain];
        
        if (passwordData) {
                    const tab = await getCurrentTab();
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        await api.tabs.sendMessage(tab.id, {
            action: 'fillCredentials',
            username: passwordData.username,
            password: passwordData.password
        });
            console.log('✅ 已发送填充消息到内容脚本');
            showNotification('已发送填充指令', 'success');
        } else {
            console.log('⚠️ 未找到该域名的密码数据');
            showNotification('未找到密码数据', 'error');
        }
    } catch (error) {
        console.error('❌ 填充密码时出错:', error);
        showNotification('填充失败，请检查控制台错误信息', 'error');
    }
}

// ==================== 自动填充设置 ====================

/**
 * 获取自动填充设置
 * @returns {Promise<boolean>} 是否启用自动填充
 */
async function getAutoFillSetting() {
    try {
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        const result = await api.storage.local.get('autoFillEnabled');
        return result.autoFillEnabled !== false; // 默认启用
    } catch (error) {
        console.error('❌ 获取自动填充设置时出错:', error);
        return true;
    }
}

/**
 * 保存自动填充设置
 * @param {boolean} enabled - 是否启用自动填充
 */
async function setAutoFillSetting(enabled) {
    try {
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        await api.storage.local.set({ autoFillEnabled: enabled });
        console.log(`✅ 自动填充设置已更新: ${enabled}`);
    } catch (error) {
        console.error('❌ 保存自动填充设置时出错:', error);
    }
}

// ==================== 导出功能 ====================

/**
 * 生成随机IV（初始化向量）
 * @returns {Uint8Array} 16字节的随机IV
 */
function generateIV() {
    return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * 使用AES-GCM加密数据
 * @param {string} data - 要加密的数据
 * @param {string} password - 加密密码
 * @returns {Promise<string>} 加密后的数据（Base64格式）
 */
async function encryptData(data, password) {
    try {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = generateIV();
        
        // 使用PBKDF2派生密钥
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt']
        );
        
        // 加密数据
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encoder.encode(data)
        );
        
        // 组合salt、iv和加密数据
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('❌ 加密数据时出错:', error);
        throw new Error('加密失败');
    }
}

/**
 * 导出密码数据
 * @param {string} format - 导出格式 ('encrypted' 或 'plain')
 * @param {string} password - 导出密码（仅加密模式需要）
 */
async function exportPasswords(format, password = '') {
    try {
        const passwords = await getPasswords();
        const exportData = {
            version: '1.0',
            timestamp: Date.now(),
            passwords: passwords
        };
        
        let exportContent = '';
        let filename = '';
        
        if (format === 'encrypted') {
            if (!password || password.length < 8) {
                throw new Error('加密导出需要至少8位密码');
            }
            
            const jsonData = JSON.stringify(exportData, null, 2);
            const encryptedContent = await encryptData(jsonData, password);
            exportContent = JSON.stringify({
                encrypted: true,
                data: encryptedContent,
                version: '1.0',
                timestamp: Date.now()
            }, null, 2);
            filename = `passwords_encrypted_${new Date().toISOString().slice(0, 10)}.json`;
        } else {
            exportContent = JSON.stringify(exportData, null, 2);
            filename = `passwords_plain_${new Date().toISOString().slice(0, 10)}.json`;
        }
        
        // 创建下载链接
        const blob = new Blob([exportContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ 密码导出成功');
        showNotification('密码导出成功', 'success');
        
        // 关闭导出模态框
        document.getElementById('exportModal').style.display = 'none';
        
    } catch (error) {
        console.error('❌ 导出密码时出错:', error);
        showNotification(`导出失败: ${error.message}`, 'error');
    }
}

// ==================== 密码强度检测 ====================

/**
 * 检测密码强度
 * @param {string} password - 要检测的密码
 * @returns {string} 密码强度 ('weak', 'medium', 'strong')
 */
function checkPasswordStrength(password) {
    if (password.length < 8) return 'weak';
    
    let score = 0;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
}

/**
 * 显示密码强度指示器
 * @param {string} password - 密码
 */
function showPasswordStrength(password) {
    const strengthDiv = document.getElementById('passwordStrength');
    const strength = checkPasswordStrength(password);
    
    if (password.length === 0) {
        strengthDiv.style.display = 'none';
        return;
    }
    
    strengthDiv.style.display = 'block';
    strengthDiv.className = `password-strength ${strength}`;
    
    const messages = {
        weak: '密码强度: 弱',
        medium: '密码强度: 中等',
        strong: '密码强度: 强'
    };
    
    strengthDiv.textContent = messages[strength];
}

// ==================== 模态框管理 ====================

/**
 * 显示导出设置模态框
 */
function showExportModal() {
    const modal = document.getElementById('exportModal');
    modal.style.display = 'block';
    
    // 重置表单
    document.getElementById('exportFormat').value = 'encrypted';
    document.getElementById('exportPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('passwordStrength').style.display = 'none';
    
    // 显示密码设置区域
    document.getElementById('passwordSection').style.display = 'block';
}

/**
 * 隐藏导出设置模态框
 */
function hideExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

// ==================== 初始化函数 ====================

/**
 * 初始化弹出窗口
 */
async function initPopup() {
    try {
        const tab = await getCurrentTab();
        const domain = getDomain(tab.url);
        
        // 显示当前网站
        document.getElementById('currentSite').textContent = `当前网站: ${domain}`;
        
        // 显示已保存的密码
        await displayPasswords();
        
        // 如果当前网站有保存的密码，自动填充到输入框
        const passwords = await getPasswords();
        if (passwords[domain]) {
            document.getElementById('username').value = passwords[domain].username;
            document.getElementById('password').value = passwords[domain].password;
        }
        
        // 设置自动填充开关状态
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        const autoFillEnabled = await getAutoFillSetting();
        document.getElementById('autoFillToggle').checked = autoFillEnabled;
        
        console.log('✅ 弹出窗口初始化完成');
    } catch (error) {
        console.error('❌ 初始化弹出窗口时出错:', error);
    }
}

// ==================== 事件监听器 ====================

/**
 * 设置所有事件监听器
 */
function setupEventListeners() {
    // 保存密码按钮
    document.getElementById('saveBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            const domain = getDomain(tab.url);
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!domain) {
                showNotification('无法获取当前网站信息', 'error');
                return;
            }
            
            if (!username || !password) {
                showNotification('请输入用户名和密码', 'error');
                return;
            }
            
            await savePassword(domain, username, password);
            await displayPasswords();
            showNotification('密码保存成功！', 'success');
        } catch (error) {
            console.error('❌ 保存密码时出错:', error);
            showNotification('保存失败', 'error');
        }
    });
    
    // 填充到页面按钮
    document.getElementById('fillBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            const domain = getDomain(tab.url);
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showNotification('请先输入用户名和密码', 'error');
                return;
            }
            
            // 兼容Chrome和Firefox的API
            const api = getBrowserAPI();
            await api.tabs.sendMessage(tab.id, {
                action: 'fillCredentials',
                username: username,
                password: password
            });
            console.log('✅ 已发送填充消息到内容脚本');
            showNotification('已发送填充指令', 'success');
        } catch (error) {
            console.error('❌ 填充密码时出错:', error);
            showNotification('填充失败，请检查控制台错误信息', 'error');
        }
    });
    
    // 重置状态按钮
    document.getElementById('resetBtn').addEventListener('click', async () => {
        try {
            const tab = await getCurrentTab();
            // 兼容Chrome和Firefox的API
            const api = getBrowserAPI();
            await api.tabs.sendMessage(tab.id, {
                action: 'resetAutoFill'
            });
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            showNotification('状态已重置', 'success');
        } catch (error) {
            console.error('❌ 重置状态时出错:', error);
        }
    });
    
    // 导出按钮
    document.getElementById('exportBtn').addEventListener('click', () => {
        showExportModal();
    });
    
    // 解密工具按钮
    document.getElementById('decryptBtn').addEventListener('click', () => {
        // 兼容Chrome和Firefox的API
        const api = getBrowserAPI();
        api.tabs.create({ url: api.runtime.getURL('decrypt-passwords.html') });
    });
    
    // 清空所有按钮
    document.getElementById('clearAllBtn').addEventListener('click', async () => {
        if (confirm('确定要清空所有保存的密码吗？此操作不可恢复。')) {
            try {
                // 兼容Chrome和Firefox的API
                const api = getBrowserAPI();
                await api.storage.local.set({ passwords: {} });
                await displayPasswords();
                showNotification('已清空所有密码', 'success');
            } catch (error) {
                console.error('❌ 清空密码时出错:', error);
                showNotification('清空失败', 'error');
            }
        }
    });
    
    // 自动填充开关
    document.getElementById('autoFillToggle').addEventListener('change', async (e) => {
        await setAutoFillSetting(e.target.checked);
        showNotification(`自动填充已${e.target.checked ? '启用' : '禁用'}`, 'success');
    });
    
    // 导出格式选择
    document.getElementById('exportFormat').addEventListener('change', (e) => {
        const passwordSection = document.getElementById('passwordSection');
        if (e.target.value === 'encrypted') {
            passwordSection.style.display = 'block';
        } else {
            passwordSection.style.display = 'none';
        }
    });
    
    // 导出密码输入框
    document.getElementById('exportPassword').addEventListener('input', (e) => {
        showPasswordStrength(e.target.value);
    });
    
    // 确认密码输入框
    document.getElementById('confirmPassword').addEventListener('input', (e) => {
        const exportPassword = document.getElementById('exportPassword').value;
        const confirmPassword = e.target.value;
        
        if (confirmPassword && exportPassword !== confirmPassword) {
            e.target.style.borderColor = '#f44336';
        } else {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        }
    });
    
    // 取消导出按钮
    document.getElementById('cancelExport').addEventListener('click', () => {
        hideExportModal();
    });
    
    // 确认导出按钮
    document.getElementById('confirmExport').addEventListener('click', async () => {
        const format = document.getElementById('exportFormat').value;
        const password = document.getElementById('exportPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (format === 'encrypted') {
            if (!password || password.length < 8) {
                showNotification('加密导出需要至少8位密码', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('两次输入的密码不一致', 'error');
                return;
            }
        }
        
        await exportPasswords(format, password);
    });
}

// ==================== 主函数 ====================

/**
 * 页面加载完成后的初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 弹出窗口开始初始化');
    
    try {
        await initPopup();
        setupEventListeners();
        console.log('✅ 弹出窗口初始化完成');
    } catch (error) {
        console.error('❌ 弹出窗口初始化失败:', error);
    }
}); 