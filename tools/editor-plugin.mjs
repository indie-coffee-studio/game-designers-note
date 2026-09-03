import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { jsxFileToDoc } from './jsx-to-tiptap.mjs';
import { docToJsxFile } from './tiptap-to-jsx.mjs';
import { findNodeById, insertNode, removeNodeById, buildPathMaps } from './nav-utils.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const NAV_DATA_PATH = path.join(ROOT, 'src', 'config', 'nav-data.json');

// 閳光偓閳光偓閳光偓 Helpers 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

async function readNav() {
  return JSON.parse(await fs.readFile(NAV_DATA_PATH, 'utf-8'));
}

async function writeNav(data) {
  await fs.writeFile(NAV_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function respond(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function pageFilePath(navPath) {
  return path.join(PAGES_DIR, navPath + '.jsx');
}

// 閳光偓閳光偓閳光偓 Handlers 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

async function handleGetNav(_, res) {
  const data = await readNav();
  respond(res, data);
}

async function handlePutNav(req, res) {
  const body = await readBody(req);
  await writeNav(body);
  respond(res, { ok: true });
}

async function handleGetPage(req, res) {
  const id = req.editorId;
  
  // Special handling for home page
  if (id === 'home') {
    try {
      const contentPath = path.join(ROOT, 'src', 'config', 'home-content.json');
      const doc = JSON.parse(await fs.readFile(contentPath, 'utf-8'));
      respond(res, { ok: true, doc, path: 'home', label: 'Home' });
    } catch {
      respond(res, { error: 'home content not found' }, 404);
    }
    return;
  }

  const navData = await readNav();
  const node = findNodeById(navData, id);
  if (!node?.path) return respond(res, { error: 'page not found' }, 404);

  const filePath = pageFilePath(node.path);
  try {
    const source = await fs.readFile(filePath, 'utf-8');
    const doc = jsxFileToDoc(source);
    respond(res, { ok: true, doc, path: node.path, label: node.label });
  } catch {
    respond(res, { error: 'file not found' }, 404);
  }
}

async function handlePutPage(req, res, server) {
  const id = req.editorId;
  const body = await readBody(req);

  // Special handling for home page
  if (id === 'home') {
    const contentPath = path.join(ROOT, 'src', 'config', 'home-content.json');
    await fs.writeFile(contentPath, JSON.stringify(body.doc, null, 2), 'utf-8');
    respond(res, { ok: true });
    return;
  }

  const navData = await readNav();
  const node = findNodeById(navData, id);
  if (!node?.path) return respond(res, { error: 'page not found' }, 404);

  const filePath = pageFilePath(node.path);
  let existingSource = null;
  try { existingSource = await fs.readFile(filePath, 'utf-8'); } catch { /* new file */ }

  const jsx = docToJsxFile(body.doc, node.label, existingSource);
  await fs.writeFile(filePath, jsx, 'utf-8');

  // Trigger Vite HMR for the changed file
  server.watcher.emit('change', filePath);
  respond(res, { ok: true });
}

async function handleCreatePage(req, res) {
  const { id, label, path: pagePath, parentId, icon } = await readBody(req);
  if (!id || !label || !pagePath) return respond(res, { error: 'id, label, path required' }, 400);

  const navData = await readNav();
  if (findNodeById(navData, id)) return respond(res, { error: 'id already exists' }, 409);

  // Create JSX file
  const filePath = pageFilePath(pagePath);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, emptyPageJsx(label), 'utf-8');

  // Insert into nav
  const newNode = { id, label, path: pagePath, ...(icon ? { icon } : {}) };
  insertNode(navData, parentId ?? null, newNode);
  await writeNav(navData);

  respond(res, { ok: true });
}

async function collectJsxFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectJsxFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.jsx')) files.push(full);
  }
  return files;
}

function hasDescendant(node, id) {
  return !!node.children?.some((child) => child.id === id || hasDescendant(child, id));
}

function updatePageReferences(source, oldId, newId) {
  const escaped = oldId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return source
    .replace(new RegExp(`(<InternalLink\\b[^>]*\\bid=")${escaped}(")`, 'g'), `$1${newId}$2`)
    .replace(new RegExp(`(<CrossLink\\b[^>]*\\bpageId=")${escaped}(")`, 'g'), `$1${newId}$2`);
}

async function movePageFiles(oldPath, newPath) {
  const oldFile = pageFilePath(oldPath);
  const newFile = pageFilePath(newPath);
  await fs.mkdir(path.dirname(newFile), { recursive: true });
  try { await fs.rename(oldFile, newFile); } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  const oldDir = path.join(PAGES_DIR, oldPath);
  const newDir = path.join(PAGES_DIR, newPath);
  try {
    await fs.mkdir(path.dirname(newDir), { recursive: true });
    await fs.rename(oldDir, newDir);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

async function handlePatchPage(req, res, server) {
  const oldId = req.editorId;
  const { id: newId, label, parentId, icon } = await readBody(req);
  if (!newId || !label?.trim()) return respond(res, { error: 'id and label required' }, 400);
  if (newId === 'home') return respond(res, { error: 'home cannot be renamed' }, 400);

  const navData = await readNav();
  const node = findNodeById(navData, oldId);
  if (!node?.path) return respond(res, { error: 'page not found' }, 404);
  if (newId !== oldId && findNodeById(navData, newId)) return respond(res, { error: 'id already exists' }, 409);
  if (parentId === oldId || hasDescendant(node, parentId)) return respond(res, { error: 'cannot move a page inside itself' }, 400);

  const parent = parentId ? findNodeById(navData, parentId) : null;
  if (parentId && !parent) return respond(res, { error: 'parent not found' }, 400);

  const oldPath = node.path;
  const newPath = parent ? `${parent.path}/${newId}` : newId;
  if (oldPath !== newPath) await movePageFiles(oldPath, newPath);

  const replacement = { ...node, id: newId, label: label.trim(), path: newPath };
  if (icon?.trim()) replacement.icon = icon.trim();
  else delete replacement.icon;
  removeNodeById(navData, oldId);
  insertNode(navData, parentId || null, replacement);
  await writeNav(navData);

  if (newId !== oldId) {
    const files = await collectJsxFiles(PAGES_DIR);
    await Promise.all(files.map(async (file) => {
      const source = await fs.readFile(file, 'utf-8');
      const updated = updatePageReferences(source, oldId, newId);
      if (updated !== source) await fs.writeFile(file, updated, 'utf-8');
    }));
  }

  server.watcher.emit('change', pageFilePath(newPath));
  respond(res, { ok: true, id: newId });
}
async function handleDeletePage(req, res) {
  const id = req.editorId;
  const navData = await readNav();
  const node = findNodeById(navData, id);
  if (!node) return respond(res, { error: 'page not found' }, 404);

  // Only delete leaf pages (no children) to be safe
  if (node.children?.length) return respond(res, { error: 'cannot delete page with children' }, 400);

  if (node.path) {
    try { await fs.unlink(pageFilePath(node.path)); } catch { /* file may not exist */ }
  }
  removeNodeById(navData, id);
  await writeNav(navData);
  respond(res, { ok: true });
}

async function handleListImages(_, res) {
  const imagesDir = path.join(ROOT, 'public', 'images');
  try {
    const files = await fs.readdir(imagesDir);
    const images = files.filter((f) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)).map((f) => `/images/${f}`);
    respond(res, images);
  } catch {
    respond(res, []);
  }
}

function safeImageName(name) {
  const extension = path.extname(name).toLowerCase();
  const stem = path.basename(name, extension)
    .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';
  return `${stem}${extension}`;
}

function readMultipartFile(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const boundary = (req.headers['content-type'] || '').match(/boundary=([^;]+)/)?.[1];
      if (!boundary) return reject(new Error('multipart boundary missing'));
      const marker = Buffer.from(`--${boundary}`);
      const headerEnd = body.indexOf(Buffer.from('\r\n\r\n'));
      const disposition = body.subarray(0, headerEnd).toString('utf8');
      const originalName = disposition.match(/filename="([^"]+)"/)?.[1];
      if (!originalName || headerEnd < 0) return reject(new Error('image file missing'));
      const dataStart = headerEnd + 4;
      const dataEnd = body.indexOf(marker, dataStart) - 2;
      resolve({ originalName, data: body.subarray(dataStart, dataEnd) });
    });
    req.on('error', reject);
  });
}

async function handleUploadImage(req, res) {
  const { originalName, data } = await readMultipartFile(req);
  const extension = path.extname(originalName).toLowerCase();
  if (!/^\.(jpg|jpeg|png|gif|svg|webp|avif)$/i.test(extension)) {
    return respond(res, { error: 'unsupported image type' }, 400);
  }
  const imagesDir = path.join(ROOT, 'public', 'images');
  await fs.mkdir(imagesDir, { recursive: true });
  const fileName = safeImageName(originalName);
  await fs.writeFile(path.join(imagesDir, fileName), data);
  respond(res, { ok: true, name: fileName, src: `/images/${fileName}` });
}

async function handleRenameImage(req, res) {
  const { oldName, newName } = await readBody(req);
  const oldFileName = path.basename(oldName || '');
  const newFileName = safeImageName(newName || '');
  if (!oldFileName || !/^\.(jpg|jpeg|png|gif|svg|webp|avif)$/i.test(path.extname(newFileName))) {
    return respond(res, { error: 'valid image names required' }, 400);
  }
  const imagesDir = path.join(ROOT, 'public', 'images');
  await fs.rename(path.join(imagesDir, oldFileName), path.join(imagesDir, newFileName));
  respond(res, { ok: true, name: newFileName, src: `/images/${newFileName}` });
}

// 閳光偓閳光偓閳光偓 Template 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

function emptyPageJsx(label) {
  const escapedLabel = label.replace(/'/g, "\\'");
  return `import { Breadcrumb, H1, P } from '@/components/ui.jsx';

export default function Page({ go }) {
  return (
    <div>
      <Breadcrumb auto go={go} />
      <H1>${escapedLabel}</H1>
      <P></P>
    </div>
  );
}
`;
}

// 閳光偓閳光偓閳光偓 Plugin export 閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓閳光偓

export function editorPlugin() {
  return {
    name: 'editor-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/editor', (req, res, next) => {
        // Parse URL: /api/editor/<resource>[/<id>]
        const urlPath = req.url.split('?')[0].replace(/^\//, '');
        const [resource, ...rest] = urlPath.split('/');
        const id = rest.join('/') || null;

        req.editorId = id;

        const key = `${req.method} ${resource}`;
        const handlers = {
          'GET nav':    handleGetNav,
          'PUT nav':    handlePutNav,
          'GET page':   handleGetPage,
          'PUT page':   handlePutPage,
          'PATCH page': handlePatchPage,
          'POST page':  handleCreatePage,
          'DELETE page': handleDeletePage,
          'GET images': handleListImages,
          'POST images': handleUploadImage,
          'PATCH images': handleRenameImage,
        };

        const handler = handlers[key];
        if (!handler) { next(); return; }

        handler(req, res, server).catch((err) => {
          console.error('[editor-api]', err);
          respond(res, { error: String(err) }, 500);
        });
      });
    },
  };
}
