// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const planForm = document.getElementById('plan-form');
    const planList = document.getElementById('plan-list');
    const messageElement = document.getElementById('message');
    const totalPlansElement = document.getElementById('total-plans');
    const completedPlansElement = document.getElementById('completed-plans');
    const pendingPlansElement = document.getElementById('pending-plans');

    // 初始化计划列表 - 从本地存储获取数据
    let plans = JSON.parse(localStorage.getItem('studyPlans')) || [];
    renderPlans();
    updateStats();

    // 表单提交事件处理
    planForm.addEventListener('submit', function(e) {
        e.preventDefault(); // 阻止表单默认提交

        // 获取表单数据
        const newPlan = {
            id: Date.now(), // 使用时间戳作为唯一ID
            title: document.getElementById('title').value,
            subject: document.getElementById('subject').value,
            hours: document.getElementById('hours').value,
            date: document.getElementById('date').value,
            notes: document.getElementById('notes').value,
            completed: false
        };

        // 添加新计划
        plans.push(newPlan);
        savePlans();
        renderPlans();
        updateStats();

        // 重置表单
        planForm.reset();

        // 显示成功消息
        showMessage('计划添加成功！', 'success');
    });

    // 保存计划到本地存储
    function savePlans() {
        localStorage.setItem('studyPlans', JSON.stringify(plans));
    }

    // 渲染计划列表
    function renderPlans() {
        if (plans.length === 0) {
            planList.innerHTML = '<p>暂无学习计划，添加你的第一个计划吧！</p>';
            return;
        }

        // 按日期排序计划（最近的在前）
        plans.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        planList.innerHTML = '';
        
        // 创建计划项
        plans.forEach(plan => {
            const planItem = document.createElement('div');
            planItem.className = `plan-item ${plan.completed ? 'completed' : ''}`;
            planItem.innerHTML = `
                <div class="plan-details">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-meta">
                        科目: ${getSubjectText(plan.subject)} | 
                        时长: ${plan.hours}小时 | 
                        日期: ${formatDate(plan.date)}
                    </div>
                    ${plan.notes ? `<div class="plan-notes">备注: ${plan.notes}</div>` : ''}
                </div>
                <div class="plan-actions">
                    <button class="btn-tertiary toggle-btn" data-id="${plan.id}">
                        ${plan.completed ? '取消完成' : '标记完成'}
                    </button>
                    <button class="btn-secondary delete-btn" data-id="${plan.id}">删除</button>
                </div>
            `;
            planList.appendChild(planItem);
        });

        // 添加事件监听器
        addPlanEventListeners();
    }

    // 为计划项添加事件监听器
    function addPlanEventListeners() {
        // 标记完成按钮
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                togglePlanStatus(id);
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deletePlan(id);
            });
        });
    }

    // 切换计划完成状态
    function togglePlanStatus(id) {
        const plan = plans.find(p => p.id === id);
        if (plan) {
            plan.completed = !plan.completed;
            savePlans();
            renderPlans();
            updateStats();
            showMessage(`计划已${plan.completed ? '标记为完成' : '取消完成'}`, 'success');
        }
    }

    // 删除计划
    function deletePlan(id) {
        if (confirm('确定要删除这个计划吗？')) {
            plans = plans.filter(plan => plan.id !== id);
            savePlans();
            renderPlans();
            updateStats();
            showMessage('计划已删除', 'success');
        }
    }

    // 更新统计数据
    function updateStats() {
        const total = plans.length;
        const completed = plans.filter(plan => plan.completed).length;
        const pending = total - completed;

        totalPlansElement.textContent = total;
        completedPlansElement.textContent = completed;
        pendingPlansElement.textContent = pending;
    }

    // 显示消息提示
    function showMessage(text, type) {
        messageElement.textContent = text;
        messageElement.className = 'message';
        messageElement.classList.add(type);

        // 3秒后隐藏消息
        setTimeout(() => {
            messageElement.classList.remove(type);
        }, 3000);
    }

    // 辅助函数：格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    // 辅助函数：获取科目文本
    function getSubjectText(subjectValue) {
        const subjects = {
            'programming': '前后端开发',
            'language': '数据处理和分析',
            'math': '语言基础',
            'science': '机器学习',
            'other': '其他'
        };
        return subjects[subjectValue] || subjectValue;
    }

    // 设置默认日期为今天
    document.getElementById('date').valueAsDate = new Date();
});
