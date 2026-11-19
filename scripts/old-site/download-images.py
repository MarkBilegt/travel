import json, os, re, urllib.request, urllib.error, sys
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
DEST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'import', 'old-site', 'images')
site = json.load(open(os.path.join(HERE, 'site.json'), encoding='utf-8'))
imgs = sorted({im for i in site for im in i['images']})
os.makedirs(DEST, exist_ok=True)

def local_name(url):
    m = re.search(r'wp-content/uploads/(.+)$', url)
    return m.group(1) if m else None

def fetch(url):
    rel = local_name(url)
    if not rel: return url, None, 'skip'
    path = os.path.join(DEST, rel)
    if os.path.exists(path) and os.path.getsize(path) > 0: return url, rel, 'cached'
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for candidate in (url, ):
        try:
            req = urllib.request.Request(candidate, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=60).read()
            if len(data) < 500: continue
            open(path, 'wb').write(data)
            return url, rel, 'ok'
        except Exception as e:
            last = str(e)
    return url, None, 'fail ' + last

with ThreadPoolExecutor(10) as ex:
    res = list(ex.map(fetch, imgs))
ok = [r for r in res if r[1]]
fail = [r for r in res if not r[1]]
total = sum(os.path.getsize(os.path.join(DEST, r[1])) for r in ok)
print(len(ok), 'downloaded,', len(fail), 'failed,', round(total / 1e6, 1), 'MB')
for r in fail[:8]: print('FAIL', r[0], r[2])
json.dump({r[0]: r[1] for r in ok}, open(os.path.join(HERE, 'images.json'), 'w'), indent=1)
json.dump([r[0] for r in fail], open(os.path.join(HERE, 'images_failed.json'), 'w'), indent=1)
