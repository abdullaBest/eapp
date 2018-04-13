const {app, BrowserWindow, Tray, ipcMain, Menu, MenuItem } = require('electron');
const path       = require('path');
const url        = require('url');
const AutoLaunch = require('auto-launch');
  

let win,popwin,screen;

let app_status = 0; // 0 - основное овно активно, 1- основное окно спрятано

// настраиваем автозапуск приложения
function prepare_autolaunch(){
    let regidiumAutoLuncher = new AutoLaunch({
        name: 'Regidium'
    });

    let autoRunMenuItem = new MenuItem({label:'Запускать автоматически', type:'checkbox', checked:false});
    autoRunMenuItem.click = function(){
        if(autoRunMenuItem.checked) {
            //авторан включен, отключаем
            regidiumAutoLuncher.disable().then(function(){
                autoRunMenuItem.checked = false;
            });
        } else {
            //авторан выключен, включаем
            regidiumAutoLuncher.enable().then(function(){
                autoRunMenuItem.checked = true;
            });
        }
    }
    //
    regidiumAutoLuncher.isEnabled().then(function(isEnabled){
        autoRunMenuItem.checked = isEnabled;
    });
}

// подготавливаем работу приложения в фоне, в трай
function prepare_tray(){
    let tray = new Tray(path.join(__dirname, 'logo.png'));
    tray.setToolTip('Regidium');
    tray.on('click', function(){
        if (win.isMinimized()) win.restore();
        win.focus();
    });
    
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Открыть', click() {
            win.show();
            if (win.isMinimized()) { win.restore(); }
            win.focus();
            app_status = 0;
        }},
        {label: 'Выйти', click() {
            let a = popwin;
            let b = win; 
            win    = null;
            popwin = null;  
            a.close();
            b.close();
            app.quit();
        }}
    ]);

    //в линуксе нету правого клика для приложухи
    if(process.platform==='linux') {
        tray.setContextMenu(contextMenu);
    } else {
        tray.on('click', function(){
            win.show();
            if (win.isMinimized()) win.restore();
            win.focus();
            app_status = 0;
        });

        tray.on('right-click', function(){
            tray.popUpContextMenu(contextMenu);
        });
    }        
}

  
function createWindow () {
    screen = require('electron').screen;
    // Создаёт окно браузера.
    win = new BrowserWindow({
        width   : 1200, 
        height  : 800,
        show    : false,
        icon    : path.join(__dirname, 'logo.png'),
        webPreferences : {webSecurity: false},
        skipTaskbar    : false,
    })
  
    // и загрузит index.html приложение.
    win.loadURL(url.format({
        pathname : path.join(__dirname, 'index.html'),
        protocol : 'file:',
        slashes  : true
    }))
    //
    win.addListener('close', function(e){
        if (win!==null){
            e.preventDefault();
            win.hide();
            app_status = 1;
            //win.minimize();
            return false;
        }
    });
    // покажет окно когда страница будет полностью загружена
    win.once('ready-to-show', () => { win.show() });
  
    // Откроет DevTools.
    //win.webContents.openDevTools()
  
    // Возникает, когда окно будет закрыто.
    win.on('closed', () => {
      // Разбирает объект окна, обычно вы можете хранить окна     
      // в массиве, если ваше приложение поддерживает несколько окон в это время,
      // тогда вы должны удалить соответствующий элемент.
      //win = null
    })
    


    // Создаёт окно браузера.
    popwin = new BrowserWindow({
        width  : 1220, 
        height : 600,
        frame  : false,
        show   : false,
        icon   : path.join(__dirname, 'logo.png'),
        webPreferences : {webSecurity: false},
        skipTaskbar    : true,
    })
  
    // и загрузит index.html приложение.
    popwin.loadURL(url.format({
        pathname: path.join(__dirname, 'popup.html'),
        protocol: 'file:',
        slashes: true
    }))
    //

  
    // Откроет DevTools.
    //popwin.webContents.openDevTools()
  
    // Возникает, когда окно будет закрыто.
    popwin.on('closed', () => {
      //popwin = null
    })
    // окно потеряло фокус
    popwin.on('blur', () => {
        popwin.hide();
    })
    //
    prepare_tray();
}
  
  // Этот метод будет вызываться, когда Electron закончит 
  // инициализацию и готова к созданию окон браузера.
  // Некоторые интерфейсы API могут использоваться только после возникновения этого события.
  app.on('ready', createWindow)
  prepare_autolaunch();
  
  // Выйти, когда все окна будут закрыты.
  app.on('window-all-closed', () => {
    // На macOS это обычно для приложений и их строки меню   
    // оставаться активным до тех пор, пока пользователь не выйдет явно с помощью Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
     // На MacOS это общее для того чтобы создать окно в приложении, когда значок 
     // dock нажали и нет других открытых окон.
    if (win === null) {
      createWindow()
    }
  })
  
  //
  ipcMain.on('message', function (e, data) {
    if (app_status===1){
        let m = screen.getPrimaryDisplay();
        let sx = m.workArea.x;
        let sy = m.workArea.y;
        let w  = m.workArea.width;
        let h  = m.workArea.height;
        let x = sx + w - 300;
        let y = sy + h - 500;
        popwin.setSize(300,500);
        popwin.setPosition(x,y);
        popwin.setAlwaysOnTop(true); 
        popwin.setVisibleOnAllWorkspaces(true); // put the window on all screens
        popwin.restore();
        popwin.show();
        // once show then it leaves from top when click outside
        setTimeout(function(){
            popwin.setAlwaysOnTop(false);
        },1000)
        popwin.webContents.send('message',data);
        //popwin.focus();
    }
  })  //
  ipcMain.on('chat', function (e, data) {
    win.webContents.send('chat',data);
  })  //
  ipcMain.on('close', function (e, data) {
     popwin.hide();
  })  //
  ipcMain.on('open', function (e, data) {
    popwin.hide();
    win.show();
    if (win.isMinimized()) win.restore();
    win.focus();
    app_status = 0;
  })