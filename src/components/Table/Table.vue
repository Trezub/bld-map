<script setup lang="ts">
import { ref } from 'vue';
import { sortBy } from 'lodash';

interface Student {
  ID: string;
  Name: string;
  Course: string;
  Gender: string;
  Age: string;
}

const props = defineProps<{
  bodyData: Student[];
  headData: string[];
}>();

let sort = ref(false);
let updatedList = ref<Student[]>([]);
// a function to sort the table
const sortTable = (col: string) => {
  sort.value = true;
  // Use of _.sortBy() method
  updatedList.value = sortBy(props.bodyData, col);
};
</script>

<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th
          @click="sortTable(field)"
          v-for="field in headData"
          :key="`${field}`"
        >
          {{ field }}
          <i class="bi bi-sort-alpha-down" aria-label="Sort Icon"></i>
        </th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in bodyData" :key="item.ID">
        <td v-for="field in headData" :key="`${field}`">{{ item[field] }}</td>
        <td>
          <slot />
        </td>
      </tr>
    </tbody>
  </table>
</template>
