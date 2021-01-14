const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const accountModel = require("../../models/account.model");
const teacherModel = require("../../models/teacher.model");
const authTeacher = require("../../middlewares/auth-teacher.mdw");
const courseModel = require("../../models/course.model");
const categoryModel = require("../../models/category.model");
const fieldModel = require("../../models/field.model");
const studentCourseModel = require("../../models/student-course.model");
const chapterModel = require("../../models/chapter.model");
const lessonModel = require("../../models/lesson.model");

router.get("/", authTeacher, async function (req, res) {
  const mycourses = await courseModel.allByTeachID(res.locals.teacher.Id);
  res.render("vwTeacherPages/vwCourses/index", {
    layout: "main-teacher",
    title: "Khóa học của tôi",
    mycourses,
  });
});

router.get("/detail/:id", authTeacher, async function (req, res) {
  const id = +req.params.id;
  const c = await courseModel.single(id);
  if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
    res.redirect("/teacherpage/courses");
  }
  const course = await courseModel.singleWithDetails(id);
  course.chapters = await chapterModel.allChapterByCourID(id);
  course.lessons = await lessonModel.allLessonByCourID(id);
  course.comments = await studentCourseModel.allByCourID(id);
  const rows = await studentCourseModel.singlePercentReview(id);
  course.reviews = rows[0];
  res.render("vwTeacherPages/vwCourses/detail", {
    title: course.CourName,
    layout: "main-teacher",
    course,
    empty: course.length === 0,
  });
});

router.get("/create", authTeacher, async function (req, res) {
  req.session.chapter = [];
  const categories = await categoryModel.all();
  for (let cat of categories) {
    cat.fields = await fieldModel.allFieldOfCategory(cat);
  }
  const prices = [
    { price: 0 },
    { price: 199000 },
    { price: 299000 },
    { price: 399000 },
    { price: 499000 },
    { price: 599000 },
  ];

  res.render("vwTeacherPages/vwCourses/add", {
    layout: "main-teacher",
    title: "Tạo khóa học",
    categories,
    prices,
  });
});

router.post("/new-chapter", authTeacher, function (req, res) {
  let chap = req.session.chapter;
  let newchap = null;
  if (chap.length === 0) {
    newchap = {
      chap_stt: 1,
      chap_lesson: 0,
    };
  } else {
    newchap = {
      chap_stt: +chap[chap.length - 1].chap_stt + 1,
      chap_lesson: 0,
    };
  }
  chap.push(newchap);
  req.session.chapter = chap;
  res.render("vwTeacherPages/vwCourses/new-chapter", {
    layout: false,
    chapter_stt: newchap.chap_stt,
  });
});

router.post("/new-lesson", authTeacher, function (req, res) {
  let chapStt = +req.body.stt;
  let chap = req.session.chapter;
  let newLesson = +chap[chapStt - 1].chap_lesson + 1;
  chap[chapStt - 1].chap_lesson = newLesson;
  req.session.chapter = chap;

  res.render("vwTeacherPages/vwCourses/new-lesson", {
    layout: false,
    lesson_stt: newLesson,
    chap_stt: chapStt,
  });
});

router.post("/remove-chapter", authTeacher, function (req, res) {
  const chapSTT = +req.body.stt;
  let chaps = req.session.chapter;
  chaps.splice(chapSTT - 1, 1);
  for (let chap of chaps) {
    if (chap.chap_stt > chapSTT) {
      chap.chap_stt -= 1;
    }
  }
  req.session.chapter = chaps;
  return res.json(true);
});

router.post("/remove-lesson", authTeacher, function (req, res) {
  const chapStt = +req.body.stt;
  let chap = req.session.chapter;
  let rmLesson = +chap[chapStt - 1].chap_lesson - 1;
  chap[chapStt - 1].chap_lesson = rmLesson;
  req.session.chapter = chap;
  return res.json(true);
});

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jimp = require("jimp");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/videos/newcourse";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    if (file.mimetype == "video/mp4")
      cb(null, file.fieldname + path.extname(file.originalname));
    else
      cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/create",
  multer({ storage }).any(),
  async function (req, res, next) {
    if (req.body && req.files) {
      const size = "350x200-";
      const smFileName =
        "./public/images/courses/" + size + req.files[0].filename;
      jimp
        .read(req.files[0].path)
        .then((result) => {
          return result.resize(350, 200).write(smFileName);
        })
        .catch((err) => {
          console.log("Error in resizing!!!!!");
        });

      const oldPath = "./public/videos/newcourse/" + req.files[0].filename;
      const newPath = "./public/images/courses/" + req.files[0].filename;
      fs.rename(oldPath, newPath, function (err) {
        if (err) {
          console.error("Error in Renaming!", err);
        } else {
          console.log("Rename successful!");
        }
      });

      const new_course = {
        CourName: req.body.cour_name,
        CourImgBg: req.files[0].filename,
        CourImgSm: size + req.files[0].filename,
        CourDesShort: req.body.cour_des,
        CourDesFull: req.body.detail_des,
        CourPrice: +req.body.price,
        FldID: +req.body.field,
        TeachID: +res.locals.teacher.Id,
      };

      const id = await courseModel.add(new_course);
      if (id !== null) {
        const chapter_lessons = JSON.parse(req.body.chap_lessons);
        for (const chapter of chapter_lessons) {
          const new_chap = {
            ChapSTT: +chapter.chap_stt,
            ChapName: chapter.chap_name,
            CourID: id,
          };

          const ChapID = await chapterModel.add(new_chap);
          const lessons = chapter.chap_lessons;

          for (const lesson of lessons) {
            let new_lesson = {
              LessSTT: lesson.less_stt,
              LessName: lesson.less_name,
              LessText: lesson.less_text,
              ChapID,
              CourID: id,
            };

            if (lesson.less_link) {
              const dir = `./public/videos/newcourse/${ChapID}/`;
              fs.mkdirSync(dir, { recursive: true });
              const files = req.files;
              for (const file of files) {
                const fn = `${chapter.chap_stt}_${
                  lesson.less_stt
                }${path.extname(file.filename)}`;

                if (file.filename === fn) {
                  const old_path = file.path;
                  const new_path = dir + file.filename;

                  fs.rename(old_path, new_path, function (err) {
                    if (err) {
                      console.log("Error in removing video:" + file.filename);
                    } else {
                      console.log("Removed " + file.filename);
                      
                    }
                  });
                  new_lesson.LessLink = file.filename;
                }
              }
            }
            await lessonModel.add(new_lesson);
          }
        }
      }
      fs.rename(
        "./public/videos/newcourse/",
        `./public/videos/${id}`,
        function (err) {
          // console.log(err);
        }
      );
    } else {
      console.log("Nothing to save");
    }
    res.redirect("/teacherpage/courses");
  }
);


module.exports = router;
