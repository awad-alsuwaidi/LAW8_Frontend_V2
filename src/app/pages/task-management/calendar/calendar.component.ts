import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  EventSourceInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { API_Config } from 'src/app/@core/api/api-config/api.config';
import { ApiService } from 'src/app/@core/api/api.service';
import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
import { LanguageService } from 'src/app/@core/services';
import { SharedModule } from 'src/app/@shared/shared.module';
import { CalenderFilterComponent } from './components/calender-filter/calender-filter.component';
import { CalenderFilterChipsComponent } from './components/calender-filter-chips/calender-filter-chips.component';
import { generateHexColorFromString } from 'src/app/@core/utilities/functions/color-from-string';
import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
import { DialogService } from 'primeng/dynamicdialog';
import { TaskManagementActivityEditorComponent } from '../components/task-management-activity-editor/task-management-activity-editor.component';
import { lightenColor } from 'src/app/@core/utilities/functions/lighten-color';
import { combineLatest, finalize } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    SharedModule,
    CalenderFilterComponent,
    CalenderFilterChipsComponent,
    SharedButtonComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;

  calendarOptions?: CalendarOptions;
  _apiService = inject(ApiService);
  _unsubscribe = inject(UnsubscribeService);
  _languageService = inject(LanguageService);
  _dialogService = inject(DialogService);

  events!: EventSourceInput;
  data: any[] = [];
  filter: any = {};
  isLoading: boolean = true;

  currentUserId?: string;
  usersLookup: any[] = [];
  activityLookup: any[] = [];

  private currentViewStart?: string;
  private currentViewEnd?: string;

  ngOnInit(): void {
    this.bootstrap();
  }

  private extractList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    const d = res.data ?? res.result ?? res;
    if (Array.isArray(d)) return d;
    return d?.items ?? d?.dataList ?? [];
  }

  private extractArray(res: any, key?: string): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    
    if (key && Array.isArray(res[key])) return res[key];
    
    if (res.data) {
      if (Array.isArray(res.data)) return res.data;
      if (key && Array.isArray(res.data[key])) return res.data[key];
    }

    if (res.result) {
      if (Array.isArray(res.result)) return res.result;
      if (key && Array.isArray(res.result[key])) return res.result[key];
    }

    return [];
  }

  private bootstrap() {
    combineLatest({
      users: this._apiService.get('Calendar/users'),
      activity: this._apiService.get(API_Config.general.getLookups, {
        types: 'activityTypes',
      }),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          const rawUsers = this.extractArray(res.users);
          this.usersLookup = rawUsers.map((u: any) => ({
            ...u,
            id: u.userId || u.id, 
            name: u.name || u.nameEn
          }));

          const rawActivities = this.extractArray(res.activity, 'activityTypes');
          this.activityLookup = rawActivities.map((a: any) => ({
            ...a,
            id: a.id,
            name: a.nameEn || a.name
          }));

          this.currentUserId = this.usersLookup.find(
            (u: any) => u.isMe === true,
          )?.id;

          this.filter = {
            user: this.currentUserId ? [this.currentUserId] : [],
            activity: [],
          };

          this.initCalender();
        },
        error: (err) => {
          console.error('Bootstrap error:', err);
          this.initCalender(); 
        }
      });
  }

  private toIds(arr: any, fallback: any[] = []) {
    if (!Array.isArray(arr) || arr.length === 0) return fallback;
    const ids = arr
      .map((x: any) => x?.value ?? x?.id ?? x)
      .filter((x: any) => x !== null && x !== undefined && x !== '');
    return ids.length ? ids : fallback;
  }

  getTaskManagementEvents() {
    if (!this.currentViewStart || !this.currentViewEnd) return;

    const userIds = this.toIds(
      this.filter?.user,
      this.currentUserId ? [this.currentUserId] : [],
    );
    const activityTypeIds = this.toIds(this.filter?.activity, []);

    const params: any = {
      from: this.currentViewStart,
      to: this.currentViewEnd,
    };

    if (userIds.length) params.userIds = userIds.join(',');
    if (activityTypeIds.length)
      params.activityTypeIds = activityTypeIds.join(',');

    this._apiService
      .get(API_Config.taskManagementCalender.events, params)
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.data = this.extractList(res);

          this.events = this.data.map((obj: any) => ({
            id: String(obj.entityId || obj.id),
            title: obj.title || obj.description,
            start: obj.when || obj.startDate,
            extendedProps: {
              userId: obj.userId,
              law_ActivityTypeId: obj.activityTypeId || obj.law_ActivityTypeId,
              time:
                obj.when || obj.startDate
                  ? new Date(obj.when || obj.startDate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '',
            },
          }));

          if (this.fullCalendar) {
            const calendarApi = this.fullCalendar.getApi();
            calendarApi.removeAllEvents();
            calendarApi.addEventSource(this.events);
          }
        },
        error: (err) => {
          console.error('Events API error:', err);
        },
      });
  }

  onFilter(e: any) {
    this.filter = e || { user: [], activity: [] };
    this.getTaskManagementEvents();
  }

  initCalender() {
    this.isLoading = false;

    this.calendarOptions = {
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      headerToolbar: {
        left: 'prev,today,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      buttonText: {
        today: this._languageService.getTransValue('common.today'),
        dayGridMonth: this._languageService.getTransValue('common.month'),
        timeGridWeek: this._languageService.getTransValue('common.week'),
        timeGridDay: this._languageService.getTransValue('common.day'),
        listWeek: this._languageService.getTransValue('common.list'),
      },
      initialView: 'dayGridMonth',
      locale: this._languageService.getSelectedLanguage(),
      weekends: true,
      editable: false,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      eventClick: (arg) => this.handleEventClick(arg),
      eventContent: (arg) => this.renderEventContent(arg),
      datesSet: (arg) => {
        this.currentViewStart = arg.start.toISOString();
        this.currentViewEnd = arg.end.toISOString();
        this.getTaskManagementEvents();
      },

      eventDidMount: (info) => {
        const userId = info?.event?.extendedProps['userId'];
        const selectedUserIds = this.toIds(
          this.filter?.user,
          this.currentUserId ? [this.currentUserId] : [],
        );

        let color = '#1E43D7';
        if (
          userId &&
          this.currentUserId &&
          userId !== this.currentUserId &&
          selectedUserIds.includes(userId)
        ) {
          color = generateHexColorFromString(userId);
        }

        const lightColor = lightenColor(color);
        info.el.style.backgroundColor = lightColor;
        info.el.style.borderColor = color;
        info.el.style.borderRadius = '4px';
        info.el.style.borderInlineStartWidth = '6px';
        info.el.style.color = color;
      },
    };
  }

  handleEventClick(arg: EventClickArg) {
    const entityId = arg.event.id;
    const rowData = this.data.find(
      (item: any) => String(item.entityId || item.id) === entityId,
    );

    this.openActivityEditor(
      rowData ? { ...rowData, id: entityId } : { id: Number(entityId) },
      'view',
    );
  }

  openActivityEditor(rowData?: any, mode?: string) {
    const ref = this._dialogService.open(
      TaskManagementActivityEditorComponent,
      {
        header: this._languageService.getTransValue(
          rowData ? 'matters.viewActivity' : 'matters.addActivity',
        ),
        width: '40vw',
        data: {
          rowData: rowData,
          mode,
        },
      },
    );

    ref.onClose.subscribe((shouldRefresh: boolean) => {
      if (shouldRefresh) {
        this.getTaskManagementEvents();
      }
    });
  }

  renderEventContent(arg: any) {
    const activtyType = arg?.event?.extendedProps['law_ActivityTypeId'];
    const title = arg.event.title;
    const truncatedTitle =
      title.length > 6 ? title.substring(0, 6) + '...' : title;

    return {
      html: `
    <div class="px-0.5 py-0.5">
      <i class="${this.getEventIcon(activtyType)} text-textSecondaryHover"></i>
      <span style="font-size: 12px !important; display: inline-block; margin-left: 4px;">
        ${arg.event.extendedProps.time}
      </span>
      <span 
        class="text-xs font-bold ml-1" 
        title="${title}"
        pTooltip="${title}"
        tooltipPosition="top"
        style="cursor: pointer;">
        ${truncatedTitle}
      </span>
    </div>
    `,
    };
  }

  getEventIcon(activtyType: number): string {
    switch (activtyType) {
      case 1:
        return 'icon-solid-hearing-session';
      case 2:
        return 'icon-solid-task';
      case 4:
        return 'icon-solid-meeting';
      case 5:
        return 'icon-solid-phone';
      case 6:
        return 'icon-solid-report';
      case 7:
        return 'icon-solid-export-meeting';
      case 8:
        return 'icon-solid-judge';
      default:
        return 'icon-bell';
    }
  }

  onFilterUpdate(e: any) {
    this.onFilter(e);
  }

  ngOnDestroy(): void {
    this._unsubscribe.destroy();
  }
}
