<template>
  <div
      class="ui fluid container dropdown calendar"
      @focusin="openPicker"
      tabindex="-1"
  >
    <div class="ui input" @click="openPicker">
      <input
          type="text"
          v-model="insertDate"
          ref="input"
          placeholder="YYYY-MM-DD"
          :tabindex="tabIndex"

          @blur="closePicker"
          @input="validateText"

          @keyup.esc.prevent="cancelPicker"
          @keyup.enter.prevent="validateClose"
          @keyup.ctrl.left.prevent.stop="prevMonth"
          @keyup.ctrl.right.prevent.stop="nextMonth"
          @keyup.up.prevent.stop="prevDay"
          @keyup.down.prevent.stop="nextDay"
      />
    </div>
    <div class="menu" :class="{ 'visible': showPicker }" @mousedown.prevent>
      <div class="head">
        <a class="left" @click.stop="prevMonth"><i class="chevron circle left icon"></i></a>
        <span class="title">{{ title }}</span>
        <a class="right" @click.stop="nextMonth"><i class="chevron circle right icon"></i></a>
      </div>

      <table class="ui celled table center aligned dates">
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
        <tr v-for="week in displayDates">
          <td
              v-for="sDate in week"
              @click.stop="selectDate(sDate)"
              :class="{ 'selected': areEqual(sDate, selected), 'other': isDifferentMonth(sDate, validateSimpleDate(selected)) }"
          >
            {{ sDate.day }}
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
        selected: {
          year: null,
          month: null,
          day: null
        },
        showPicker: false
      }
    },
    computed: {
      title: function () {
        let validatedDate = this.validateSimpleDate(this.selected)
        let date = new Date(validatedDate.year, validatedDate.month - 1, 1)
        return date.toLocaleString('en-us', { month: 'long' }) + ' ' + validatedDate.year
      },
      displayDates: function () {
        let validatedDate = this.validateSimpleDate(this.selected)
        return this.weeksInMonth(validatedDate)
            .map(displayWeek => this.generateWeekDates(validatedDate, displayWeek))
      },
      today: function () {
        return this.dateToSimpleDate(new Date())
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
      dateToSimpleDate: (date) => ({year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()}),
      daysInMonth: (year, month) => 32 - new Date(year, month - 1, 32).getDate(),
      dayOfWeek: (year, month, day) => (new Date(year, month - 1, day).getDay() + 6) % 7,
      weeksInMonth: function (sDate) {
        let weeks = Math.ceil(
            (this.daysInMonth(sDate.year, sDate.month) + this.dayOfWeek(sDate.year, sDate.month, 1)) / 7.0
        )
        return [...Array(weeks).keys()]
      },
      dayOfMonth: function (sDate, displayWeek, displayWeekDay) {
        let day = displayWeek * 7 - this.dayOfWeek(sDate.year, sDate.month, 1) + displayWeekDay
        return new Date(sDate.year, sDate.month - 1, day)
      },
      generateWeekDates: function (sDate, week) {
        let mapper = (day) => this.dateToSimpleDate(this.dayOfMonth(sDate, week, day))
        return [...Array(7).keys()].map(mapper)
      },

      isDifferentMonth: (sDate, sDate2) => sDate.year !== sDate2.year || sDate.month !== sDate2.month,
      areEqual: (sDate, sDate2) => sDate.day === sDate2.day && sDate.month === sDate2.month && sDate.year === sDate2.year,
      validateSimpleDate: function (sDate) {
        let today = this.today
        return {
          year: sDate.year ? sDate.year : today.year,
          month: sDate.month ? sDate.month : today.month,
          day: sDate.day ? sDate.day : today.day
        }
      },
      formatDate: function (sDate) {
        let formattedDate = ''
        if (sDate.year) formattedDate += sDate.year.toString().padStart(4, '0') + '-'
        if (sDate.month) formattedDate += sDate.month.toString().padStart(2, '0') + '-'
        if (sDate.day) formattedDate += sDate.day.toString().padStart(2, '0')
        return formattedDate
      },

      openPicker: function () {
        this.showPicker = true
        this.$refs.input.focus()
      },
      closePicker: function () {
        this.showPicker = false
      },
      validateClose: function () {
        this.insertDate = this.formatDate(this.selected)
        this.closePicker()
      },
      cancelPicker: function () {
        this.insertDate = (this.startDate) ? this.startDate : ''
        this.closePicker()
      },

      changeDate: function (sDate) {
        this.selected.year = sDate.year
        this.selected.month = sDate.month
        if (this.selected.day) this.selected.day = sDate.day
        this.insertDate = this.formatDate(this.selected)
      },
      moveDay: function (move) {
        let validDate = this.validateSimpleDate(this.selected)
        let finalDate = this.dateToSimpleDate(new Date(validDate.year, validDate.month - 1, validDate.day + move))
        this.changeDate(finalDate)
      },
      moveMonth: function (move) {
        let validDate = this.validateSimpleDate(this.selected)
        let tmpDate = new Date(validDate.year, validDate.month - 1 + move, validDate.day)
        let correctMonth = new Date(validDate.year, validDate.month + move, 0)

        let finalDate = tmpDate.getMonth() === correctMonth.getMonth()
            ? this.dateToSimpleDate(tmpDate)
            : this.dateToSimpleDate(correctMonth)
        this.changeDate(finalDate)
      },

      prevMonth: function () {
        this.moveMonth(-1)
      },
      nextMonth: function () {
        this.moveMonth(1)
      },

      prevDay: function () {
        this.moveDay(-1)
      },
      nextDay: function () {
        this.moveDay(1)
      },

      selectDate: function (sDate) {
        this.selected = sDate
        this.insertDate = this.formatDate(sDate)
        this.closePicker()
      },

      validateText: function () {
        if (this.$refs.input.value.match(/[^0-9-]/)) {
          this.$refs.input.value = this.$refs.input.value.replace(/[^0-9-]/g, '')
        }
        this.showPicker = true
        this.selected = this.parseDate(this.$refs.input.value)
      },

      validatePartialDate: (date) => date.match(/^[0-9]{4}[0-9-]*$/),
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
        this.selected = this.parseDate(this.startDate)
        this.insertDate = this.startDate
      } else {
        this.selected = this.today
      }
    }
  }
</script>

<style scoped>
  .visible {
    display: block !important;
  }

  .head {
    text-align: center;
    font-weight: 600;
    font-size: 1.1em;
    padding: 0.3em 0.1em 0.3em 0.1em;
  }
  a {
    cursor: pointer;
  }
  a.left {
    float: left;
  }
  a.right {
    float: right;
  }

  .dates {
    font-size: .8em;
    border: none;
    border-collapse: separate;
    border-spacing: 0;
    margin: .3em 0;
  }
  .dates thead tr:first-child > th:first-child, .dates thead tr:first-child > th:last-child {
    border-radius: 0;
  }
  .dates thead th {
    padding: .4em .5em;
    font-weight: 600;
  }
  .dates tr td {
    cursor: pointer;
    padding: .4em .5em;
  }
</style>

<style>
  .calendar .dates {
    border-top: 1px solid rgba(34, 36, 38, .15);
  }
  .calendar .dates tr td:hover {
    background: rgba(90, 92, 94, .15);
  }
  .calendar .dates tr td.selected {
    background: rgba(90, 92, 94, .1);
  }
  .calendar td.other {
    color: #BBBBBB;
    background: rgba(180, 180, 180, .1);
  }

  .ui.inverted .calendar .input input {
    background: #404040;
    color: rgba(255, 255, 255, .9);
  }
  .ui.inverted .calendar .input input::placeholder {
    color: rgba(120, 120, 120, .9);
  }
  .ui.inverted .calendar .menu {
    background: #202020;
  }
  .ui.inverted .calendar .dates {
    color: rgba(255, 255, 255, .9);
    background: #202020;
    border-top: 1px solid rgba(100, 100, 100, .6);
  }
  .ui.inverted .calendar .dates thead th {
    background: #0A0A0A;
    color: rgba(255, 255, 255, 1);
    border-left: 1px solid rgba(100, 100, 100, .4);
  }
  .ui.inverted .calendar .dates thead th:first-child {
    border-left: none;
  }
  .ui.inverted .calendar .dates tr td {
    border-left: 1px solid rgba(100, 100, 100, .4);
    border-top: 1px solid rgba(100, 100, 100, .4);
  }
  .ui.inverted .calendar .dates tr td:first-child {
    border-left: none;
  }
  .ui.inverted .calendar .dates tr td:hover {
    color: rgba(255, 255, 255, .9);
    background: rgba(220, 220, 220, .15);
  }
  .ui.inverted .calendar .dates tr td.selected {
    background: rgba(220, 220, 220, .1);
  }
  .ui.inverted .calendar td.other {
    color: #808080;
    background: rgba(160, 160, 160, .1);
  }
</style>
