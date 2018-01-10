<template>
  <div class="ui fluid container" :class="{ 'active': showPicker }" @click="openPicker">
    <div class="ui input">
      <input
          type="text"
          v-model="insertDate"
          ref="input"
          placeholder="YYYY-MM-DD"
          :tabindex="tabIndex"

          @input="validateText"
      />
    </div>
    <div class="ui container calendar" :class="{ 'visible': showPicker }">
      <div class="header">
        <a class="" @click="prevMonth"><i class="chevron circle left icon"></i></a>
        <a class="" @click="nextMonth"><i class="chevron circle right icon"></i></a>
        <div class="title">{{ title }}</div>
      </div>

      <table class="dates">
        <thead>
        <tr>
          <th scope="col" class="start"><span title="Monday">Mo</span></th>
          <th scope="col"><span title="Tuesday">Tu</span></th>
          <th scope="col"><span title="Wednesday">We</span></th>
          <th scope="col"><span title="Thursday">Th</span></th>
          <th scope="col"><span title="Friday">Fr</span></th>
          <th scope="col"><span title="Saturday">Sa</span></th>
          <th scope="col" class="end"><span title="Sunday">Su</span></th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="week in weeksInMonth(selectedYear, selectedMonth)">
          <td v-for="day in constDaysInWeek" @click="selectDate(selectedYear, selectedMonth, week, day)">
            {{ dayOfMonth(selectedYear, selectedMonth, week, day) }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'calendar-picker',
    props: {
      startDate: String,
      tabIndex: [String, Number]
    },
    data: function () {
      return {
        insertDate: '',
        displayDate: '',
        selectedYear: 0,
        selectedMonth: 0,
        selectedDay: 0,
        showPicker: false
      }
    },
    computed: {
      formattedDate: function () {
        let parsedDate = this.parseDate(this.insertDate)
        if (parsedDate.year) {
          this.selectedYear = parsedDate.year
        }
        if (parsedDate.month) {
          this.selectedMonth = parsedDate.month
        }
        if (parsedDate.day) {
          this.selectedDay = parsedDate.day
        }
        return this.insertDate
      },
      title: function () {
        let date = new Date(this.selectedYear, this.selectedMonth - 1, 1)
        return date.toLocaleString('en-us', { month: 'long' }) + ' ' + this.selectedYear
      },
      constDaysInWeek: function () {
        return [...Array(7).keys()]
      },
      isDefault: function () {

      }
    },
    watch: {
      insertDate: function (newDate) {
        if (newDate.match(/[^0-9-]/)) {
          this.insertDate = this.insertDate.replace(/[^0-9-]/g, '')
        }
      }
    },
    methods: {
      daysInMonth: (year, month) => 32 - new Date(year, month - 1, 32).getDate(),
      dayOfWeek: (year, month, day) => (new Date(year, month - 1, day).getDay() + 6) % 7,
      weeksInMonth: function (year, month) {
        let weeks = Math.ceil((this.daysInMonth(year, month) + this.dayOfWeek(year, month, 1)) / 7.0)
        return [...Array(weeks).keys()]
      },
      dayOfMonth: function (year, month, displayWeek, displayWeekDay) {
        let day = displayWeek * 7 - this.dayOfWeek(year, month, 1) + displayWeekDay
        return new Date(year, month - 1, day).getDate()
      },

      openPicker: function () {
        this.showPicker = true
        this.$refs.input.focus()
      },
      closePicker: function () {
        this.showPicker = false
      },
      prevMonth: function () {
        if (this.selectedMonth <= 1) {
          this.selectedMonth = 12
          this.selectedYear -= 1
        } else {
          this.selectedMonth -= 1
        }
      },
      nextMonth: function () {
        if (this.selectedMonth >= 12) {
          this.selectedMonth = 1
          this.selectedYear += 1
        } else {
          this.selectedMonth += 1
        }
      },
      selectDate: function (displayWeek, displayWeekDay) {
        let date = this.dayOfMonth(this.selectedYear, this.selectedMonth, displayWeek, displayWeekDay)
        if (displayWeek === 0 && date > 20) {
          this.prevMonth()
        }
        this.selectedDay = date
        this.closePicker()
      },

      validateText: function () {
        if (this.$refs.input.value.match(/[^0-9-]/)) {
          this.$refs.input.value = this.$refs.input.value.replace(/[^0-9-]/g, '')
        }
      },

      validatePartialDate: (date) => date.match(/^[0-9][0-9-]*$/),
      validateDate: (date) => date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
      parseDate: function (date) {
        let parts = this.validatePartialDate(date) ? date.split('-', 3) : []
        return {
          year: parts.length > 0 ? Number(parts[0]) : null,
          month: parts.length > 1 ? Number(parts[1]) : null,
          day: parts.length > 2 ? Number(parts[2]) : null
        }
      }
    },
    mounted: function () {
      if (this.startDate && this.validateDate(this.startDate)) {
        let date = this.parseDate(this.startDate)
        this.selectedYear = date.year
        this.selectedMonth = date.month
        this.selectedDay = date.day
        this.insertDate = this.startDate
      } else {
        let now = new Date()
        this.selectedYear = now.getFullYear()
        this.selectedMonth = now.getMonth()
        this.selectedDay = now.getDate()
      }
    }
  }
</script>

<style scoped>
  .calendar {
    display: none;
  }
  .visible {
    display: block;
  }
</style>
