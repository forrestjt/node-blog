const { dateOnly } = require('../util');
module.exports = (post) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title> ${post.title} </title>
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
    <div class="row p-2">
      <div class="col">
        <div class="card">
          <h1 class="card-title text-center pt-4">${post.title}</h1>
          <small class="text-center pb-4">${dateOnly(post.createdAt)}</small>
          <div class="card-body p-4">
            ${post.content}
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
<footer class="container">
   &copy; 2018 Forrest Tait. All rights reserved.
</footer>
</body>
</html>
`;
