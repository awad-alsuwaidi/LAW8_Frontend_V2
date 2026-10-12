import {
  Component,
  EventEmitter,
  Inject,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { TabMenuModule } from 'primeng/tabmenu';
import { SharedModule } from 'src/app/@shared/shared.module';
import { TableModule } from 'primeng/table';
import { FormlyConfigModule } from 'src/app/@shared/modules/formly-config/formly-config.module';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { DialogService } from 'primeng/dynamicdialog';

//import { DialogService } from 'primeng/dynamicdialog';
//import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [
    SharedModule,
    //SharedButtonComponent,
    TabMenuModule,
    TableModule,
    FormlyConfigModule,
  ],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent implements OnInit {
  @Output() onFilter = new EventEmitter(); // Event Emitter

  // Starndrad Formly Setup
  formly: FormGroup = new FormGroup({}); // Type of form
  formlyModel: any; // Data
  formlyFields: FormlyFieldConfig[] = []; // Form Field - Data  Detailes

  _dialogService = inject(DialogService); // Make a dialog

  staticNotiData = [
    {
      id: 1,
      type: 'Task',
      activity: 'Ahmed ali created a new task #t0001',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T00:09:00Z',
      isRead: false,
    },
    {
      id: 2,
      type: 'Client',
      activity:
        'New Client added and this is extra text example if will be more than one line.',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T00:37:00Z',
      isRead: true,
    },
    {
      id: 3,
      type: 'Matter',
      activity: 'Ahmed ali created a new matter #m0452',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-11T22:15:00Z',
      isRead: false,
    },
    {
      id: 4,
      type: 'Meeting',
      activity: 'Scheduled a client meeting for tomorrow at 10 AM',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T08:00:00Z',
      isRead: true,
    },
    {
      id: 5,
      type: 'Task',
      activity: 'Ahmed ali completed task #t0000',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-10T14:45:00Z',
      isRead: true,
    },
    {
      id: 6,
      type: 'Hearing session',
      activity: 'Hearing session scheduled for matter #m0452',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-15T09:30:00Z',
      isRead: false,
    },
    {
      id: 7,
      type: 'Call',
      activity: 'New task #t0002 assigned to you',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T11:20:00Z',
      isRead: false,
    },
    {
      id: 8,
      type: 'Client',
      activity: 'Client profile updated for Acme Corp.',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T12:05:00Z',
      isRead: true,
    },
    {
      id: 9,
      type: 'Task',
      activity: 'Ahmed ali created a new task #t0001',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T00:09:00Z',
      isRead: false,
    },
    {
      id: 10,
      type: 'Client',
      activity:
        'New Client added and this is extra text example if will be more than one line.',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T00:37:00Z',
      isRead: true,
    },
    {
      id: 11,
      type: 'Matter',
      activity: 'Ahmed ali created a new matter #m0452',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-11T22:15:00Z',
      isRead: false,
    },
    {
      id: 12,
      type: 'Meeting',
      activity: 'Scheduled a client meeting for tomorrow at 10 AM',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T08:00:00Z',
      isRead: true,
    },
    {
      id: 13,
      type: 'Task',
      activity: 'Ahmed ali completed task #t0000',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-10T14:45:00Z',
      isRead: true,
    },
    {
      id: 14,
      type: 'Hearing session',
      activity: 'Hearing session scheduled for matter #m0452',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-15T09:30:00Z',
      isRead: false,
    },
    {
      id: 15,
      type: 'Call',
      activity: 'New task #t0002 assigned to you',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T11:20:00Z',
      isRead: false,
    },
    {
      id: 16,
      type: 'Client',
      activity: 'Client profile updated for Acme Corp.',
      by: 'Ahmed ali Moh.',
      dateTime: '2025-02-12T12:05:00Z',
      isRead: true,
    },
  ];

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formlyFields = [
      {
        fieldGroupClassName: 'flex justify-between',
        fieldGroup: [
          {
            type: 'input',
            key: 'search',
            props: {
              placeholder: 'Search',
              icon: 'icon-search text-grey400',
              // ← this is the SAME name as the native input event
              input: () => {
                (this.formlyModel = { ...this.formly.value }), // sprid operator ,  Key = Search , Value = Curent value
                  this.onFilter.emit(this.formlyFields);
              },
            },
          },
          {
            type: 'button',
            props: {
              label: 'Filter',
              icon: 'icon-sort !text-xl !leading-4 mt-1',
              class:
                '!p-2 border border-grey200 !text-textSecondary !text-sm !font-medium flex',

              // onClick: () => {
              //   const ref = this._dialogService.open(MatterAdditionalFilterEditorComponent, {
              //     header: 'Filter',
              //     width: '45vw',
              //     data: { formlyModel: this.formlyModel }
              //   })
              // ref.onClose.subscribe({
              //   next: (res) => {
              //     if (res) {
              //       this.formlyModel = { ...this.formly.value, ...res }
              //       console.log('this.formlyModel',this.formlyModel)
              //       const keysWithValues = Object.values(res).filter(value => value !== undefined && value!==null)
              //       this.additionalFilterValues = keysWithValues;
              //       this.onFilter.emit(this.formlyModel)
              //     }
              //   }
              // })
              //}
            },
          },
        ],
      },
    ];
  }

  /// To be moved to service

  // API Calls for sorting....

  marksAllAsRead() {
    this.staticNotiData = this.staticNotiData.map((n) => ({
      ...n,
      // isRead=true,
      isRead: true,
    }));
  }

  changeStatus(itemId: any, isRead: boolean) {
    if (isRead) {
      const idx = this.staticNotiData.findIndex((item) => item.id === itemId);
      this.staticNotiData[idx].isRead = false;
    } else {
      console.log(itemId, isRead);
      const idx = this.staticNotiData.findIndex((item) => item.id === itemId);
      this.staticNotiData[idx].isRead = true;
      console.log('After' + itemId, isRead);
    }
  }
  // api to assign notification to read = true

  // makeItasUnRead(itemId :any , isRead:boolean):void
  // {
  // if(!isRead) return

  //   // Call API To Make it False
  //   // Update List

  //   const idx=this.staticNotiData.findIndex(item => item.id === itemId )
  // this.staticNotiData[idx].isRead=false;

  // }
  // makeItasread(itemId:any , isRead:boolean):void {
  // if (isRead) return
  // console.log(itemId , isRead)
  // const idx=this.staticNotiData.findIndex(item => item.id === itemId )
  // this.staticNotiData[idx].isRead=true;
  // console.log('After'+itemId , isRead)

  // // Call API To make it reads
  // // Update Notification List

  // }

  /// Filteration and Search
}
