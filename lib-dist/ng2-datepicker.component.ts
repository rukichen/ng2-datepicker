import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  OnChanges,
  forwardRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { SlimScrollOptions } from 'ng2-slimscroll';
import * as moment from 'moment';

const Moment: any = (<any>moment).default || moment;

export interface IDateModel {
  day: string;
  month: string;
  year: string;
  formatted: string;
  momentObj: moment.Moment;
}

export class DateModel {
  day: string;
  month: string;
  year: string;
  formatted: string;
  momentObj: moment.Moment;

  constructor(obj?: IDateModel) {
    this.day = obj && obj.day ? obj.day : null;
    this.month = obj && obj.month ? obj.month : null;
    this.year = obj && obj.year ? obj.year : null;
    this.formatted = obj && obj.formatted ? obj.formatted : null;
    this.momentObj = obj && obj.momentObj ? obj.momentObj : null;
  }
}

export interface IDatePickerTexts {
  selectYearText?: string;
  todayText?: string;
  clearText?: string;
  monthName?: string[];
}

export class DatePickerTexts {
  selectYearText?: string;
  todayText?: string;
  clearText?: string;
  monthName?: string[];

  constructor(obj?: IDatePickerOptions) {
    this.selectYearText = obj && obj.selectYearText ? obj.selectYearText : 'Select Year';
    this.todayText = obj && obj.todayText ? obj.todayText : 'Today';
    this.clearText = obj && obj.clearText ? obj.clearText : 'Clear';
    this.monthName = obj && (obj.monthName && obj.monthName.length === 12) ? obj.monthName : ['January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }
}

export interface IDatePickerOptions {
  autoApply?: boolean;
  style?: 'normal' | 'big' | 'bold';
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  initialDate?: Date;
  firstWeekdaySunday?: boolean;
  format?: string;
  selectYearText?: string;
  todayText?: string;
  clearText?: string;
  color?: string;
  monthName?: string[];
}

export class DatePickerOptions {
  autoApply?: boolean;
  style?: 'normal' | 'big' | 'bold';
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  initialDate?: Date;
  firstWeekdaySunday?: boolean;
  format?: string;
  selectYearText?: string;
  todayText?: string;
  clearText?: string;
  color?: string;
  monthName?: string[];

  constructor(obj?: IDatePickerOptions) {
    this.autoApply = (obj && obj.autoApply === true) ? true : false;
    this.style = obj && obj.style ? obj.style : 'normal';
    this.locale = obj && obj.locale ? obj.locale : 'en';
    this.minDate = obj && obj.minDate ? obj.minDate : null;
    this.maxDate = obj && obj.maxDate ? obj.maxDate : null;
    this.initialDate = obj && obj.initialDate ? obj.initialDate : null;
    this.firstWeekdaySunday = obj && obj.firstWeekdaySunday ? obj.firstWeekdaySunday : false;
    this.format = obj && obj.format ? obj.format : 'YYYY-MM-DD';
    this.selectYearText = obj && obj.selectYearText ? obj.selectYearText : 'Select Year';
    this.todayText = obj && obj.todayText ? obj.todayText : 'Today';
    this.clearText = obj && obj.clearText ? obj.clearText : 'Clear';
    this.color = obj && obj.color ? obj.color : 'red';
    this.monthName = obj && (obj.monthName && obj.monthName.length === 12) ? obj.monthName : ['January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }
}

export interface CalendarDate {
  day: number;
  month: number;
  year: number;
  enabled: boolean;
  today: boolean;
  selected: boolean;
  momentObj: moment.Moment;
}

export const CALENDAR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};


@Component({
  selector: 'ng2-datepicker',
  template: `<div class="datepicker-container u-is-unselectable"><div class="input-group"><input class="datepicker-input form-control" [ngModel]="date.formatted" (ngModelChange)="inputChange($event)"> <span _ngcontent-c2="" class="input-group-addon" (click)="toggle()"><span _ngcontent-c2="" class="glyphicon glyphicon-calendar"></span></span></div><div class="datepicker-calendar" *ngIf="opened"><div class="datepicker-calendar-top {{options.color}}"><span class="year-title">{{ currentDate.format('YYYY') }}</span> <button type="button" (click)="openYearPicker()" *ngIf="!yearPicker">{{options.selectYearText}}</button></div><div class="datepicker-calendar-container"><div *ngIf="!yearPicker"><div class="datepicker-calendar-month-section"><i (click)="prevMonth()" class="fill-{{options.color}}"><svg width="190px" height="306px" viewBox="58 0 190 306" version="1.1"><g id="keyboard-left-arrow-button" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(58.000000, 0.000000)"><g id="chevron-left" fill-rule="nonzero" fill="#000000"><polygon id="Shape" points="189.35 35.7 153.65 0 0.65 153 153.65 306 189.35 270.3 72.05 153"></polygon></g></g></svg> </i><span class="datepicker-calendar-month-title">{{ options.monthName[currentDate.month()] }}</span> <i (click)="nextMonth()" class="fill-{{options.color}}"><svg width="190px" height="306px" viewBox="58 0 190 306" version="1.1"><g id="keyboard-right-arrow-button" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(58.000000, 0.000000)"><g id="chevron-right" fill-rule="nonzero" fill="#000000"><polygon id="Shape" points="36.35 0 0.65 35.7 117.95 153 0.65 270.3 36.35 306 189.35 153"></polygon></g></g></svg></i></div><div class="datepicker-calendar-day-names"><span>S</span> <span>M</span> <span>T</span> <span>W</span> <span>T</span> <span>F</span> <span>S</span></div><div class="datepicker-calendar-days-container"><span class="day" *ngFor="let d of days; let i = index" (click)="selectDate($event, d.momentObj)" [ngClass]="{ 'disabled': !d.enabled, 'today': d.today, 'selected': d.selected }" [class.label-red]="options.color === 'red' && d.today" [class.label-green]="options.color === 'green' && d.today" [class.label-blue]="options.color === 'blue' && d.today" [class.label-orange]="options.color === 'orange' && d.today" [class.label-violet]="options.color === 'violet' && d.today" [class.label-pink]="options.color === 'pink' && d.today" [class.label-darkgreen]="options.color === 'darkgreen' && d.today" [class.label-darkblue]="options.color === 'darkblue' && d.today" [class.border-red]="options.color === 'red' && d.selected" [class.border-green]="options.color === 'green' && d.selected" [class.border-blue]="options.color === 'blue' && d.selected" [class.border-orange]="options.color === 'orange' && d.selected" [class.border-violet]="options.color === 'violet' && d.selected" [class.border-pink]="options.color === 'pink' && d.selected" [class.border-darkgreen]="options.color === 'darkgreen' && d.selected" [class.border-darkblue]="options.color === 'darkblue' && d.selected">{{ d.day }}</span></div><div class="datepicker-buttons" *ngIf="!options.autoApply"><button type="button" class="a-button u-is-primary u-is-small button-{{options.color}}" (click)="today()">{{options.todayText}}</button></div></div><div *ngIf="yearPicker"><div class="datepicker-calendar-years-container" slimScroll [options]="scrollOptions"><span class="year" *ngFor="let y of years; let i = index" (click)="selectYear($event, y)">{{ y }}</span></div></div></div></div></div>`,
  styles: [`.datepicker-container{position:relative}.datepicker-container .datepicker-input-container{display:block;background:0 0}.datepicker-container .datepicker-input-container .datepicker-input{display:inline-block;width:160px;margin-right:10px;font-size:14px;color:#000}.datepicker-container .datepicker-input-container .datepicker-input::-webkit-input-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input::-moz-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input:-ms-input-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input:-moz-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input-icon{display:inline-block}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i,.datepicker-container .datepicker-input-container .datepicker-input-icon i{cursor:pointer}.datepicker-container .datepicker-input-container .datepicker-input-icon i svg{width:15px;height:15px}.datepicker-container .datepicker-calendar{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:250px;top:40px;position:absolute;z-index:99;background:#fff;border-bottom-left-radius:4px;border-bottom-right-radius:4px;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);box-shadow:0 2px 5px rgba(0,0,0,.5)}.datepicker-container .datepicker-calendar .datepicker-calendar-top{width:100%;height:80px;display:inline-block;position:relative}.datepicker-container .datepicker-calendar .datepicker-calendar-top .year-title{display:block;margin-top:12px;color:#fff;font-size:28px;text-align:center}.datepicker-container .datepicker-calendar .datepicker-calendar-top button{width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin:0 auto;color:#fff;text-transform:uppercase;background:0 0;border:0;outline:0;font-size:12px;cursor:pointer;position:relative}.datepicker-container .datepicker-calendar .datepicker-calendar-top button svg{display:block;float:left;width:15px;height:15px;position:absolute;top:2px;left:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-top .close{position:absolute;top:5px;right:5px;font-size:20px;color:#fff;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-top .close svg{width:12px;height:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container{display:inline-block;width:100%;padding:10px;background:#ddd}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-title{color:#000}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section{width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;font-size:14px;color:#ddd;text-transform:uppercase}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i:first-child{margin-left:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i:last-child{margin-right:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-day-names{width:230px;margin-top:10px;display:inline-block;border:1px solid transparent}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-day-names span{font-size:12px;display:block;float:left;width:calc(100%/7);text-align:center}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container{width:230px;margin-top:5px;display:inline-block;border:1px solid transparent}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;float:left;font-size:14px;width:calc(100%/7);height:33px;text-align:center;border-radius:50%;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day.selected,.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day:hover:not(.disabled){border:1px solid #333;border-radius:4px;color:#fff!important}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day.disabled{pointer-events:none}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day.today{background-color:#fff}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container{width:100%;height:240px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;float:left;font-size:14px;color:#000;width:calc(100%/4);height:50px;text-align:center;border-radius:50%;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year.selected,.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year:hover{border:1px solid #333;border-radius:4px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-buttons{width:235px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-buttons button{width:100%;outline:0;display:inline-block;color:#fff;margin-right:5px;cursor:pointer;text-align:center;padding:5px 10px;border:1px solid #333;border-radius:4px}.datepicker-container svg{display:block;width:20px;height:20px}`],
  providers: [CALENDAR_VALUE_ACCESSOR],
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() options: DatePickerOptions;
  @Input() inputEvents: EventEmitter<{ type: string, data: string | DateModel }>;
  @Output() outputEvents: EventEmitter<{ type: string, data: string | DateModel }>;

  @Input() texts: DatePickerTexts;

  ngOnChanges(event: any) {
    if ('texts' in event) {
      this.options.clearText = event.texts.currentValue.clearText;
      this.options.todayText = event.texts.currentValue.todayText;
      this.options.selectYearText = event.texts.currentValue.selectYearText;
      this.options.monthName = event.texts.currentValue.monthName;
    }
  }

  date: DateModel;

  opened: boolean;
  currentDate: moment.Moment;
  days: CalendarDate[];
  years: number[];
  yearPicker: boolean;
  scrollOptions: SlimScrollOptions;

  minDate: moment.Moment | any;
  maxDate: moment.Moment | any;

  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  constructor( @Inject(ElementRef) public el: ElementRef) {
    this.opened = false;
    this.currentDate = Moment();
    this.options = this.options || {};
    this.days = [];
    this.years = [];
    this.date = new DateModel({
      day: null,
      month: null,
      year: null,
      formatted: null,
      momentObj: null
    });

    this.outputEvents = new EventEmitter<{ type: string, data: string | DateModel }>();

    if (!this.inputEvents) {
      return;
    }

    this.inputEvents.subscribe((event: { type: string, data: string | DateModel }) => {
      if (event.type === 'setDate') {
        this.value = event.data as DateModel;
      } else if (event.type === 'default') {
        if (event.data === 'open') {
          this.open();
        } else if (event.data === 'close') {
          this.close();
        }
      }
    });
  }

  get value(): DateModel {
    return this.date;
  }

  set value(date: DateModel) {
    if (!date) { return; }
    this.date = date;
    this.onChangeCallback(date);
  }

  ngOnInit() {
    this.options = new DatePickerOptions(this.options);
    this.scrollOptions = {
      barBackground: '#C9C9C9',
      barWidth: '7',
      gridBackground: '#C9C9C9',
      gridWidth: '2'
    };

    if (this.options.initialDate instanceof Date) {
      this.currentDate = Moment(this.options.initialDate);
      this.selectDate(null, this.currentDate);
    }

    if (this.options.minDate instanceof Date) {
      this.minDate = Moment(this.options.minDate);
    } else {
      this.minDate = null;
    }

    if (this.options.maxDate instanceof Date) {
      this.maxDate = Moment(this.options.maxDate);
    } else {
      this.maxDate = null;
    }

    this.generateYears();
    this.generateCalendar();
    this.outputEvents.emit({ type: 'default', data: 'init' });

    if (typeof window !== 'undefined') {
      const body = document.querySelector('body');
      body.addEventListener('click', e => {
        if (!this.opened || !e.target) { return; };
        if (this.el.nativeElement !== e.target && !this.el.nativeElement.contains((<any>e.target))) {
          this.close();
        }
      }, false);
    }

    if (this.inputEvents) {
      this.inputEvents.subscribe((e: any) => {
        if (e.type === 'action') {
          if (e.data === 'toggle') {
            this.toggle();
          }
          if (e.data === 'close') {
            this.close();
          }
          if (e.data === 'open') {
            this.open();
          }
        }

        if (e.type === 'setDate') {
          if (!(e.data instanceof Date)) {
            throw new Error(`Input data must be an instance of Date!`);
          }
          const date: moment.Moment = Moment(e.data);
          if (!date) {
            throw new Error(`Invalid date: ${e.data}`);
          }
          this.value = {
            day: date.format('DD'),
            month: date.format('MM'),
            year: date.format('YYYY'),
            formatted: date.format(this.options.format),
            momentObj: date
          };
        }
      });
    }
  }

  generateCalendar() {
    const date: moment.Moment = Moment(this.currentDate);
    const month = date.month();
    const year = date.year();
    let n = 1;
    const firstWeekDay = (this.options.firstWeekdaySunday) ? date.date(2).day() : date.date(1).day();

    if (firstWeekDay !== 1) {
      n -= (firstWeekDay + 6) % 7;
    }

    this.days = [];
    const selectedDate: moment.Moment = this.date.momentObj;
    for (let i = n; i <= date.endOf('month').date(); i += 1) {
      const currentDate: moment.Moment = Moment(`${i}.${month + 1}.${year}`, 'DD.MM.YYYY');
      const today: boolean = (Moment().isSame(currentDate, 'day') && Moment().isSame(currentDate, 'month')) ? true : false;
      const selected: boolean = (selectedDate && selectedDate.isSame(currentDate, 'day')
        && selectedDate.isSame(currentDate, 'month')) ? true : false;
      let betweenMinMax = true;

      if (this.minDate !== null) {
        if (this.maxDate !== null) {
          betweenMinMax = currentDate.isBetween(this.minDate, this.maxDate, 'day', '[]') ? true : false;
        } else {
          betweenMinMax = currentDate.isBefore(this.minDate, 'day') ? false : true;
        }
      } else {
        if (this.maxDate !== null) {
          betweenMinMax = currentDate.isAfter(this.maxDate, 'day') ? false : true;
        }
      }

      const day: CalendarDate = {
        day: i > 0 ? i : null,
        month: i > 0 ? month : null,
        year: i > 0 ? year : null,
        enabled: i > 0 ? betweenMinMax : false,
        today: i > 0 && today ? true : false,
        selected: i > 0 && selected ? true : false,
        momentObj: currentDate
      };

      this.days.push(day);
    }
  }

  selectDate(e: MouseEvent, date: moment.Moment) {
    if (e) { e.preventDefault(); }

    setTimeout(() => {
      this.value = {
        day: date.format('DD'),
        month: date.format('MM'),
        year: date.format('YYYY'),
        formatted: date.format(this.options.format),
        momentObj: date
      };
      this.generateCalendar();

      this.outputEvents.emit({ type: 'dateChanged', data: this.value });
    });

    this.opened = false;
  }

  selectYear(e: MouseEvent, year: number) {
    e.preventDefault();

    setTimeout(() => {
      const date: moment.Moment = this.currentDate.year(year);
      this.value = {
        day: date.format('DD'),
        month: date.format('MM'),
        year: date.format('YYYY'),
        formatted: date.format(this.options.format),
        momentObj: date
      };
      this.yearPicker = false;
      this.generateCalendar();
    });
  }

  generateYears() {
    const date: moment.Moment = this.minDate || Moment().year(Moment().year() - 40);
    const toDate: moment.Moment = this.maxDate || Moment().year(Moment().year() + 40);
    const years = toDate.year() - date.year();

    for (let i = 0; i < years; i++) {
      this.years.push(date.year());
      date.add(1, 'year');
    }
  }

  writeValue(date: DateModel) {
    if (!date) { return; }
    this.date = date;
  }

  inputChange(event: string): void {
    if (event.match('(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))')) {
      const date: moment.Moment = new Moment(event, 'YYYY-MM-DD');
      if (date.isValid()) {
        this.value = {
          day: date.format('DD'),
          month: date.format('MM'),
          year: date.format('YYYY'),
          formatted: date.format(this.options.format),
          momentObj: date
        };
        this.currentDate = date;
        this.generateCalendar();
        this.onChangeCallback(this.date);
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  prevMonth() {
    this.currentDate = this.currentDate.subtract(1, 'month');
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = this.currentDate.add(1, 'month');
    this.generateCalendar();
  }

  today() {
    this.currentDate = Moment();
    this.selectDate(null, this.currentDate);
  }

  toggle() {
    this.opened = !this.opened;
    if (this.opened) {
      this.onOpen();
    }

    this.outputEvents.emit({ type: 'default', data: 'opened' });
  }

  open() {
    this.opened = true;
    this.onOpen();
  }

  close() {
    this.opened = false;
    this.outputEvents.emit({ type: 'default', data: 'closed' });
  }

  onOpen() {
    this.yearPicker = false;
  }

  openYearPicker() {
    setTimeout(() => this.yearPicker = true);
  }

  clear() {
    this.value = { day: null, month: null, year: null, momentObj: null, formatted: null };
    this.close();
  }

}
