import { Pipe, PipeTransform } from '@angular/core';
import { ProductStatus } from '../models/productStatus';

@Pipe({
  name: 'transformStatuses',
})
export class TransformStatusesPipe implements PipeTransform {
  private statusTranslations: { [key: string]: string } = {
    Active: 'Активний',
    Inactive: 'Неактивний',
    'Out of Stock': 'Немає в наявності',
  };

  transform(value: any[], propName: string): ProductStatus[] {
    if (!value) {
      return value;
    }
    return value.map((item) => {
      const statusKey = item[propName] as keyof typeof this.statusTranslations;
      return {
        ...item,
        [propName]: this.statusTranslations[statusKey] || item[propName],
      };
    });
  }
}
