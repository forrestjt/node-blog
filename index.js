const http = require('http');
const fs = require('fs');
const util = require('util');
const path = require('path');
const { URL } = require('url');
const querystring = require('querystring');

const mimeTypes = require('./mime_types.json');
const config = require('./config.json');
const templates = require('./templates');

const readFile = util.promisify(fs.readFile),
      writeFile = util.promisify(fs.writeFile);

function inMemPostRepo(jsonFile) {
  let posts = [];

  if(jsonFile) {
    readFile(jsonFile).then(data => posts = JSON.parse(data));
  }

  function saveToFile() {
    return writeFile(jsonFile, JSON.stringify(posts, 4, 4));
  }

  function createSlug(title, i = 1) {
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9 -]/g, '').trim()
      .replace(/\s/g, '-');
    if(i > 1) {
      slug = `${slug}-${i}`;
    }
    return repo.findPost(slug).then(p => {
      if(!p) {
        return slug;
      } else {
        return createSlug(title, i + 1);
      }
    });
    return slug;
  }

  const repo = {
    createPost(post) {
      return createSlug(post.title).then(slug => {
        post.createdAt = (new Date).toISOString();
        post.slug = slug;
        posts.push(post);
        return saveToFile().then(() => post);
      });
    },
    findPost(slug) {
      return Promise.resolve(posts.find(p => p.slug === slug));
    },
    findAllPosts(attrs) {
      return Promise.resolve(posts.filter(p => Object.keys(attrs || {})
               .every(k => attrs[k] === p[k])));
    },
    updatePost(post) {
      return repo.findPost(post.slug).then(oldPost => {
        if(oldPost) {
          post = Object.assign({}, oldPost, post);
          const i = posts.findIndex(p => p === oldPost);
          posts[i] = post;
          return saveToFile().then(() => post);
        }
      });
    }
  };
  return repo;
}


const getRoutes = (postRepo) => [
  { matcher: /^\/blog\/new\-post$/, requireAuth: true,
    get(req, res) { endWithContent(res, templates.editPost(), '.html') },
    post(req, res) { readBody(req, res)
      .then(data => {
        if(!data.title) {
          endWithContent(res, templates.editPost(data), '.html');
        } else {
          postRepo.createPost({
            title: data.title,
            content: data.content
          }).then(() => redirectTo(res, '/blog'));
        }
      });
    }
  },{ matcher: /\/blog\/([\w|-]+)\/?$/,
      get(req, res, p) {
        const slug = this.matcher.exec(p)[1];
        postRepo.findPost(slug).then(post => {
          if(post) {
            endWithContent(res, templates.viewPost(post), '.html');
          } else {
            redirectTo(res, '/blog');
          }
        })
      }
  },{ matcher: /\/blog\/([\w|-]+)\/edit$/, requireAuth: true,
      get(req, res, p) {
        const slug = this.matcher.exec(p)[1];
        postRepo.findPost(slug).then(post => {
          if(post) {
            endWithContent(res, templates.editPost(post), '.html');
          } else {
            redirectTo(res, '/blog');
          }
        })
      },
      post(req, res, p) {
        const slug = this.matcher.exec(p)[1];
        readBody(req, res).then(post =>
          postRepo.updatePost(Object.assign(post, {slug}))
            .then(() => redirectTo(res, `/blog/${slug}`)));
      }
  },{ matcher: /^\/blog\/?$/,
      get(req, res) {
        postRepo.findAllPosts()
          .then(posts => endWithContent(res, templates.postIndex(posts), '.html'))
      }
  }
];


function redirectTo(res, path, code) {
  res.writeHead(code || 303, {'Location': new URL(path, config.baseUrl)});
  res.end();
}

function endWithContent(res, content, ext) {
  res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
  res.end(content);
}

function serveStatic(req, res, p) {
  return readFile(path.join(path.resolve('./public'), p))
    .then(data => endWithContent(res, data, path.extname(p)));
}

function auth(req, res) {
  return new Promise((res, rej) => {
    if(!req.headers.authorization) { return rej();}
    const [type, creds] = req.headers.authorization.trim().split(' ');
    if(type !== 'Basic') { return rej(); }
    const [name, pass] = (new Buffer(creds, 'base64').toString('utf8')).split(':'),
          user = config.users.find(u => u.username === name);
    if(user && user.password === pass) {
      res(user);
    } else {
      rej();
    }
  });
}

function readBody(req, res) {
  return new Promise((res, rej) => {
    body = '';
    req.on('data', data => {
      if((body.length + data.length) > config.maxUploadSize) {
        res.writeHead(413,{});
        res.end();
        req.connection.destroy();
      }
      body += data;
    });
    req.on('end', () => res(querystring.parse(body)));
  });
}

(function(){
  const postRepo = inMemPostRepo(config.postsFile);
  const routes = getRoutes(postRepo);

  http.createServer((req, res) => {
    const url = new URL(req.url, config.baseUrl),
          method = req.method.toLowerCase(),
          p = path.normalize(config.aliases[url.pathname] || url.pathname),
          route = routes.find(r => r[method] && p.match(r.matcher));
    if(route) {
      if(route.requireAuth) {
        return auth(req, res)
          .then(() => route[method](req, res, p))
          .catch(() => {
            res.writeHead(401, {'WWW-Authenticate': 'Basic realm=Blog'});
            res.end();
          });
      } else {
        route[method](req, res, p);
      }
    } else {
      serveStatic(req, res, p)
        .catch(err => readFile(path.resolve('./public/404.html'))
          .then(data => {res.statusCode = 404; endWithContent(res, data, '.html')})
          .catch(() => res.end()));
    }
  }).listen(config.port);
}());
