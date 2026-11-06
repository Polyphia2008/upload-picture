# WsUploadPicture Vue

## Tổng quan
Bản nâng cấp của công cụ **Up ảnh lấy link** từ jQuery/PHP sang Vue 3, giữ nguyên bốn nguồn upload và giao diện đen–đỏ của source gốc.

## Tính năng
- Vue 3, Vue Router, Ant Design Vue, Tailwind CSS 4 và TypeScript.
- Landing page một màn hình theo bố cục tham chiếu, nội dung phù hợp với WsUploadPicture, WebGL globe tương tác và animated background.
- Uploader giữ màu đen–đỏ, ảnh nền/minh họa gốc; dùng font Be Vietnam Pro.
- ImgBB, Sohu, Imgur, Telegra.ph; chọn/kéo-thả nhiều ảnh, tối đa 5 MB mỗi ảnh.
- Toast căn giữa phía trên, animation Anime.js 4.5, auto-close, pause khi hover và progress bar.
- Copy link ảnh/API, giao diện responsive desktop/mobile.
- API `POST /api/upload` và endpoint tương thích `POST /upload.php`.
- Source gốc được lưu trong `legacy/`.

## Routes
- `/` — landing page.
- `/upload` — công cụ upload; `/playground` là alias.
- `/models` — nhà cung cấp.
- `/docs` — API documentation.
- `/terms` — điều khoản.
- `/pricing` — thông tin miễn phí.

## API
`multipart/form-data`: `action=upload-img`, `ft=imgbb|sohu|imgur|telegra`, `file[]=<File>`.
Response giữ cấu trúc `{ status, data, msg }` của bản gốc.

## Chạy local
```bash
npm install
npm run typecheck
npm run build
npm run preview
```
Preview local: `http://localhost:3000`.

## Kiểm thử
```bash
npx playwright install chromium
npm test
npm run capture
```

## Lưu ý
- Không có yêu cầu deploy production; chỉ chạy preview sandbox cổng 3000.
- `IMGUR_CLIENT_ID` được đọc từ secret server nếu có.
- API bên thứ ba có thể từ chối/rate-limit upload; lỗi thật được trả về giao diện, không giả lập link thành công.
- Không lưu ảnh hoặc lịch sử upload trên server.

Cập nhật: 2026-11-06.
