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
  try {
    const id = +req.params.id;
    const c = await courseModel.single(id);
    if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
      return res.redirect("/teacherpage/courses");
    } else {
      const course = await courseModel.singleWithDetails(id);
      course.chapters = await chapterModel.allChapterByCourID(id);
      course.lessons = await lessonModel.allLessonByCourID(id);
      course.comments = await studentCourseModel.allByCourID(id);
      const rows = await studentCourseModel.singlePercentReview(id);
      course.reviews = rows[0];

      res.render("vwTeacherPages/vwCourses/detail", {
        title: "Chi tiết khóa học",
        layout: "main-teacher",
        course,
        empty: course.length === 0,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
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

router.post("/new-chapter", function (req, res) {
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

router.post("/new-lesson", function (req, res) {
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

router.post("/remove-chapter", function (req, res) {
  if (req.body.stt) {
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
  }
});

router.post("/remove-lesson", function (req, res) {
  if (req.body) {
    const chapStt = +req.body.stt;
    let chap = req.session.chapter;
    let rmLesson = +chap[chapStt - 1].chap_lesson - 1;
    chap[chapStt - 1].chap_lesson = rmLesson;
    req.session.chapter = chap;
    return res.json(true);
  }
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
                  const new_name = Date.now() + file.filename;
                  const new_path = dir + new_name;

                  fs.rename(old_path, new_path, function (err) {
                    if (err) {
                      console.log("Error in removing video:" + file.filename);
                    } else {
                      console.log("Removed " + file.filename);
                    }
                  });
                  new_lesson.LessLink = new_name;
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

router.get("/edit/:id", async function (req, res) {
  try {
    const id = +req.params.id;
    const c = await courseModel.single(id);
    if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
      res.redirect("/teacherpage/courses");
    } else {
      const course = await courseModel.singleWithDetails(id);
      course.chapters = await chapterModel.allChapterByCourID(id);
      course.lessons = await lessonModel.allLessonByCourID(id);
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
      res.render("vwTeacherPages/vwCourses/edit", {
        title: "Chỉnh sửa khóa học",
        layout: "main-teacher",
        course,
        categories,
        prices,
        empty: course.length === 0,
      });
    }
  } catch (error) {
    throw error;
  }
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/images/courses";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/edit",
  authTeacher,
  multer({ storage }).any(),
  async function (req, res) {
    if (req.body.id) {
      const id = +req.body.id;
      const c = await courseModel.single(id);
      if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
        res.redirect("/teacherpage/courses");
      }

      const entity = {
        CourID: id,
        CourName: req.body.cour_name,
        CourDesShort: req.body.cour_des,
        Finish: typeof req.body.finish === "undefined" ? false : true,
        FldID: +req.body.field,
        CourPrice: +req.body.price,
      };

      if (req.files && req.files.length) {
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

        fs.unlink("./public/images/courses/" + c.CourImgBg, function (err) {
          if (err) console.log("Xóa thất bại file " + c.CourImgBg);
        });
        fs.unlink("./public/images/courses/" + c.CourImgSm, function (err) {
          if (err) console.log("Xóa thất bại file " + c.CourImgsm);
        });

        entity.CourImgBg = req.files[0].filename;
        entity.CourImgSm = size + req.files[0].filename;
      }

      await courseModel.patch(entity);
    }
    res.redirect("/teacherpage/courses");
  }
);

router.get("/add-chap/:id", authTeacher, function (req, res) {
  const CourID = +req.params.id;
  res.render("vwTeacherPages/vwCourses/add-chap", {
    title: "Tạo chương mới",
    layout: "main-teacher",
    id: CourID,
  });
});

router.post("/add-lesson", function (req, res) {
  res.render("vwTeacherPages/vwCourses/add-less", {
    layout: false,
  });
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/videos/temp";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});

router.post(
  "/add-chap",
  authTeacher,
  multer({ storage }).any(),
  async function (req, res) {
    const CourID = +req.body.id;
    const new_chap = {
      ChapSTT: +req.body.chap_stt,
      ChapName: req.body.chap_name,
      CourID,
    };
    const ChapID = await chapterModel.add(new_chap);
    const lessons = JSON.parse(req.body.lessons);
    for (const lesson of lessons) {
      const new_lesson = {
        ChapID,
        LessName: lesson.less_name,
        LessSTT: lesson.less_stt,
        LessText: lesson.less_text,
        CourID,
      };

      if (req.files && req.files.length && lesson.less_link) {
        const dir = `./public/videos/${CourID}/${ChapID}/`;
        fs.mkdirSync(dir, { recursive: true });
        const files = req.files;
        for (const file of files) {
          const fn = `${req.body.chap_stt}_${lesson.less_stt}${path.extname(
            file.filename
          )}`;

          if (file.filename === fn) {
            const old_path = file.path;
            const new_name = Date.now() + file.filename;
            const new_path = dir + new_name;

            fs.rename(old_path, new_path, function (err) {
              if (err) {
                console.log("Error in removing video:" + file.filename);
              } else {
                console.log("Removed " + file.filename);
              }
            });
            new_lesson.LessLink = new_name;
          }
        }
      }
      await lessonModel.add(new_lesson);
    }

    fs.unlink("./public/videos/temp/", function (err) {
      if (err) console.log("Error in delete temp folder: " + err);
    });

    if (+req.body.return === 0) {
      res.render("vwTeacherPages/vwCourses/add-chap", {
        title: "Tạo chương mới",
        layout: "main-teacher",
        id: CourID,
      });
    } else {
      res.redirect("/teacherpage/courses/edit/" + CourID);
    }
  }
);

router.post("/edit-chap", authTeacher, async function (req, res) {
  try {
    const ChapID = +req.body.id;
    const chapter = await chapterModel.single(ChapID);
    const c = await courseModel.single(chapter.CourID);
    if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
      res.redirect("/teacherpage/courses");
    } else {
      const rows = await lessonModel.allLessonByChapID(chapter.ChapID);
      res.render("vwTeacherPages/vwCourses/edit-chap", {
        title: "Chỉnh sửa chương",
        layout: "main-teacher",
        chapter,
        lessons: rows,
      });
    }
  } catch (error) {
    throw error;
  }
});

router.post("/remove-video", authTeacher, async function (req, res) {
  if (req.body.id) {
    const LessID = +req.body.id;
    try {
      const lesson = await lessonModel.singleLink(LessID);
      res.redirect("/teacherpage/courses");
      fs.unlink(
        `./public/videos/${lesson.CourID}/${lesson.ChapID}/${lesson.LessLink}`,
        async function (err) {
          if (err) {
            console.log("Error in removing video " + LessLink);
            console.log(err);
            return res.json(false);
          } else {
            const entity = {
              LessID,
              LessLink: null,
            };
            await lessonModel.patch(entity);
            return res.json(true);
          }
        }
      );
    } catch (error) {
      console.log(error);
      return res.json(false);
    }
  }
  res.redirect("/teacherpage/courses");
});

storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/videos/temp";
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});

router.post(
  "/edit-chap-done",
  multer({ storage }).any(),
  async function (req, res) {
    try {
      const CourID = +req.body.courID;
      const ChapID = +req.body.chapID;

      const new_chap = {
        ChapSTT: +req.body.chap_stt,
        ChapName: req.body.chap_name,
        ChapID,
      };

      await chapterModel.patch(new_chap);

      const lessons = JSON.parse(req.body.lessons);
      for (const lesson of lessons) {
        const new_lesson = {
          LessName: lesson.less_name,
          LessSTT: lesson.less_stt,
          LessText: lesson.less_text,
        };

        if (req.files && req.files.length && lesson.less_link) {
          const dir = `./public/videos/${CourID}/${ChapID}/`;
          fs.mkdirSync(dir, { recursive: true });
          const files = req.files;
          for (const file of files) {
            const fn = `${req.body.chap_stt}_${lesson.less_stt}${path.extname(
              file.filename
            )}`;

            if (file.filename === fn) {
              const old_path = file.path;
              const new_name = Date.now() + file.filename;
              const new_path = dir + new_name;

              fs.rename(old_path, new_path, function (err) {
                if (err) {
                  console.log("Error in removing video:" + file.filename);
                } else {
                  console.log("Removed " + file.filename);
                }
              });
              new_lesson.LessLink = new_name;
              break;
            }
          }
        }

        if (lesson.less_id !== null) {
          new_lesson.LessID = +lesson.less_id;
          await lessonModel.patch(new_lesson);
        } else {
          new_lesson.CourID = CourID;
          new_lesson.ChapID = ChapID;
          await lessonModel.add(new_lesson);
        }
      }

      fs.unlink("./public/videos/temp/", function (err) {
        if (err) console.log("Error in delete temp folder: " + err);
      });

      res.redirect("/teacherpage/courses/edit/" + CourID);
    } catch (error) {
      throw error;
    }
  }
);

router.post("/delete-chapter", authTeacher, async function (req, res) {
  try {
    const ChapID = +req.body.id;
    const chapter = await chapterModel.single(ChapID);
    const c = await courseModel.single(chapter.CourID);
    if (c === null || +c.TeachID !== +res.locals.teacher.Id) {
      res.redirect("/teacherpage/courses");
    } else {
      const lessons = await lessonModel.allLessonByChapID(ChapID);
      lessons.forEach(async (lesson) => {
        if (lesson.LessLink) {
          fs.unlink(
            `./public/videos/${lesson.CourID}/${lesson.ChapID}/${lesson.LessLink}`,
            function (err) {
              if (err) console.log("Error in delete file: " + err);
            }
          );
        }
        await lessonModel.del(lesson.LessID);
      });
      await chapterModel.del(chapter);
      res.redirect("/teacherpage/courses/edit/" + chapter.CourID);
    }
  } catch (error) {
    throw error;
  }
});

router.post("/delete-lesson", authTeacher, async function (req, res) {
  try {
    const LessID = +req.body.id;
    const entity = { LessID };
    await lessonModel.del(entity);
    return res.json(true);
  } catch (error) {
    return res.json(false);
    throw err;
  }
});
module.exports = router;
