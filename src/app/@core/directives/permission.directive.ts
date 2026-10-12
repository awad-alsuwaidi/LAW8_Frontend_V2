import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { PermissionService } from '@core/services/permission.service';

@Directive({
  selector: '[requiredPermission]',
  standalone:true,
})
export class PermissionDirective implements OnInit {
  @Input() requiredPermission!: string|string[];
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private _permissionService: PermissionService
  ) {}
  ngOnInit(): void {
    if (this.requiredPermission) {
      this.updateElement();
    }
  }
  updateElement() {
    let hasPermission = false;
    if (Array.isArray(this.requiredPermission)) {
      hasPermission = this.requiredPermission.some(permission =>
        this._permissionService.hasPermission(permission)
      );
    } else {
      hasPermission = this._permissionService.hasPermission(this.requiredPermission);
    }
    if (!hasPermission) {
      this.renderer.removeChild(
        this.elementRef.nativeElement.parentElement,
        this.elementRef.nativeElement
      );
    }
  }
}
