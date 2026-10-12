export  function findField(formlyFields: any, fieldKey: string) {

    for (let field of formlyFields) {
      if (field.key === fieldKey) {
        return field; // Found the object with the matching key
      }

      if (field.fieldGroup && field.fieldGroup.length > 0) {
        const foundObject: any = findField(field.fieldGroup, fieldKey);
        if (foundObject) {
          return foundObject; // Found the object within the nested array
        }
      }

      if (field.fieldArray && field.fieldArray.fieldGroup && field.fieldArray.fieldGroup.length > 0) {
        const foundObject: any = findField(field.fieldArray.fieldGroup, fieldKey);
        if (foundObject) {
          return foundObject; // Found the object within the nested array
        }
      }
    }

    return null; // Object with the specified fieldKey not found
  }