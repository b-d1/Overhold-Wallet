import { NgForm } from '@angular/forms';

export function combineErrors(form: NgForm, errorMap: {}): string[] {
    const errors = [];
    const controls = form.controls;
    for (const controlName in form.controls) {
        if (errorMap.hasOwnProperty(controlName)) {
            const controlErrors = controls[controlName].errors;
            for (const errorName in controlErrors) {
                if (errorMap[controlName][errorName]) {
                    errors.push(errorMap[controlName][errorName]);
                }
            }
        }
    }
    return errors.length ? errors : ['Unknown error'];
}
