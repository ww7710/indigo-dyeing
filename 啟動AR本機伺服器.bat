@echo off
chcp 65001 >nul
echo ========================================================
echo  三峽藍染 400 年：小染 AR 實境導覽 ── 本機伺服器啟動器
echo ========================================================
echo.
echo 正在啟動本機安全 HTTP 伺服器以載入 3D 模型 (IP.vrm)...
echo.

:: 嘗試使用 Python 啟動伺服器
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] 檢測到 Python 環境，正在啟動 http://localhost:8000 ...
    start "" "http://localhost:8000/ar.html"
    python -m http.server 8000
    goto end
)

:: 若無 Python 嘗試使用 Node.js 啟動伺服器
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] 檢測到 Node.js 環境，正在啟動 http://localhost:8000 ...
    start "" "http://localhost:8000/ar.html"
    node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.png':'image/png','.vrm':'model/gltf-binary','.glb':'model/gltf-binary','.json':'application/json'}; http.createServer((req, res) => { let reqPath = decodeURI(req.url.split('?')[0]); if (reqPath === '/') reqPath = '/ar.html'; const filePath = path.join(process.cwd(), reqPath); fs.readFile(filePath, (err, data) => { if (err) { res.writeHead(404); res.end('Not Found'); return; } const ext = path.extname(filePath).toLowerCase(); res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' }); res.end(data); }); }).listen(8000, () => console.log('AR Server running at http://localhost:8000/ar.html'));"
    goto end
)

echo [提示] 建議直接在 ar.html 畫面中點擊「📁 載入 IP.vrm」或將檔案拖入視窗即可直接體驗！
pause

:end
