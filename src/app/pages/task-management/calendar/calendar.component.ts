// import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import {
//   FullCalendarComponent,
//   FullCalendarModule,
// } from '@fullcalendar/angular';
// import {
//   CalendarOptions,
//   EventClickArg,
//   EventSourceInput,
// } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import listPlugin from '@fullcalendar/list';
// import interactionPlugin from '@fullcalendar/interaction';
// import { API_Config } from 'src/app/@core/api/api-config/api.config';
// import { ApiRes } from 'src/app/@core/models/apiRes-model';
// import { ApiService } from 'src/app/@core/api/api.service';
// import { UnsubscribeService } from 'src/app/@shared/services/unsubscribe/unsubscribe.service';
// import { LanguageService } from 'src/app/@core/services';
// import { SharedModule } from 'src/app/@shared/shared.module';
// import { CalenderFilterComponent } from './components/calender-filter/calender-filter.component';
// import { CalenderFilterChipsComponent } from './components/calender-filter-chips/calender-filter-chips.component';
// import { generateHexColorFromString } from 'src/app/@core/utilities/functions/color-from-string';
// import { SharedButtonComponent } from 'src/app/@shared/components/shared-button/shared-button.component';
// import { DialogService } from 'primeng/dynamicdialog';
// import { TaskManagementActivityEditorComponent } from '../components/task-management-activity-editor/task-management-activity-editor.component';
// import { lightenColor } from 'src/app/@core/utilities/functions/lighten-color';
// import { CalendarEventDto } from './interfaces/calendar-events';

// @Component({
//   selector: 'app-calendar',
//   standalone: true,
//   imports: [
//     FullCalendarModule,
//     SharedModule,
//     CalenderFilterComponent,
//     CalenderFilterChipsComponent,
//     SharedButtonComponent,
//   ],
//   templateUrl: './calendar.component.html',
//   styleUrl: './calendar.component.scss',
// })
// export class CalendarComponent implements OnInit, OnDestroy {
//   @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;
//   calendarOptions?: CalendarOptions;
//   _apiService = inject(ApiService);
//   _unsubscribe = inject(UnsubscribeService);
//   _languageService = inject(LanguageService);
//   _dialogService = inject(DialogService);
//   events!: EventSourceInput;
//   data: CalendarEventDto[] = [];
//   filter: any;
//   isLoading: boolean = true;
//   ngOnInit(): void {
//     this.getTaskManagementEvents();
//   }
//   getTaskManagementEvents(body?: any) {
//     this.calendarOptions = undefined;
//     const payload = {
//       userIds: body?.user?.map((v: any) => v.value),
//       activityTypeIds: body?.activity?.map((v: any) => v.value),
//     };
//     this._apiService
//       .post(API_Config.taskManagementCalender.get, payload)
//       .pipe(this._unsubscribe.takeUntilDestroy())
//       .subscribe({
//         next: (res: ApiRes) => {
//           this.data = res['result'];
//           this.events = res['result'].map((obj: any) => ({
//             id: obj?.id,
//             title: obj?.law_ActivityType,
//             start: obj?.startDate,
//             extendedProps: {
//               userId: obj?.usrSign,
//               law_ActivityTypeId: obj?.law_ActivityTypeId,
//               time: obj?.startDate
//                 ? new Date(obj?.startDate).toLocaleTimeString([], {
//                     hour: '2-digit',
//                     minute: '2-digit',
//                   })
//                 : '',
//             },
//           }));
//           console.log('events', this.events);
//           this.initCalender();
//         },
//       });
//   }
//   initCalender() {
//     this.isLoading = false;
//     this.calendarOptions = {
//       plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
//       headerToolbar: {
//         left: 'prev,today,next',
//         center: 'title',
//         right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
//       },
//       buttonText: {
//         today: this._languageService.getTransValue('common.today'), // Translate 'today' to 'Hoy'
//         dayGridMonth: this._languageService.getTransValue('common.month'), // Translate 'dayGridMonth' to 'Mes'
//         timeGridWeek: this._languageService.getTransValue('common.week'), // Translate 'timeGridWeek' to 'Semana'
//         timeGridDay: this._languageService.getTransValue('common.day'), // Translate 'timeGridDay' to 'Día'
//         listWeek: this._languageService.getTransValue('common.list'), // Translate 'listWeek' to 'Lista de la semana'
//       },
//       initialView: 'dayGridMonth',
//       initialEvents: this.events,
//       eventDidMount: (info) => {
//         const userId = info?.event?.extendedProps['userId'];

//         // لو الفلتر فيه يوزر محددين
//         const selectedUserIds =
//           this.filter?.user?.map((u: any) => u.value) || [];

//         // شوف هل اليوزر ده مختار؟
//         const isUserSelected = selectedUserIds.includes(userId);

//         // لو مختار يبقى خليه بلون مميز، لو مش مختار يبقى لون افتراضي
//         let color = '#1E43D7'; // لون افتراضي رمادي
//         if (isUserSelected) {
//           color = generateHexColorFromString(userId);
//         }

//         const lightColor = lightenColor(color);
//         info.el.style.backgroundColor = lightColor;
//         info.el.style.borderColor = color;
//         info.el.style.borderRadius = '4px';
//         info.el.style.borderInlineStartWidth = '6px';
//         info.el.style.color = color;
//       },

//       // eventDidMount: (info) => {
//       //   const userId = info?.event?.extendedProps['userId'];
//       //   const color = generateHexColorFromString(userId);
//       //   const lightColor = lightenColor(color);
//       //   info.el.style.backgroundColor = lightColor;
//       //   info.el.style.borderColor = color;
//       //   info.el.style.borderRadius = '4px';
//       //   info.el.style.borderInlineStartWidth = '6px';
//       //   info.el.style.color = color;
//       // },
//       locale: this._languageService.getSelectedLanguage(),
//       weekends: true,
//       editable: false,
//       selectable: true,
//       selectMirror: true,
//       dayMaxEvents: true,
//       eventClick: this.handleEventClick.bind(this),
//       eventContent: this.renderEventContent.bind(this),
//     };
//   }
//   renderEventContent(arg: any) {
//     const activtyType = arg?.event?.extendedProps['law_ActivityTypeId'];

//     // قطع النص إذا زاد عن 6 حروف
//     const title = arg.event.title;
//     const truncatedTitle =
//       title.length > 6 ? title.substring(0, 6) + '...' : title;

//     return {
//       html: `
//     <div class="px-0.5 py-0.5">
//       <i class="${this.getEventIcon(activtyType)} text-textSecondaryHover"></i>
//       <span style="font-size: 12px !important; display: inline-block; margin-left: 4px;">
//         ${arg.event.extendedProps.time}
//       </span>
//       <span 
//         class="text-xs font-bold ml-1" 
//         title="${title}"
//         pTooltip="${title}"
//         tooltipPosition="top"
//         style="cursor: pointer;">
//         ${truncatedTitle}
//       </span>
      
//       <!-- 
//       <span 
//         class="text-xs font-bold ml-1" 
//         title="${title}"
//         style="cursor: pointer;">
//         ${truncatedTitle}
//       </span>
//       -->
//     </div>
//     `,
//     };
//   }
//   //   renderEventContent(arg: any) {
//   //     const activtyType = arg?.event?.extendedProps['law_ActivityTypeId'];
//   //     // <i class="${this.getEventIcon(activtyType)} text-textSecondaryHover"></i>
//   //     return {
//   //   html: `
//   //   <div class="px-0.5 py-0.5">
//   //     <i class="${this.getEventIcon(activtyType)} text-textSecondaryHover"></i>
//   //     <span style="font-size: 12px !important; display: inline-block; margin-left: 4px;">
//   //       ${arg.event.extendedProps.time}
//   //     </span>
//   //     <span class="text-xs font-bold ml-1">${arg.event.title}</span>
//   //   </div>
//   // `

//   //     }
//   //   }
//   // renderEventContent(arg: any) {
//   //   const activtyType = arg?.event?.extendedProps['law_ActivityTypeId'];

//   //   const title = arg.event.title;
//   //   const truncatedTitle = title.length > 6 ? title.substring(0, 6) + '...' : title;

//   //   return {
//   //     html: `
//   //     <div class="px-0.5 py-0.5">
//   //       <i class="${this.getEventIcon(activtyType)} text-textSecondaryHover"></i>
//   //       <span style="font-size: 12px !important; display: inline-block; margin-left: 4px;">
//   //         ${arg.event.extendedProps.time}
//   //       </span>
//   //       <span class="text-xs font-bold ml-1">${truncatedTitle}</span>
//   //     </div>
//   //     `
//   //   }
//   // }
//   getEventIcon(activtyType: number): string {
//     switch (activtyType) {
//       case 1:
//         return 'icon-solid-hearing-session';
//       case 2:
//         return 'icon-solid-task';
//       case 4:
//         return 'icon-solid-meeting';
//       case 5:
//         return 'icon-solid-phone';
//       case 6:
//         return 'icon-solid-report';
//       case 7:
//         return 'icon-solid-export-meeting';
//       case 8:
//         return 'icon-solid-judge';

//       default:
//         return 'icon-bell';
//     }
//   }

//   handleEventClick(arg: EventClickArg) {
//     const rowData: CalendarEventDto = this.data.find(
//       (item: CalendarEventDto) => item.id === +arg.event.id
//     ) as CalendarEventDto;
//     this.openActivityEditor(rowData, 'view');
//   }
//   onFilter(e: any) {
//     this.filter = e;
//     console.log('filter', this.filter);
//     if (this.filter) this.getTaskManagementEvents(this.filter);
//   }
//   onFilterUpdate(e: any) {
//     this.filter = { ...e };
//     if (this.filter) this.getTaskManagementEvents(this.filter);
//   }
//   openActivityEditor(rowData?: CalendarEventDto, mode?: string) {
//     const ref = this._dialogService.open(
//       TaskManagementActivityEditorComponent,
//       {
//         header: this._languageService.getTransValue(
//           rowData ? 'matters.viewActivity' : 'matters.addActivity'
//         ),
//         width: '40vw',
//         data: {
//           rowData: {
//             ...rowData,
//             law_ActivityStatusId: 4,
//           },
//           mode,
//         },
//       }
//     );
//     ref.onClose.subscribe((shouldRefresh: boolean) => {
//       if (shouldRefresh) {
//         this.getTaskManagementEvents(this.filter);
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     this._unsubscribe.destroy();
//   }
// }



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
import { ApiRes } from 'src/app/@core/models/apiRes-model';
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
import { CalendarEventDto } from './interfaces/calendar-events';
import { combineLatest } from 'rxjs';

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
  data: CalendarEventDto[] = [];
  filter: any = {}; // مهم
  isLoading: boolean = true;

  currentUserId?: string;
  usersLookup: any[] = [];
  activityLookup: any[] = [];

  ngOnInit(): void {
    this.bootstrap();
  }

  private bootstrap() {
    combineLatest({
      users: this._apiService.get(API_Config.general.getLawyerMyPermissionCalendar),
      activity: this._apiService.get(API_Config.general.getActivityType),
    })
      .pipe(this._unsubscribe.takeUntilDestroy())
      .subscribe({
        next: (res: any) => {
          this.usersLookup = res.users?.result || [];
          this.activityLookup = res.activity?.result || [];

          this.currentUserId =
            this.usersLookup.find((u: any) => u.isLogginUser === 'True')?.id;
          this.filter = {
            user: this.currentUserId ? [this.currentUserId] : [],
            activity: [], 
          };

          this.getTaskManagementEvents(this.filter);
        },
      });
  }

  private toIds(arr: any, fallback: any[] = []) {
    if (!Array.isArray(arr) || arr.length === 0) return fallback;

    const ids = arr
      .map((x: any) => x?.value ?? x?.id ?? x)
      .filter((x: any) => x !== null && x !== undefined && x !== ''); 

    return ids.length ? ids : fallback;
  }

getTaskManagementEvents(body?: any) {
  this.calendarOptions = undefined;

  let userIds: any[] = [];
  if (body === undefined) {
    userIds = this.currentUserId ? [this.currentUserId] : [];
  }
  else if ('user' in body) {
    userIds = this.toIds(body.user, []);
  }

  const activityTypeIds =
    body && 'activity' in body
      ? this.toIds(body.activity, [0])
      : [0];

  const payload = { userIds, activityTypeIds };
  console.log('payload', payload);

  this._apiService
    .post(API_Config.taskManagementCalender.get, payload)
    .pipe(this._unsubscribe.takeUntilDestroy())
    .subscribe({
      next: (res: ApiRes) => {
        this.data = res.result || [];

        this.events = (res.result || []).map((obj: any) => ({
          id: obj?.id,
          title: obj?.law_ActivityType,
          start: obj?.startDate,
          extendedProps: {
            userId: obj?.lawyerId ?? obj?.usrSign,
            law_ActivityTypeId: obj?.law_ActivityTypeId,
            time: obj?.startDate
              ? new Date(obj.startDate).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '',
          },
        }));

        this.initCalender();
      },
    });
}
onFilter(e: any) {
  if (!e || Object.keys(e).length === 0) {
    this.filter = {
      user: [],      
      activity: [],
    };
  } else {
    this.filter = e;
  }

  this.getTaskManagementEvents(this.filter);
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
      initialEvents: this.events,

      eventDidMount: (info) => {
  const userId = info?.event?.extendedProps['userId'];

  const selectedUserIds = this.toIds(
    this.filter?.user,
    this.currentUserId ? [this.currentUserId] : []
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


      locale: this._languageService.getSelectedLanguage(),
      weekends: true,
      editable: false,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      eventClick: (arg) => this.handleEventClick(arg),
eventContent: (arg) => this.renderEventContent(arg),

    };
  }

  handleEventClick(arg: EventClickArg) {
    const rowData: CalendarEventDto = this.data.find(
      (item: CalendarEventDto) => item.id === +arg.event.id
    ) as CalendarEventDto;
    this.openActivityEditor(rowData, 'view');
  }
   openActivityEditor(rowData?: CalendarEventDto, mode?: string) {
    const ref = this._dialogService.open(
      TaskManagementActivityEditorComponent,
      {
        header: this._languageService.getTransValue(
          rowData ? 'matters.viewActivity' : 'matters.addActivity'
        ),
        width: '40vw',
        data: {
          rowData: {
            ...rowData,
            law_ActivityStatusId: 4,
          },
          mode,
        },
      }
    );
    ref.onClose.subscribe((shouldRefresh: boolean) => {
      if (shouldRefresh) {
        this.getTaskManagementEvents(this.filter);
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
            <!-- 
      <span 
        class="text-xs font-bold ml-1" 
        title="${title}"
        style="cursor: pointer;">
        ${truncatedTitle}
      </span>
      -->
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

