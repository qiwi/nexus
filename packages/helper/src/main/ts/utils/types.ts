export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
}

export const nullCheckerFactory = <T>(checker: (v: any) => boolean) =>
  (v: T | any): v is T => checker(v)

export const isDefined = (value: unknown): boolean => value !== undefined && value !== null
