const projects = require('./projects.json');

module.exports = function () {
  const nav = {};

  projects.forEach((project, index) => {
    const prev = index > 0 ? projects[index - 1] : null;
    const next = index < projects.length - 1 ? projects[index + 1] : null;

    nav[project.slug] = {
      prev: prev ? { title: prev.title, url: prev.url } : null,
      next: next ? { title: next.title, url: next.url } : null
    };
  });

  return nav;
};
