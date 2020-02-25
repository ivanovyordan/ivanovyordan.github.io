document.querySelectorAll('a').forEach(function(element) {
  if(element.hostname !== window.location.hostname) {
    element.setAttribute('target', '_blank');
  }
});

document.querySelectorAll('.article-post h2, .page-content h2, .article-post h3').
forEach(function(element) {
  let link = document.createElement('a');
  link.href = '#' + element.id;
  link.classList.add('heading-anchor');
  link.textContent = ' #';
  element.appendChild(link);
});
