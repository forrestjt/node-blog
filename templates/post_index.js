const { dateTime } = require('../util');
module.exports = (posts) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title> Forrest's Blog </title>
  <link href="/css/styles.css" rel="stylesheet">
  <link rel="icon" href="favicon.ico" type="image/x-icon" />
</head>
<body style="background-image:url('/img/asfalt-dark.png')">

  <header class="container-fluid">
    <div class="row justify-content-center">
      <nav class="nav navbar-dark float-right" style="font-size:22px;">
        <a class="nav-link" href="/">About Me</a>
        <a class="nav-link active" href="/blog">Blog</a>
        <a class="nav-link" href="https://github.com/forrestjt">Projects</a>
      </nav>
    </div>
  </header>

  <main>
  <div class="container">
    ${posts.map(post => `
      <div class="row p-2">
        <div class="col">
          <div class="card">
            <div class="card-body">
              <a href="/blog/${post.slug}" class="d-inline-block"><h1 class="h2">${post.title}</h1></a>
              <small class="pl-2">on ${dateTime(post.createdAt)}</small>
            </div>
          </div>
        </div>
      </div>
      `).join('')}
  </div>
</main>
<footer class="container">
   &copy; 2018 Forrest Tait. All rights reserved.
</footer>
</body>
</html>
`;
