export function getShortcutLabel(): string {
  return navigator.platform.toLowerCase().includes('mac')
    ? 'Option+Shift+V'
    : 'Alt+Shift+V';
}