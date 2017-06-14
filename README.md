# codelife

A React application based on `datawheel-canon` that provides a framework for teaching students how to code over a series of Tracks, Topics, and Lessons.

Right now, the data is formatted in a simple heirarchy.  Tracks have Topics, Topics have Lessons, and Lessons have Slides.  In future versions, this heirarchy will be less strict (e.g., a lesson may belong to more than one Track).

The content of `api.js` is a sample syllabus object, used to serve up content through a fake API.  

There is no CSS or styling - this proof of concept is meant to:

- Establish `datawheel-canon`'s viability as a framework
- Create an MVP of showing slides that one can scroll through
- Teaching Jimmy `React.js`.