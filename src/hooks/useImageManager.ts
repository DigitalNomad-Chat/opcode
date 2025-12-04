/**
 * 生成ClaudeCode图片占位符，避免直接内嵌base64
 * @param imagePath 文件路径或base64数据URL
 * @param isBase64 是否为base64（影响前缀）
 * @returns 占位符字符串，如 {{claudecode:image:/path/to/img.jpg}} 或 {{claudecode:image:base64:data:...}}
 */
export const generatePlaceholder = (imagePath: string, isBase64: boolean = false): string => {
  const prefix = isBase64 ? 'base64:' : '';
  return `{{claudecode:image:${prefix}${imagePath}}}`;
};

/**
 * 检查文件是否为图片文件
 */
const isImageFile = (path: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = path.toLowerCase().split('.').pop();
  return ext ? imageExtensions.includes(`.${ext}`) : path.startsWith('data:image/');
};

/**
 * 从prompt提取占位符图片路径（兼容旧@path/base64）
 * @param prompt 完整prompt文本
 * @returns 图片路径数组
 */
export const extractImagePaths = (prompt: string): string[] => {
  const paths: string[] = [];
  const pathsSet = new Set<string>();

  // 新占位符：{{claudecode:image:(base64:)?path}}
  const placeholderRegex = /\{\{claudecode:image:(base64:)?([^}]+)\}\}/g;
  const placeholderMatches = Array.from(prompt.matchAll(placeholderRegex));
  for (const match of placeholderMatches) {
    const path = match[2];
    paths.push(path);
    pathsSet.add(path);
  }

  // 兼容旧格式：@"path"/@path（完整原逻辑）
  const quotedRegex = /@"([^"]+)"/g;
  const unquotedRegex = /@([^@\n\s]+)/g;

  let textWithoutQuoted = prompt.replace(quotedRegex, '');
  const quotedMatches = Array.from(prompt.matchAll(quotedRegex));
  for (const match of quotedMatches) {
    const path = match[1];
    const fullPath = path.startsWith('data:') ? path : (path.startsWith('/') ? path : path);
    if (isImageFile(fullPath)) pathsSet.add(fullPath);
  }

  const unquotedMatches = Array.from(textWithoutQuoted.matchAll(unquotedRegex));
  for (const match of unquotedMatches) {
    const path = match[1].trim();
    if (path.includes('data:')) continue;
    const fullPath = path.startsWith('/') ? path : path;
    if (isImageFile(fullPath)) pathsSet.add(fullPath);
  }

  return Array.from(pathsSet);
};
