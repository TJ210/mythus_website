import os
import re
import sys
import shutil
from http.server import SimpleHTTPRequestHandler, HTTPServer

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
            
        ctype = self.guess_type(path)
        
        # Check for range header
        range_header = self.headers.get('Range')
        if not range_header:
            return super().send_head()
            
        # Parse range header (e.g., bytes=0-100)
        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not match:
            self.send_error(400, "Bad Request")
            return None
            
        start, end = match.groups()
        try:
            start = int(start)
            size = os.path.getsize(path)
            if end:
                end = int(end)
            else:
                end = size - 1
        except ValueError:
            self.send_error(400, "Bad Request")
            return None
            
        if start >= size:
            self.send_error(416, "Requested Range Not Satisfiable")
            return None
            
        self.send_response(206)
        self.send_header('Content-Type', ctype)
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        
        # Open file and seek to start
        try:
            f = open(path, 'rb')
            f.seek(start)
            return f
        except IOError:
            self.send_error(404, "File not found")
            return None

    def copyfile(self, source, outputfile):
        # We need to only copy the content length
        range_header = self.headers.get('Range')
        if not range_header:
            super().copyfile(source, outputfile)
            return
            
        match = re.match(r'bytes=(\d+)-(\d*)', range_header)
        if not match:
            super().copyfile(source, outputfile)
            return
            
        start, end = match.groups()
        try:
            size = os.fstat(source.fileno()).st_size
            start = int(start)
            end = int(end) if end else size - 1
            length = end - start + 1
        except Exception:
            super().copyfile(source, outputfile)
            return
        
        # Copy chunk
        buffer_size = 64 * 1024
        while length > 0:
            chunk = source.read(min(length, buffer_size))
            if not chunk:
                break
            try:
                outputfile.write(chunk)
            except Exception:
                # Client disconnected early
                break
            length -= len(chunk)

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server_address = ('', port)
    httpd = HTTPServer(server_address, RangeRequestHandler)
    print(f"Serving HTTP on port {port} with Range request support...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
