<template>
    <nav class="sidebar">
        <div class="logo">
            <span style="font-size: 30px;">💰</span><br>
            我的记账本
        </div>
        <ul class="nav-main">
            <router-link class="nav-link" to="/Dashboard">
                <span class="nav-icon">📊</span> 仪表盘
            </router-link>
            <router-link class="nav-link" to="/Transactions">
                <span class="nav-icon">📈</span> 报表分析
            </router-link>
            <router-link class="nav-link" to="/Reports">
                <span class="nav-icon">📝</span> 收支记录
            </router-link>
            <router-link class="nav-link" to="/Settings">
                <span class="nav-icon">💡</span> 系统设置
            </router-link>
        </ul>
    </nav>

</template>

<script setup>

</script>

<style lang="scss" scoped>
ul {
    padding: 0px;
    list-style: none;
}

a {
    text-decoration: none;
}

.sidebar {
    position: fixed;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    width: 260px;
    height: 100vh;
    box-shadow: 2px 0 8px rgba(0, 0, 0, .05);
}

.nav-link {
    display: block;
    color: #6b7280;
    padding: 10px 0;
    padding: 14px 32px;
    border-left: 3px solid transparent;

    &:hover {
        background: #f3f4f6;
        color: #111827;
    }

    &.active {
        background: #f3f4f6;
        border-left-color: #9ca3af;
        color: #111827;
        font-weight: 600;
    }
}

.nav-main {
    margin: 0px;
    width: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 10px 0;

}

.nav-icon {
    display: inline-block;
    width: 20px;
    margin-right: 10px;
}

.logo {
    text-align: center;
    padding: 30px 20px;
    border-bottom: 1px solid rgb(229, 231, 235);
    font-size: 24px;
    font-weight: 600;
    color: #374151;
}
</style>