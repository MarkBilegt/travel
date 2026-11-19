import urllib.request, re, os, sys, json, html
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
UA = {'User-Agent': 'Mozilla/5.0'}

def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    data = urllib.request.urlopen(req, timeout=40).read()
    return data if binary else data.decode('utf-8', 'replace')

urls = []
for sm in ('page-sitemap.xml', 'post-sitemap.xml'):
    urls += re.findall(r'<loc>([^<]+)</loc>', get('https://sainsanaa.net/' + sm))
urls = list(dict.fromkeys(u for u in urls if u != 'https://sainsanaa.net/'))
print(len(urls), 'urls')

def orig_image(src):
    src = html.unescape(src)
    src = re.sub(r'^https?://i\d\.wp\.com/', 'https://', src)
    src = src.split('?')[0]
    src = re.sub(r'-\d+x\d+(\.[a-zA-Z]+)$', r'\1', src)
    return src

class Conv(HTMLParser):
    SKIP_CLASS = ('sharedaddy', 'sd-block', 'jp-relatedposts', 'wp-block-coblocks-posts', 'wp-block-post-comments', 'wp-block-comments', 'comment', 'wp-block-post-author', 'wp-block-post-date', 'wp-block-post-terms', 'wp-block-navigation')
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = 0; self.in_content = False; self.start_depth = None
        self.out = []; self.imgs = []; self.skip_depth = []; self.href = []; self.list = []
    def cls(self, attrs): return dict(attrs).get('class', '') or ''
    def handle_starttag(self, tag, attrs):
        a = dict(attrs); c = self.cls(attrs)
        if tag in ('div', 'section', 'article', 'figure', 'ul', 'ol', 'table'):
            self.depth += 1
        if not self.in_content:
            if tag == 'div' and 'wp-block-post-content' in c:
                self.in_content = True; self.start_depth = self.depth
            return
        if self.skip_depth:
            if tag in ('div', 'section', 'figure', 'ul', 'ol', 'table'): pass
            return
        if tag in ('div', 'section', 'ul', 'ol', 'table', 'figure') and any(k in c for k in self.SKIP_CLASS):
            self.skip_depth.append(self.depth); return
        if tag in ('script', 'style', 'noscript', 'svg', 'form', 'button'):
            self.skip_depth.append(self.depth + 0.5); return
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6'): self.out.append('\n\n' + '#' * min(int(tag[1]) + 1, 4) + ' ')
        elif tag in ('p', 'tr'): self.out.append('\n\n')
        elif tag == 'br': self.out.append('  \n')
        elif tag == 'blockquote': self.out.append('\n\n> ')
        elif tag in ('ul', 'ol'): self.list.append(tag); self.out.append('\n')
        elif tag == 'li': self.out.append('\n' + ('- ' if (self.list and self.list[-1] == 'ul') else '1. '))
        elif tag in ('strong', 'b'): self.out.append('**')
        elif tag in ('em', 'i'): self.out.append('*')
        elif tag == 'a':
            self.href.append(a.get('href', '')); self.out.append('[')
        elif tag == 'img':
            src = a.get('data-orig-file') or a.get('data-large-file') or a.get('src') or ''
            if 'wp-content/uploads' in src:
                o = orig_image(a.get('data-orig-file') or src)
                self.imgs.append(o)
                self.out.append(f"\n\n![{(a.get('alt') or '').strip()}]({o})\n\n")
        elif tag == 'iframe':
            src = a.get('src') or a.get('data-src') or ''
            if src: self.out.append(f"\n\n@[video]({src})\n\n")
        elif tag in ('td', 'th'): self.out.append(' | ')
    def handle_endtag(self, tag):
        if tag in ('div', 'section', 'article', 'figure', 'ul', 'ol', 'table'):
            if self.in_content and self.start_depth is not None and self.depth == self.start_depth and tag == 'div':
                self.in_content = False
            if self.skip_depth and self.skip_depth[-1] == self.depth: self.skip_depth.pop()
            self.depth -= 1
        if not self.in_content or self.skip_depth:
            if self.skip_depth and tag in ('script', 'style', 'noscript', 'svg', 'form', 'button') and self.skip_depth[-1] == self.depth + 0.5: self.skip_depth.pop()
            return
        if tag in ('ul', 'ol') and self.list: self.list.pop(); self.out.append('\n')
        elif tag in ('strong', 'b'): self.out.append('**')
        elif tag in ('em', 'i'): self.out.append('*')
        elif tag == 'a':
            h = self.href.pop() if self.href else ''
            self.out.append(f']({h})' if h and not h.startswith('#') else ']')
        elif tag in ('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote'): self.out.append('\n')
    def handle_data(self, d):
        if self.in_content and not self.skip_depth: self.out.append(d)

def clean(md):
    md = re.sub(r'\[\]\([^)]*\)', '', md)           # empty links
    md = re.sub(r'\*\*\s*\*\*', '', md); md = re.sub(r'(?<!\*)\*\s*\*(?!\*)', '', md)
    md = re.sub(r'[ \t]+\n', '\n', md); md = re.sub(r'\n{3,}', '\n\n', md)
    md = re.sub(r' ', ' ', md)
    return md.strip()

def one(url):
    try:
        raw = get(url)
    except Exception as e:
        return {'url': url, 'error': str(e)}
    t = re.search(r'<h1[^>]*wp-block-post-title[^>]*>(.*?)</h1>', raw, re.S)
    title = html.unescape(re.sub(r'<[^>]+>', '', t.group(1))).strip() if t else html.unescape(re.search(r'<title>(.*?)</title>', raw, re.S).group(1)).split(' - ')[0].strip()
    d = re.search(r'<time datetime="(\d{4}-\d{2}-\d{2})', raw)
    p = Conv(); p.feed(raw)
    md = clean(''.join(p.out))
    path = url.replace('https://sainsanaa.net', '').strip('/')
    cats = re.findall(r'rel="category tag"[^>]*>([^<]+)<', raw)
    kind = 'post' if re.match(r'\d{4}/\d{2}/\d{2}/', path) else 'page'
    return {'url': url, 'path': path, 'kind': kind, 'title': title, 'date': d.group(1) if d else None, 'categories': cats, 'md': md, 'images': list(dict.fromkeys(p.imgs))}

with ThreadPoolExecutor(8) as ex:
    items = list(ex.map(one, urls))
errs = [i for i in items if 'error' in i]
print('errors:', len(errs), [e['url'] for e in errs][:5])
items = [i for i in items if 'error' not in i]
json.dump(items, open(os.path.join(OUT, 'site.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(items), 'items;', sum(1 for i in items if i['kind'] == 'post'), 'posts;', sum(len(i['md']) for i in items), 'chars;', len({im for i in items for im in i['images']}), 'distinct images')
