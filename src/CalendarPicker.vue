<template>
  <div
      class="ui fluid container dropdown"
      @focusin="openPicker"
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
          @keyup.esc.prevent="closePicker"
      />
    </div>
    <div class="calendar menu" :class="{ 'visible': showPicker }" @mousedown.prevent>
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
        displayDate: '',
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
        let validDate = this.validateSimpleDate(sDate)
        return validDate.year.toString().padStart(4, '0') + '-' + validDate.month.toString().padStart(2, '0') + '-' +
            validDate.day.toString().padStart(2, '0')
      },

      openPicker: function () {
        this.showPicker = true
        this.$refs.input.focus()
      },
      closePicker: function () {
        this.showPicker = false
      },
      prevMonth: function () {
        this.selected = this.dateToSimpleDate(new Date(this.selected.year, this.selected.month - 2, this.selected.day))
      },
      nextMonth: function () {
        this.selected = this.dateToSimpleDate(new Date(this.selected.year, this.selected.month, this.selected.day))
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
    border-top: 1px solid rgba(34, 36, 38, .15);
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
  .dates tr td:hover {
    background: rgba(90, 92, 94, .15);
  }
  .dates tr td.selected {
    background: rgba(90, 92, 94, .1);
  }
  td.other {
    color: #BBBBBB;
    background: rgba(180, 180, 180, .1);
  }
</style>
