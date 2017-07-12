import { Component, ElementRef, Inject, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as moment from 'moment';
var Moment = moment.default || moment;
export var DateModel = (function () {
    function DateModel(obj) {
        this.day = obj && obj.day ? obj.day : null;
        this.month = obj && obj.month ? obj.month : null;
        this.year = obj && obj.year ? obj.year : null;
        this.formatted = obj && obj.formatted ? obj.formatted : null;
        this.momentObj = obj && obj.momentObj ? obj.momentObj : null;
    }
    return DateModel;
}());
export var DatePickerOptions = (function () {
    function DatePickerOptions(obj) {
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
    return DatePickerOptions;
}());
export var CALENDAR_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(function () { return DatePickerComponent; }),
    multi: true
};
export var DatePickerComponent = (function () {
    function DatePickerComponent(el) {
        var _this = this;
        this.el = el;
        this.onTouchedCallback = function () { };
        this.onChangeCallback = function () { };
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
        this.outputEvents = new EventEmitter();
        if (!this.inputEvents) {
            return;
        }
        this.inputEvents.subscribe(function (event) {
            if (event.type === 'setDate') {
                _this.value = event.data;
            }
            else if (event.type === 'default') {
                if (event.data === 'open') {
                    _this.open();
                }
                else if (event.data === 'close') {
                    _this.close();
                }
            }
        });
    }
    Object.defineProperty(DatePickerComponent.prototype, "value", {
        get: function () {
            return this.date;
        },
        set: function (date) {
            if (!date) {
                return;
            }
            this.date = date;
            this.onChangeCallback(date);
        },
        enumerable: true,
        configurable: true
    });
    DatePickerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.options = new DatePickerOptions(this.options);
        console.log(this.options.monthName);
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
        }
        else {
            this.minDate = null;
        }
        if (this.options.maxDate instanceof Date) {
            this.maxDate = Moment(this.options.maxDate);
        }
        else {
            this.maxDate = null;
        }
        this.generateYears();
        this.generateCalendar();
        this.outputEvents.emit({ type: 'default', data: 'init' });
        if (typeof window !== 'undefined') {
            var body = document.querySelector('body');
            body.addEventListener('click', function (e) {
                if (!_this.opened || !e.target) {
                    return;
                }
                ;
                if (_this.el.nativeElement !== e.target && !_this.el.nativeElement.contains(e.target)) {
                    _this.close();
                }
            }, false);
        }
        if (this.inputEvents) {
            this.inputEvents.subscribe(function (e) {
                if (e.type === 'action') {
                    if (e.data === 'toggle') {
                        _this.toggle();
                    }
                    if (e.data === 'close') {
                        _this.close();
                    }
                    if (e.data === 'open') {
                        _this.open();
                    }
                }
                if (e.type === 'setDate') {
                    if (!(e.data instanceof Date)) {
                        throw new Error("Input data must be an instance of Date!");
                    }
                    var date = Moment(e.data);
                    if (!date) {
                        throw new Error("Invalid date: " + e.data);
                    }
                    _this.value = {
                        day: date.format('DD'),
                        month: date.format('MM'),
                        year: date.format('YYYY'),
                        formatted: date.format(_this.options.format),
                        momentObj: date
                    };
                }
            });
        }
    };
    DatePickerComponent.prototype.generateCalendar = function () {
        var date = Moment(this.currentDate);
        var month = date.month();
        var year = date.year();
        var n = 1;
        var firstWeekDay = (this.options.firstWeekdaySunday) ? date.date(2).day() : date.date(1).day();
        if (firstWeekDay !== 1) {
            n -= (firstWeekDay + 6) % 7;
        }
        this.days = [];
        var selectedDate = this.date.momentObj;
        for (var i = n; i <= date.endOf('month').date(); i += 1) {
            var currentDate = Moment(i + "." + (month + 1) + "." + year, 'DD.MM.YYYY');
            var today = (Moment().isSame(currentDate, 'day') && Moment().isSame(currentDate, 'month')) ? true : false;
            var selected = (selectedDate && selectedDate.isSame(currentDate, 'day')) ? true : false;
            var betweenMinMax = true;
            if (this.minDate !== null) {
                if (this.maxDate !== null) {
                    betweenMinMax = currentDate.isBetween(this.minDate, this.maxDate, 'day', '[]') ? true : false;
                }
                else {
                    betweenMinMax = currentDate.isBefore(this.minDate, 'day') ? false : true;
                }
            }
            else {
                if (this.maxDate !== null) {
                    betweenMinMax = currentDate.isAfter(this.maxDate, 'day') ? false : true;
                }
            }
            var day = {
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
    };
    DatePickerComponent.prototype.selectDate = function (e, date) {
        var _this = this;
        if (e) {
            e.preventDefault();
        }
        setTimeout(function () {
            _this.value = {
                day: date.format('DD'),
                month: date.format('MM'),
                year: date.format('YYYY'),
                formatted: date.format(_this.options.format),
                momentObj: date
            };
            _this.generateCalendar();
            _this.outputEvents.emit({ type: 'dateChanged', data: _this.value });
        });
        this.opened = false;
    };
    DatePickerComponent.prototype.selectYear = function (e, year) {
        var _this = this;
        e.preventDefault();
        setTimeout(function () {
            var date = _this.currentDate.year(year);
            _this.value = {
                day: date.format('DD'),
                month: date.format('MM'),
                year: date.format('YYYY'),
                formatted: date.format(_this.options.format),
                momentObj: date
            };
            _this.yearPicker = false;
            _this.generateCalendar();
        });
    };
    DatePickerComponent.prototype.generateYears = function () {
        var date = this.minDate || Moment().year(Moment().year() - 40);
        var toDate = this.maxDate || Moment().year(Moment().year() + 40);
        var years = toDate.year() - date.year();
        for (var i = 0; i < years; i++) {
            this.years.push(date.year());
            date.add(1, 'year');
        }
    };
    DatePickerComponent.prototype.writeValue = function (date) {
        if (!date) {
            return;
        }
        this.date = date;
    };
    DatePickerComponent.prototype.inputChange = function (event) {
        if (event.match('(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))')) {
            var date = new Moment(event, 'YYYY-MM-DD');
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
    };
    DatePickerComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    DatePickerComponent.prototype.registerOnTouched = function (fn) {
        this.onTouchedCallback = fn;
    };
    DatePickerComponent.prototype.prevMonth = function () {
        this.currentDate = this.currentDate.subtract(1, 'month');
        this.generateCalendar();
    };
    DatePickerComponent.prototype.nextMonth = function () {
        this.currentDate = this.currentDate.add(1, 'month');
        this.generateCalendar();
    };
    DatePickerComponent.prototype.today = function () {
        this.currentDate = Moment();
        this.selectDate(null, this.currentDate);
    };
    DatePickerComponent.prototype.toggle = function () {
        this.opened = !this.opened;
        if (this.opened) {
            this.onOpen();
        }
        this.outputEvents.emit({ type: 'default', data: 'opened' });
    };
    DatePickerComponent.prototype.open = function () {
        this.opened = true;
        this.onOpen();
    };
    DatePickerComponent.prototype.close = function () {
        this.opened = false;
        this.outputEvents.emit({ type: 'default', data: 'closed' });
    };
    DatePickerComponent.prototype.onOpen = function () {
        this.yearPicker = false;
    };
    DatePickerComponent.prototype.openYearPicker = function () {
        var _this = this;
        setTimeout(function () { return _this.yearPicker = true; });
    };
    DatePickerComponent.prototype.clear = function () {
        this.value = { day: null, month: null, year: null, momentObj: null, formatted: null };
        this.close();
    };
    DatePickerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ng2-datepicker',
                    template: "<div class=\"datepicker-container u-is-unselectable\"><div class=\"input-group\"><input class=\"datepicker-input form-control\" [ngModel]=\"date.formatted\" (ngModelChange)=\"inputChange($event)\"> <span _ngcontent-c2=\"\" class=\"input-group-addon\" (click)=\"toggle()\"><span _ngcontent-c2=\"\" class=\"glyphicon glyphicon-calendar\"></span></span></div><div class=\"datepicker-calendar\" *ngIf=\"opened\"><div class=\"datepicker-calendar-top {{options.color}}\"><span class=\"year-title\">{{ currentDate.format('YYYY') }}</span> <button type=\"button\" (click)=\"openYearPicker()\" *ngIf=\"!yearPicker\">{{options.selectYearText}}</button> <i class=\"close\" (click)=\"close()\" class=\"fill-{{options.color}}\"><svg width=\"350px\" height=\"349px\" viewBox=\"-1 0 350 349\" version=\"1.1\"><g id=\"delete\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\"><path d=\"M336.559,68.611 L231.016,174.165 L336.559,279.714 C352.258,295.419 352.258,320.859 336.559,336.564 C328.715,344.408 318.431,348.333 308.152,348.333 C297.856,348.333 287.571,344.414 279.733,336.564 L174.167,231.003 L68.609,336.563 C60.766,344.407 50.481,348.332 40.193,348.332 C29.908,348.332 19.63,344.413 11.78,336.563 C-3.919,320.865 -3.919,295.424 11.78,279.713 L117.32,174.164 L11.774,68.611 C-3.925,52.912 -3.925,27.466 11.774,11.767 C27.47,-3.92 52.901,-3.92 68.603,11.767 L174.166,117.321 L279.721,11.767 C295.426,-3.92 320.86,-3.92 336.553,11.767 C352.258,27.466 352.258,52.912 336.559,68.611 Z\" id=\"Shape\" fill=\"#000000\" fill-rule=\"nonzero\"></path></g></svg></i></div><div class=\"datepicker-calendar-container\"><div *ngIf=\"!yearPicker\"><div class=\"datepicker-calendar-month-section\"><i (click)=\"prevMonth()\" class=\"fill-{{options.color}}\"><svg width=\"190px\" height=\"306px\" viewBox=\"58 0 190 306\" version=\"1.1\"><g id=\"keyboard-left-arrow-button\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(58.000000, 0.000000)\"><g id=\"chevron-left\" fill-rule=\"nonzero\" fill=\"#000000\"><polygon id=\"Shape\" points=\"189.35 35.7 153.65 0 0.65 153 153.65 306 189.35 270.3 72.05 153\"></polygon></g></g></svg> </i><span class=\"month-title\">{{ options.monthName[currentDate.month()] }}</span> <i (click)=\"nextMonth()\" class=\"fill-{{options.color}}\"><svg width=\"190px\" height=\"306px\" viewBox=\"58 0 190 306\" version=\"1.1\"><g id=\"keyboard-right-arrow-button\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(58.000000, 0.000000)\"><g id=\"chevron-right\" fill-rule=\"nonzero\" fill=\"#000000\"><polygon id=\"Shape\" points=\"36.35 0 0.65 35.7 117.95 153 0.65 270.3 36.35 306 189.35 153\"></polygon></g></g></svg></i></div><div class=\"datepicker-calendar-day-names\"><span>S</span> <span>M</span> <span>T</span> <span>W</span> <span>T</span> <span>F</span> <span>S</span></div><div class=\"datepicker-calendar-days-container\"><span class=\"day\" *ngFor=\"let d of days; let i = index\" (click)=\"selectDate($event, d.momentObj)\" [ngClass]=\"{ 'disabled': !d.enabled, 'today': d.today, 'selected': d.selected }\" [class.label-red]=\"options.color === 'red' && d.today\" [class.label-green]=\"options.color === 'green' && d.today\" [class.label-blue]=\"options.color === 'blue' && d.today\" [class.label-orange]=\"options.color === 'orange' && d.today\" [class.label-violet]=\"options.color === 'violet' && d.today\" [class.label-pink]=\"options.color === 'pink' && d.today\" [class.label-darkgreen]=\"options.color === 'darkgreen' && d.today\" [class.label-darkblue]=\"options.color === 'darkblue' && d.today\">{{ d.day }}</span></div><div class=\"datepicker-buttons\" *ngIf=\"!options.autoApply\"><button type=\"button\" class=\"a-button u-is-secondary u-is-small button-{{options.color}}\" (click)=\"clear()\">{{options.clearText}}</button> <button type=\"button\" class=\"a-button u-is-primary u-is-small button-{{options.color}}\" (click)=\"today()\">{{options.todayText}}</button></div></div><div *ngIf=\"yearPicker\"><div class=\"datepicker-calendar-years-container\" slimScroll [options]=\"scrollOptions\"><span class=\"year\" *ngFor=\"let y of years; let i = index\" (click)=\"selectYear($event, y)\">{{ y }}</span></div></div></div></div></div>",
                    styles: [".datepicker-container{display:inline-block;position:relative}.datepicker-container .datepicker-input-container{background:0 0}.datepicker-container .datepicker-input-container .datepicker-input{display:inline-block;width:160px;margin-right:10px;font-size:14px;color:#000}.datepicker-container .datepicker-input-container .datepicker-input::-webkit-input-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input::-moz-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input:-ms-input-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input:-moz-placeholder{color:#343a40}.datepicker-container .datepicker-input-container .datepicker-input-icon{display:inline-block}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i,.datepicker-container .datepicker-input-container .datepicker-input-icon i{cursor:pointer}.datepicker-container .datepicker-input-container .datepicker-input-icon i svg{width:15px;height:15px}.datepicker-container .datepicker-calendar{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;width:250px;top:40px;position:absolute;z-index:99;background:#fff;border-bottom-left-radius:4px;border-bottom-right-radius:4px;-webkit-box-shadow:0 2px 5px rgba(0,0,0,.5);box-shadow:0 2px 5px rgba(0,0,0,.5)}.datepicker-container .datepicker-calendar .datepicker-calendar-top{width:100%;height:80px;display:inline-block;position:relative}.datepicker-container .datepicker-calendar .datepicker-calendar-top .year-title{display:block;margin-top:12px;color:#fff;font-size:28px;text-align:center}.datepicker-container .datepicker-calendar .datepicker-calendar-top button{width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;margin:0 auto;color:#fff;text-transform:uppercase;background:0 0;border:0;outline:0;font-size:12px;cursor:pointer;position:relative}.datepicker-container .datepicker-calendar .datepicker-calendar-top button svg{display:block;float:left;width:15px;height:15px;position:absolute;top:2px;left:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-top .close{position:absolute;top:5px;right:5px;font-size:20px;color:#fff;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-top .close svg{width:12px;height:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container{display:inline-block;width:100%;padding:10px;background:#ddd}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-title{color:#000}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section{width:100%;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;font-size:14px;color:#ddd;text-transform:uppercase}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i:first-child{margin-left:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-month-section i:last-child{margin-right:12px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-day-names{width:230px;margin-top:10px;display:inline-block;border:1px solid transparent}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-day-names span{font-size:12px;display:block;float:left;width:calc(100%/7);text-align:center}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container{width:230px;margin-top:5px;display:inline-block;border:1px solid transparent}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;float:left;font-size:14px;width:calc(100%/7);height:33px;text-align:center;border-radius:50%;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day.selected,.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day:hover:not(.disabled){border:1px solid #366aab;border-radius:4px;color:#fff}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-days-container .day.disabled{pointer-events:none}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container{width:100%;height:240px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year{display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;float:left;font-size:14px;color:#8e8e8e;width:calc(100%/4);height:50px;text-align:center;border-radius:50%;cursor:pointer}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year.selected,.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-calendar-years-container .year:hover{border:1px solid #366aab;border-radius:4px}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-buttons{width:235px;display:-webkit-box;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center}.datepicker-container .datepicker-calendar .datepicker-calendar-container .datepicker-buttons button{width:100%;outline:0;display:inline-block;color:#fff;margin-right:5px;cursor:pointer;text-align:center;padding:5px 10px;border:1px solid #366aab;border-radius:4px}.datepicker-container svg{display:block;width:20px;height:20px}"],
                    providers: [CALENDAR_VALUE_ACCESSOR],
                },] },
    ];
    /** @nocollapse */
    DatePickerComponent.ctorParameters = function () { return [
        { type: ElementRef, decorators: [{ type: Inject, args: [ElementRef,] },] },
    ]; };
    DatePickerComponent.propDecorators = {
        'options': [{ type: Input },],
        'inputEvents': [{ type: Input },],
        'outputEvents': [{ type: Output },],
    };
    return DatePickerComponent;
}());
//# sourceMappingURL=ng2-datepicker.component.js.map