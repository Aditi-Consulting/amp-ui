<template>
  <div class="main-layout">
    <Navbar />
    <div class="layout-container">
      <!-- COMMENTED OUT: Left sidebar - no longer needed
      <Sidebar />
      -->
      <main class="main-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
// COMMENTED OUT: Sidebar no longer used
// import Sidebar from './Sidebar.vue'
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f8f9fa;
}

.layout-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem;
}

@media (max-width: 992px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
