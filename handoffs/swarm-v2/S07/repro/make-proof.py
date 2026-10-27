from pathlib import Path
out=Path('apps/studio/s07-proof.pdf')
objects=[b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>',
 b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 7 0 R >> >> /Contents 4 0 R >>',
 b'<< /Length 97 >>\nstream\nBT /F1 22 Tf 70 720 Td (ARDESIA - PDF SINTETICO) Tj 0 -40 Td /F1 14 Tf (Pagina 1: F = k x) Tj ET\nendstream',
 b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 7 0 R >> >> /Contents 6 0 R >>',
 b'<< /Length 98 >>\nstream\nBT /F1 22 Tf 70 720 Td (ARDESIA - PDF SINTETICO) Tj 0 -40 Td /F1 14 Tf (Pagina 2: E = 1/2 k x^2) Tj ET\nendstream',
 b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
# Exact stream lengths, then byte offsets (no corpus or personal data).
for i in (3,5):
    stream=objects[i].split(b'\nstream\n',1)[1].split(b'\nendstream')[0]
    objects[i]=b'<< /Length '+str(len(stream)).encode()+b' >>\nstream\n'+stream+b'\nendstream'
body=bytearray(b'%PDF-1.4\n'); offsets=[0]
for i,obj in enumerate(objects,1):
    offsets.append(len(body)); body.extend(f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n')
xref=len(body); body.extend(b'xref\n0 8\n0000000000 65535 f \n')
for offset in offsets[1:]: body.extend(f'{offset:010d} 00000 n \n'.encode())
body.extend(f'trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode())
out.write_bytes(body)
