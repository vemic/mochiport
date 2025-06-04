// オブジェクト関連のユーティリティ
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  
  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    
    if (aKeys.length !== bKeys.length) return false;
    
    for (const key of aKeys) {
      if (!bKeys.includes(key)) return false;
      if (!deepEqual((a as any)[key], (b as any)[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) return false;
  
  // 純粋なオブジェクト（{}またはnew Object()で作成）かチェック
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
};

// ネストされたオブジェクトプロパティの取得
export const get = (obj: Record<string, unknown>, path: string, defaultValue?: unknown): unknown => {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = (result as Record<string, unknown>)[key];
  }
  
  return result !== undefined ? result : defaultValue;
};

// ネストされたオブジェクトプロパティの設定
export const set = (obj: Record<string, unknown>, path: string, value: unknown): void => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return;
  
  let current = obj;
  for (const key of keys) {
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  
  current[lastKey] = value;
};

// オブジェクトのマージ
export const merge = <T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T>>
): T => {
  const result = { ...target } as Record<string, unknown>;
  
  for (const source of sources) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];
        
        if (isObject(sourceValue) && isObject(targetValue)) {
          const mergedValue = merge(
            targetValue as Record<string, unknown>, 
            sourceValue as Record<string, unknown>
          );
          result[key] = mergedValue;
        } else {
          result[key] = sourceValue;
        }
      }
    }  }
  
  return result as T;
};
