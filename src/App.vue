<template>
  <div id="page" class="">
    <p>New Year:</p>
    <calendar-picker start-date="2018-01-01" />
    <p>No date set, so today:</p>
    <calendar-picker />
    <div class="ui inverted segment">
      <p>Last year some date</p>
      <calendar-picker start-date="2017-07-07" />
      <p>Another empty picker</p>
      <calendar-picker />
    </div>
  </div>
</template>

<script>
  import CalendarPicker from './CalendarPicker'

  export default {
    components: {CalendarPicker},
    name: 'app'
  }
</script>

<style scoped>
  #page {
    margin-left: 200px;
    width: 200px;
    max-width: 200px;
  }
</style>
