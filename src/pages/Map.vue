<template>
  <vue-element-loading :active="isLoading">
    <img
      src="https://i.pinimg.com/originals/9f/b1/25/9fb125f1fedc8cc62ab5b20699ebd87d.gif"
      width="55px"
      height="55px"
    />
  </vue-element-loading>
  <GMapMap
    ref="myMapRef"
    :center="center"
    :zoom="7"
    map-type-id="roadmap"
    style="width: 100vw; height: 900px"
    :options="{
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      disableDefaultUi: false,
    }"
  >
    <template v-for="route in routes" :key="route.routeId">
      <GMapMarker
        :key="index"
        v-for="(stop, index) in route.stops"
        :position="{
          lat: stop.address.latitude,
          lng: stop.address.longitude,
        }"
        :icon="'https://developers.google.com/maps/documentation/javascript/examples/full/images/info-i_maps.png'"
      />

      <template v-for="leg in route.legs">
        <GMapPolyline
          v-for="step in leg.steps"
          :key="step.polyline.points"
          :editable="true"
          :path="google.geometry.encoding.decodePath(step.polyline.points)"
          ref="polyline"
          :options="{
            strokeColor: route.color,
          }"
        />
      </template>
    </template>
  </GMapMap>
</template>

<script setup lang="ts">
import VueElementLoading from 'vue-element-loading';
import data from './data.json';
import { generateRandomColor } from '../utils/generateRandomColor';
import { onMounted, ref, watch } from 'vue';

const myMapRef = ref();
const map = ref(google.maps.Map);
const isLoading = ref(false);

const center = {
  lat: -25.43578524053438,
  lng: -49.256734002415286,
};

const routes = data.map((route) => ({
  ...route,
  color: generateRandomColor(),
}));

watch(myMapRef, (googleMap) => {
  isLoading.value = true;
  if (googleMap) {
    googleMap.$mapPromise.then((map) => {
      map.value = map;
    });
  }
  isLoading.value = false;
});
</script>
