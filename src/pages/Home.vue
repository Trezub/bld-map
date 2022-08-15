<script setup lang="ts">
  import Table from '../components/Table/Table.vue';

  const studentData = [
    {
      ID: '01',
      Name: 'Abiola Esther',
      Course: 'Computer Science',
      Gender: 'Female',
      Age: '17',
    },
    {
      ID: '02',
      Name: 'Robert V. Kratz',
      Course: 'Philosophy',
      Gender: 'Male',
      Age: '19',
    },
    {
      ID: '03',
      Name: 'Kristen Anderson',
      Course: 'Economics',
      Gender: 'Female',
      Age: '20',
    },
    {
      ID: '04',
      Name: 'Adam Simon',
      Course: 'Food science',
      Gender: 'Male',
      Age: '21',
    },
    {
      ID: '05',
      Name: 'Daisy Katherine',
      Course: 'Business studies',
      Gender: 'Female',
      Age: '22',
    },
  ];
  const fields = ['ID', 'Name', 'Course', 'Gender', 'Age'];
</script>

<template>
  <div class="container bg-blue shadow-sm mt-5">
    <Table :body-data="studentData" :head-data="fields">
      <button type="button" class="btn btn-primary me-1">
        <v-icon name="fa-edit" />
      </button>
      <button type="button" class="btn btn-danger">
        <v-icon name="fa-trash" />
      </button>
    </Table>
  </div>
</template>
