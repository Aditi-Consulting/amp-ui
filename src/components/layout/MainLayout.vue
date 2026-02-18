<template>
  <div class="main-layout">
    <Navbar />
    <div class="layout-container">
      <Sidebar />
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.layout-container {
  display: flex;
 /* padding-top: 56px;  Height of navbar */
}

.main-content {
  flex: 1;
  margin-left: 280px; /* Width of sidebar */
  padding: 2rem;
  min-height: calc(100vh - 56px);
}

@media (max-width: 992px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
}
</style>
