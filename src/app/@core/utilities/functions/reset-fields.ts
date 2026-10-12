import { FormGroup } from "@angular/forms";

export function resetFields(formly: FormGroup, fields: string[]) {
    fields.forEach(field => formly.get(field)?.setValue(null));
}