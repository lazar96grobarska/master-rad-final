export function getPropertyOnPath(object: any, path: string): any {
  const segments: string[] = path.split('.');
  let currentValue = object;
  segments.forEach((segment) => {
    if (currentValue) {
      currentValue = currentValue[segment];
    }
  });

  return currentValue;
}