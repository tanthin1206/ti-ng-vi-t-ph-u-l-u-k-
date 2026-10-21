import os
import sys
import json
import base64
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class AudioSyncHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            rieng_dir = os.path.join(BASE_DIR, "assets", "audio", "rieng")
            count = 0
            if os.path.exists(rieng_dir):
                for root, _, files in os.walk(rieng_dir):
                    count += len([f for f in files if f.endswith((".mp3", ".wav", ".webm", ".m4a"))])
            resp = json.dumps({"ok": True, "dir": BASE_DIR, "count": count})
            self.wfile.write(resp.encode("utf-8"))
            return

        super().do_GET()

    def do_POST(self):
        if self.path == "/api/save-audio":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length)
                payload = json.loads(body.decode("utf-8"))

                audio_id = payload.get("id", "").strip().replace("\\", "/")
                data_b64 = payload.get("data", "")

                if not audio_id or not data_b64:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error": "Thieu id hoac data"}')
                    return

                if "," in data_b64:
                    data_b64 = data_b64.split(",", 1)[1]
                audio_bytes = base64.b64decode(data_b64)

                # Bỏ đuôi file nếu id đã kèm đuôi
                for ext in [".mp3", ".wav", ".webm", ".m4a", ".ogg"]:
                    if audio_id.lower().endswith(ext):
                        audio_id = audio_id[:-len(ext)]
                        break

                target_file = os.path.join(BASE_DIR, "assets", "audio", "rieng", f"{audio_id}.mp3")
                os.makedirs(os.path.dirname(target_file), exist_ok=True)

                with open(target_file, "wb") as f:
                    f.write(audio_bytes)

                rel_path = os.path.relpath(target_file, BASE_DIR).replace("\\", "/")
                print(f"[AudioSync] Da luu clone: {rel_path} ({len(audio_bytes)} bytes)")

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                resp = json.dumps({"ok": True, "path": rel_path, "bytes": len(audio_bytes)})
                self.wfile.write(resp.encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                resp = json.dumps({"error": str(e)})
                self.wfile.write(resp.encode("utf-8"))
            return

        if self.path == "/api/delete-audio":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length)
                payload = json.loads(body.decode("utf-8"))
                audio_id = payload.get("id", "").strip().replace("\\", "/")
                for ext in [".mp3", ".wav", ".webm", ".m4a"]:
                    if audio_id.lower().endswith(ext):
                        audio_id = audio_id[:-len(ext)]
                        break
                target_file = os.path.join(BASE_DIR, "assets", "audio", "rieng", f"{audio_id}.mp3")
                if os.path.exists(target_file):
                    os.remove(target_file)
                    print(f"[AudioSync] Da xoa: {audio_id}.mp3")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"ok": true}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if self.path == "/api/save-qbank":
            try:
                length = int(self.headers.get("Content-Length", 0))
                cfg = json.loads(self.rfile.read(length).decode("utf-8"))
                target = os.path.join(BASE_DIR, "js", "data", "cau-hoi-rieng.js")
                with open(target, "w", encoding="utf-8") as f:
                    f.write("/* Bộ câu hỏi tự soạn (thêm / xóa) – tạo tự động từ trình soạn câu hỏi. */\n")
                    f.write("window.CAU_HOI_RIENG = ")
                    json.dump(cfg, f, ensure_ascii=False)
                    f.write(";\n")
                print("[QBank] Da luu js/data/cau-hoi-rieng.js")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(b'{"ok": true}')
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        if self.path == "/api/open-folder":
            folder = os.path.join(BASE_DIR, "assets", "audio", "rieng")
            os.makedirs(folder, exist_ok=True)
            if sys.platform == "win32":
                os.startfile(folder)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(b'{"ok": true}')
            return

        super().do_POST()

def main():
    port = PORT
    server = None
    for attempt in range(5):
        try:
            ThreadingHTTPServer.request_queue_size = 64
            ThreadingHTTPServer.daemon_threads = True
            server = ThreadingHTTPServer(("127.0.0.1", port), AudioSyncHandler)
            break
        except OSError:
            port += 1
    if not server:
        print("[Loi] Khong mo duoc port 8080..8084")
        return
    print(f"=====================================================")
    print(f"  TIẾNG VIỆT PHIÊU LƯU KÝ - MÁY CHỦ TỰ LƯU ÂM THANH VÀO CODE")
    print(f"  Đang chạy tại: http://localhost:{port}")
    print(f"  Âm thanh thu/tải lên sẽ tự lưu clone vào: assets/audio/rieng/")
    print(f"=====================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDa dung may chu.")

if __name__ == "__main__":
    main()
