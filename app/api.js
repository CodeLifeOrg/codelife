const Lessons = [
  {
    id: 1,
    title: "Lesson 1",
    description: "I'm Lesson 1"
  },
  {
    id: 2,
    title: "Lesson 2",
    description: "I'm Lesson 2"
  }
];

const Minilessons = [
  {
    id: 1,
    title: "Minilesson 1",
    description: "I'm MiniLesson 1",
    lid: 1
  },
  {
    id: 2,
    title: "Minilesson 2",
    description: "I'm Minilesson 2",
    lid: 1
  },
  {
    id: 3,
    title: "Minilesson 3",
    description: "I'm Minilesson 3",
    lid: 2
  },
  {
    id: 4,
    title: "Minilesson 4",
    description: "I'm Minilesson 4",
    lid: 2
  }
];

const Slides = [
  {
    id: 1,
    title: "Slide 1",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 1,
    mlid: 1
  },
  {
    id: 2,
    title: "Slide 2",
    type: "quiz",
    content: "I am an example of a quiz slide. Are you a robot?",
    ordering: 2,
    mlid: 1
  },
  {
    id: 3,
    title: "Slide 3",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 3,
    mlid: 1
  },
  {
    id: 4, 
    title: "Slide 4",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 1,
    mlid: 2
  },
  {
    id: 5,
    title: "Slide 5",
    type: "textWithImage",
    content: "I am an example of an image slide",
    img: "for.png",
    ordering: 2,
    mlid: 2
  },
  {
    id: 6, 
    title: "Slide 6",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 3,
    mlid: 2
  },
  {
    id: 7, 
    title: "Slide 7",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 1,
    mlid: 3
  },
  {
    id: 8, 
    title: "Slide 8",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 2,
    mlid: 3
  },
  {
    id: 9, 
    title: "Slide 9",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 3,
    mlid: 3
  },
  {
    id: 10, 
    title: "Slide 10",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 1,
    mlid: 4
  },
  {
    id: 11, 
    title: "Slide 11",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 2,
    mlid: 4
  },
  {
    id: 12, 
    title: "Slide 12",
    type: "text",
    content: "I am an example of a text slide",
    ordering: 3,
    mlid: 4
  }
];
          

export function listLessons() {
  return Lessons;
}

export function listMinilessonsByLessonID(lid) {
  const ml = [];
  for (const m of Minilessons) {
    if (m.lid === lid) {
      ml.push(m);
    }
  }
  return ml;
}

export function listSlidesByMinilessonID(mlid) {
  const sl = [];
  for (const s of Slides) {
    if (s.mlid === mlid) {
      sl.push(s);
    }
  }
  return sl;
}

export function getFirstSlideByMinilessonID(mlid) {
  for (const s of Slides) {
    if (s.mlid === mlid) {
      return s;
    }
  }
  return null;
}

export function getSlideByID(sid) {
  for (const s of Slides) {
    if (s.id === sid) {
      return s;
    }
  }
  return null;
}

export function getNeighborSlides(sid) {
  const obj = {prevSlug: null, nextSlug: null};
  const s = getSlideByID(sid);
  const ml = listSlidesByMinilessonID(+s.mlid);
  const arr = [];
  for (const slide of ml) {
    arr[slide.ordering] = slide;
  }
  for (let i = 1; i <= arr.length; i++) {
    if (arr[i] && arr[i].id === sid) {
      if (i > 1) obj.prevSlug = arr[i - 1].id;
      if (i < arr.length - 1) obj.nextSlug = arr[i + 1].id;
    }
  }
  return obj;
}


