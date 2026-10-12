export function objectToFormData(obj: any, formData: FormData = new FormData(), parentKey: string | null = null): FormData {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const formKey = parentKey ? `${parentKey}[${key}]` : key;
  
        if (value instanceof File || value instanceof Blob) {
          // Append files or blobs directly
          formData.append(formKey, value);
        } else if (value && typeof value === 'object' && !(value instanceof Date)) {
          // Recursively process nested objects
          objectToFormData(value, formData, formKey);
        } else if (value !== null && value !== undefined) {
          // Append scalar values
          formData.append(formKey, value.toString());
        }
      }
    }
  
    return formData;
  }
  