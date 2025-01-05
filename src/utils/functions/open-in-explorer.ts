export const openInExplorer = (path: string) => {
  window
    .require('child_process')
    .exec(`explorer.exe /select,"${path.replaceAll('/', '\\')}"`);
};
