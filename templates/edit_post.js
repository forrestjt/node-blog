module.exports = (post = {}) => `
<!doctype HTML>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title> ${post.title || 'New Post'} </title>
  <link href="/css/styles.css" rel="stylesheet">
  <link href="/css/summernote-bs4.css" rel="stylesheet">
  <link rel="icon" href="favicon.ico" type="image/x-icon" />
</head>
<body>
  <main class="container" style="max-width: 800px">
    <h1>${post.title ? `Edit ${post.title}` : 'New Post'}</h1>
    <form method="post">
      <div class="form-group">
        <label for="title">Title</label>
        <input type="text" class="form-control" name="title" id="title"
               value="${post.title || ''}">
      </div>
      <div class="form-group">
        <label for="content">Content</label>
        <textarea class="form-control summernote" name="content" id="content"
                  rows="8">${post.content || ''}</textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </main>
  <footer class="container">
     &copy; 2018 Forrest Tait. All rights reserved.
  </footer>
  <script src="/js/jquery-3.3.1.min.js"></script>
  <script src="/js/popper.min.js"></script>
  <script src="/js/bootstrap.min.js"></script>
  <script src="/js/summernote-bs4.min.js"></script>
  <script>
    $(document).ready(function() {
      $('.summernote').summernote();
    });
  </script>
</body>
</html>
`;
