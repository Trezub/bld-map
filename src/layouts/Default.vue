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
  <div class="flex-container content">
    <RouterView />
  </div>
</template>