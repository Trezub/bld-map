<script setup lang="ts">
import { reactive } from 'vue';
import { Offcanvas } from 'bootstrap';

const modals = reactive({
  menuCanvas: null as unknown as Offcanvas,
});

function setModalAndOffcanvas() {
  modals.menuCanvas = new Offcanvas(
    document.getElementById('offcanvasNavbar') as HTMLElement
  );
}
</script>

<template>
  <nav class="navbar bg-light fixed-top">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Offcanvas navbar</a>
      <button
        class="navbar-toggler p-2"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar"
      >
        <v-icon name="fa-bars" color="#000" scale="1.4" />
      </button>
      <div
        id="offcanvasNavbar"
        class="offcanvas offcanvas-end"
        tabindex="-1"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasNavbarLabel">Pages</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div class="offcanvas-body">
          <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li class="nav-item">
              <RouterLink to="/map2">Map2 (working)</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink to="/">
                <a class="nav-link" href="#">Map (not working)</a>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
  <div class="flex-container content">
    <RouterView />
  </div>
</template>

<style scoped>
#offcanvasNavbar {
  transition: all 0.3s;
}

.content {
  padding-top: 70px;
}
</style>
