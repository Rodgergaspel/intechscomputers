const {app,BrowserWindow,shell}=require('electron');
const path=require('node:path');
function create(){
  const win=new BrowserWindow({width:1280,height:820,minWidth:360,minHeight:500,title:'Intechs Computers',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
  win.webContents.setWindowOpenHandler(({url})=>{if(/^https:\/\//i.test(url))shell.openExternal(url);return {action:'deny'}});
  win.webContents.on('will-navigate',(e,url)=>{if(/^https:\/\//i.test(url)){e.preventDefault();shell.openExternal(url);}});
  win.loadFile(path.join(__dirname,'www','index.html'));
}
app.whenReady().then(()=>{create();app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)create()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});

