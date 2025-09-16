/**
 * 密码解密工具脚本
 * 用于解密从密码管理器导出的加密文件，也支持查看明文导出的文件
 */

// ==================== 全局变量 ====================

let currentFile = null;        // 当前选择的文件
let decryptedData = null;      // 解密后的数据
let isEncryptedFile = false;   // 是否为加密文件

// ==================== 文件处理功能 ====================

/**
 * 处理文件选择
 * @param {File} file - 选择的文件对象
 */
function handleFileSelect(file) {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
        // 清空之前的结果
        clearPreviousResults();
        
        currentFile = file;
        displayFileInfo(file);
        document.getElementById('fileInfo').classList.remove('hidden');
        showStatus(`✅ 已选择文件: ${file.name}`, 'success');
        
        // 检查文件类型
        checkFileType(file);
    } else {
        showStatus('❌ 请选择.json格式的文件', 'error');
    }
}

/**
 * 清空之前的结果
 */
function clearPreviousResults() {
    console.log('🧹 开始清空之前的结果');
    
    // 清空密码列表
    const passwordList = document.getElementById('passwordList');
    if (passwordList) {
        passwordList.innerHTML = '';
        console.log('✅ 已清空密码列表');
    }
    
    // 隐藏结果区域
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.classList.add('hidden');
        console.log('✅ 已隐藏结果区域');
    }
    
    // 重置按钮文本
    const decryptBtn = document.getElementById('decryptBtn');
    if (decryptBtn) {
        decryptBtn.textContent = '🔓 查看密码';
        console.log('✅ 已重置按钮文本');
    }
    
    // 隐藏密码输入区域
    const passwordSection = document.getElementById('passwordSection');
    if (passwordSection) {
        passwordSection.style.display = 'none';
        console.log('✅ 已隐藏密码输入区域');
    }
    
    // 清空密码输入框
    const decryptPassword = document.getElementById('decryptPassword');
    if (decryptPassword) {
        decryptPassword.value = '';
        console.log('✅ 已清空密码输入框');
    }
    
    // 重置状态变量
    decryptedData = null;
    isEncryptedFile = false;
    
    console.log('🧹 清空完成');
}

/**
 * 检查文件类型（加密或明文）
 * @param {File} file - 文件对象
 */
async function checkFileType(file) {
    try {
        const fileContent = await readFileAsText(file);
        const fileData = JSON.parse(fileContent);
        
        // 检查是否为加密文件
        if (fileData.encrypted && fileData.data) {
            isEncryptedFile = true;
            document.getElementById('passwordSection').style.display = 'block';
            document.getElementById('decryptBtn').textContent = '🔓 解密文件';
            showStatus('🔒 检测到加密文件，请输入导出时设置的密码', 'info');
        } else if (fileData.passwords) {
            isEncryptedFile = false;
            document.getElementById('passwordSection').style.display = 'none';
            document.getElementById('decryptBtn').textContent = '✅ 已自动显示';
            showStatus('📄 检测到明文文件，无需密码即可查看', 'success');
            
            // 明文文件自动显示密码列表
            console.log('📄 明文文件自动显示密码列表');
            decryptedData = fileData;
            displayDecryptedData(fileData);
        } else {
            showStatus('❌ 文件格式不支持，请选择正确的密码导出文件', 'error');
        }
    } catch (error) {
        console.error('❌ 检查文件类型时出错:', error);
        showStatus('❌ 文件格式错误，请选择正确的JSON文件', 'error');
    }
}

/**
 * 显示文件信息
 * @param {File} file - 文件对象
 */
function displayFileInfo(file) {
    const fileDetails = document.getElementById('fileDetails');
    const fileSize = (file.size / 1024).toFixed(2);
    
    fileDetails.innerHTML = `
        <p><strong>文件名:</strong> ${file.name}</p>
        <p><strong>文件大小:</strong> ${fileSize} KB</p>
        <p><strong>文件类型:</strong> ${file.type || 'application/json'}</p>
        <p><strong>最后修改:</strong> ${new Date(file.lastModified).toLocaleString()}</p>
        <p><strong>文件状态:</strong> ✅ 已加载</p>
    `;
}

/**
 * 读取文件内容为文本
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('文件读取失败'));
        reader.readAsText(file);
    });
}

// ==================== 解密功能 ====================

/**
 * 解密数据
 * @param {string} encryptedContent - base64编码的加密内容
 * @param {string} password - 解密密码
 * @returns {Promise<Object>} 解密后的数据
 */
async function decryptData(encryptedContent, password) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    try {
        // 将base64字符串转换为Uint8Array
        const combined = new Uint8Array(atob(encryptedContent).split('').map(char => char.charCodeAt(0)));
        
        // 提取salt、iv和加密数据
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const encrypted = combined.slice(28);
        
        // 导入密钥材料
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );
        
        // 使用PBKDF2派生密钥
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt']
        );
        
        // 使用AES-GCM解密数据
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encrypted
        );
        
        return JSON.parse(decoder.decode(decryptedData));
        
    } catch (error) {
        console.error('❌ 解密失败:', error);
        throw new Error('解密失败，请检查密码是否正确');
    }
}

// ==================== 数据显示功能 ====================

/**
 * 显示解密后的数据
 * @param {Object} data - 解密后的数据对象
 */
function displayDecryptedData(data) {
    console.log('🎯 开始显示数据:', data);
    
    const resultSection = document.getElementById('resultSection');
    const passwordList = document.getElementById('passwordList');
    
    // 确保元素存在
    if (!resultSection || !passwordList) {
        console.error('❌ 找不到必要的DOM元素');
        showStatus('❌ 页面元素加载失败', 'error');
        return;
    }
    
    // 清空密码列表
    passwordList.innerHTML = '';
    
    if (data.passwords && Object.keys(data.passwords).length > 0) {
        console.log(`📋 显示 ${Object.keys(data.passwords).length} 个密码`);
        
        // 遍历所有密码并创建显示项
        Object.entries(data.passwords).forEach(([domain, info]) => {
            const passwordItem = document.createElement('div');
            passwordItem.className = 'password-item';
            passwordItem.innerHTML = `
                <div class="site">🌐 ${domain}</div>
                <div class="username">👤 用户名: ${info.username}</div>
                <div class="password">🔒 密码: <span class="password-text">${info.password}</span></div>
                <button class="copy-btn" data-password="${info.password}">📋 拷贝密码</button>
            `;
            passwordList.appendChild(passwordItem);
        });
        
        // 为所有拷贝按钮添加事件监听器
        const copyButtons = document.querySelectorAll('.copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', function() {
                const password = this.getAttribute('data-password');
                copyToClipboard(password, this);
            });
        });
        
        console.log('✅ 密码列表显示完成');
    } else {
        console.log('❌ 没有找到密码数据或密码数据为空');
        passwordList.innerHTML = '<div style="text-align: center; opacity: 0.7;">没有找到密码数据</div>';
    }
    
    // 显示结果区域
    resultSection.classList.remove('hidden');
    console.log('✅ 数据显示完成');
}

// ==================== 剪贴板功能 ====================

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @param {HTMLElement} button - 触发按钮元素
 */
function copyToClipboard(text, button) {
    navigator.clipboard.writeText(text).then(() => {
        // 临时改变按钮文本和样式
        const originalText = button.textContent;
        button.textContent = '✅ 已拷贝';
        button.classList.add('copied');
        
        // 2秒后恢复原状
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
        
        showStatus('✅ 密码已拷贝到剪贴板', 'success');
    }).catch(err => {
        console.error('❌ 拷贝失败:', err);
        showStatus('❌ 拷贝失败，请手动复制', 'error');
    });
}

// ==================== 状态显示功能 ====================

/**
 * 显示状态消息
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success', 'error', 'info')
 */
function showStatus(message, type) {
    const statusArea = document.getElementById('statusArea');
    const statusDiv = document.createElement('div');
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    
    statusArea.innerHTML = '';
    statusArea.appendChild(statusDiv);
    
    // 成功和错误消息3秒后自动消失
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.remove();
        }, 3000);
    }
}

// ==================== 事件监听器 ====================

/**
 * 初始化所有事件监听器
 */
function initializeEventListeners() {
    // 文件选择事件
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                handleFileSelect(file);
            } else {
                showStatus('❌ 未选择文件', 'error');
            }
        });
    }
    
    // 解密/查看按钮事件
    const decryptBtn = document.getElementById('decryptBtn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', async function() {
            if (!currentFile) {
                showStatus('请先选择文件', 'error');
                return;
            }
            
            // 只有加密文件才需要点击按钮处理
            if (!isEncryptedFile) {
                showStatus('明文文件已自动显示，无需点击按钮', 'info');
                return;
            }
            
            try {
                showStatus('正在处理文件...', 'info');
                
                // 读取文件内容
                const fileContent = await readFileAsText(currentFile);
                const fileData = JSON.parse(fileContent);
                
                // 处理加密文件
                const password = document.getElementById('decryptPassword').value;
                if (!password) {
                    showStatus('请输入解密密码', 'error');
                    return;
                }
                
                // 验证文件格式
                if (!fileData.encrypted || !fileData.data) {
                    showStatus('文件格式错误，不是有效的加密文件', 'error');
                    return;
                }
                
                // 执行解密
                const decrypted = await decryptData(fileData.data, password);
                decryptedData = decrypted;
                
                showStatus('✅ 解密成功！', 'success');
                displayDecryptedData(decrypted);
                
            } catch (error) {
                console.error('❌ 处理文件失败:', error);
                if (error.message.includes('decrypt')) {
                    showStatus('❌ 解密失败，密码可能不正确', 'error');
                } else {
                    showStatus(`❌ 处理失败: ${error.message}`, 'error');
                }
            }
        });
    }
    
    // 清空按钮事件
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            // 清空之前的结果
            clearPreviousResults();
            
            // 重置文件选择
            currentFile = null;
            document.getElementById('fileInput').value = '';
            document.getElementById('fileInfo').classList.add('hidden');
            document.getElementById('statusArea').innerHTML = '';
            showStatus('✅ 数据已清空', 'success');
        });
    }
}

// ==================== 初始化 ====================

/**
 * 页面加载完成后的初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 密码查看工具开始初始化');
    
    try {
        // 检查必要的DOM元素
        const requiredElements = [
            'fileInput',
            'decryptBtn', 
            'clearBtn',
            'resultSection',
            'passwordList',
            'statusArea'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            console.error('❌ 缺少必要的DOM元素:', missingElements);
            showStatus('❌ 页面元素加载失败', 'error');
            return;
        }
        
        console.log('✅ 所有必要的DOM元素都存在');
        
        initializeEventListeners();
        showStatus('💡 使用说明：1. 点击按钮选择文件 2. 明文文件自动显示，加密文件需要输入密码', 'info');
        console.log('✅ 密码查看工具初始化完成');
    } catch (error) {
        console.error('❌ 密码查看工具初始化失败:', error);
    }
}); 