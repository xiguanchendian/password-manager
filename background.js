/**
 * 密码管理器后台服务工作者脚本
 * 负责处理扩展的后台逻辑，包括消息监听、密码存储和扩展生命周期管理
 */

// ==================== 全局变量 ====================

// 兼容Chrome和Firefox的API
const api = typeof browser !== 'undefined' ? browser : chrome;

// ==================== 消息监听处理 ====================

/**
 * 监听来自内容脚本和弹出窗口的消息
 * 处理密码保存、获取等操作
 */
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request.action, '来自:', sender.tab?.url);
    
    switch (request.action) {
        case 'savePassword':
            // 处理从内容脚本自动保存的密码
            savePasswordFromContent(request.domain, request.username, request.password);
            sendResponse({ success: true });
            break;
            
        case 'getPasswords':
            // 获取所有保存的密码
            getPasswords().then(passwords => {
                sendResponse({ success: true, passwords });
            });
            return true; // 保持消息通道开放
            
        default:
            console.warn('未知的消息类型:', request.action);
            sendResponse({ success: false, error: '未知操作' });
    }
});

// ==================== 密码存储管理 ====================

/**
 * 从内容脚本保存密码到本地存储
 * @param {string} domain - 网站域名
 * @param {string} username - 用户名
 * @param {string} password - 密码
 */
async function savePasswordFromContent(domain, username, password) {
    try {
        const passwords = await getPasswords();
        
        // 更新或添加密码记录
        passwords[domain] = {
            username,
            password,
            timestamp: Date.now(),
            autoSaved: true // 标记为自动保存
        };
        
        await api.storage.local.set({ passwords });
        console.log(`✅ 已自动保存 ${domain} 的密码`);
        
    } catch (error) {
        console.error('❌ 保存密码时出错:', error);
        throw error;
    }
}

/**
 * 从本地存储获取所有密码
 * @returns {Promise<Object>} 密码对象，格式: {domain: {username, password, timestamp}}
 */
async function getPasswords() {
    try {
        const result = await api.storage.local.get('passwords');
        return result.passwords || {};
    } catch (error) {
        console.error('❌ 获取密码时出错:', error);
        return {};
    }
}

// ==================== 扩展生命周期管理 ====================

/**
 * 扩展安装时的初始化处理
 * 可以在这里添加欢迎页面、默认设置等初始化逻辑
 */
api.runtime.onInstalled.addListener((details) => {
    console.log('📦 扩展安装事件:', details.reason);
    
    if (details.reason === 'install') {
        console.log('🎉 密码管理器扩展已安装');
        // TODO: 可以在这里添加欢迎页面或默认设置
        initializeDefaultSettings();
    } else if (details.reason === 'update') {
        console.log('🔄 密码管理器扩展已更新');
    }
});

/**
 * 扩展启动时的初始化处理
 */
api.runtime.onStartup.addListener(() => {
    console.log('🚀 密码管理器扩展已启动');
});

/**
 * 初始化默认设置
 */
async function initializeDefaultSettings() {
    try {
        const result = await api.storage.local.get(['autoFillEnabled']);
        if (!result.hasOwnProperty('autoFillEnabled')) {
            // 设置默认的自动填充状态
            await api.storage.local.set({ autoFillEnabled: true });
            console.log('✅ 已设置默认自动填充状态');
        }
    } catch (error) {
        console.error('❌ 初始化默认设置时出错:', error);
    }
}

// ==================== 存储变化监听 ====================

/**
 * 监听本地存储的变化
 * 用于调试和日志记录
 */
api.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
        console.log('📊 存储变化:', Object.keys(changes));
        
        if (changes.passwords) {
            const oldCount = Object.keys(changes.passwords.oldValue || {}).length;
            const newCount = Object.keys(changes.passwords.newValue || {}).length;
            console.log(`🔐 密码数量变化: ${oldCount} -> ${newCount}`);
        }
        
        if (changes.autoFillEnabled) {
            console.log(`🔄 自动填充状态变化: ${changes.autoFillEnabled.newValue}`);
        }
    }
});

// ==================== 错误处理 ====================

/**
 * 全局错误处理
 */
api.runtime.onSuspend.addListener(() => {
    console.log('⏸️ 扩展即将暂停');
});

// 初始化完成
console.log('✅ 密码管理器后台脚本已加载完成'); 